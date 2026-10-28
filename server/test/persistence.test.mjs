import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const database = new URL('../dist/data/mockDatabase.js', import.meta.url).href;
const service = new URL('../dist/services/assessmentService.js', import.meta.url).href;
const folder = mkdtempSync(join(tmpdir(), 'quimi-regression-'));
const file = join(folder, 'database.json');
function run(code) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    const {db} = await import(${JSON.stringify(database)});
    const {assessmentService: service} = await import(${JSON.stringify(service)});
    await db.ready;
    ${code}
  `], { cwd: folder, encoding: 'utf8', env: { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', SUPABASE_ANON_KEY: '', LOCAL_DATA_FILE: file } });
}
function success(code) { const result = run(code); assert.equal(result.status, 0, result.stderr); }
test('datos, avance, borradores y calificaciones sobreviven un proceso nuevo', () => {
  success(`
    await db.createCandidate({id:'test-candidate', full_name:'Prueba aislada', email:'test@example.invalid', created_at:new Date().toISOString()});
    await db.createAssessment({id:'test-exam',candidate_id:'test-candidate',status:'pending',current_question_index:1,objective_score:0,manual_score:0,total_score:0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
    await service.startAssessment('test-exam');
    await service.submitAnswer('test-exam',1,{selected_option:'A'});
    await service.saveDraft('test-exam',2,'Borrador persistente');
    await db.saveReviewerScore({id:'test-score',answer_id:'test-answer',reviewer_id:'test-reviewer',criterion_scores:{c1:3},total_points:3});
    await db.saveFinalReview({id:'test-review',assessment_id:'test-exam',justification:'Dictamen persistente'});
  `);
  success(`
    assert.equal(db.getCandidateById('test-candidate').full_name,'Prueba aislada');
    assert.equal(db.getAssessmentById('test-exam').current_question_index,2);
    const question = await service.getCurrentQuestion('test-exam');
    assert.equal(question.draft_answer,'Borrador persistente');
    assert.equal(question.question_started_at,db.getAssessmentById('test-exam').current_question_started_at);
    assert.equal(db.getReviewerScoresByAnswer('test-answer')[0].total_points,3);
    assert.equal(db.getFinalReview('test-exam').justification,'Dictamen persistente');
    const id = db.getAnswer('test-exam',2).id;
    await service.submitAnswer('test-exam',2,{written_answer:'Respuesta definitiva'});
    assert.equal(db.getAnswer('test-exam',2).id,id);
    await assert.rejects(service.saveDraft('test-exam',2,'Borrador tardío'));
    assert.equal(db.getAnswer('test-exam',2).written_answer,'Respuesta definitiva');
  `);
});
test('un archivo corrupto no se sobrescribe con datos iniciales', () => {
  writeFileSync(file,'archivo corrupto');
  assert.notEqual(run('').status,0);
  assert.equal(readFileSync(file,'utf8'),'archivo corrupto');
});

test('Supabase restaura dictámenes y rechaza escrituras fallidas sin modificar memoria', () => {
  const code = `
    import assert from 'node:assert/strict';
    globalThis.fetch = async (input, options) => {
      const url = new URL(typeof input === 'string' ? input : input.url || input);
      assert.ok(!url.pathname.includes('/rest/v1/rest/v1/'));
      if (options?.method && options.method !== 'GET') {
        return new Response(JSON.stringify({message:'fallo simulado'}),{status:500,headers:{'Content-Type':'application/json'}});
      }
      const tables = {
        candidates:[{id:'cloud-candidate',full_name:'Cloud'}],
        invitations:[], assessments:[], answers:[], reviewer_scores:[],
        final_reviews:[{assessment_id:'cloud-exam',justification:'Persistido en nube'}]
      };
      return new Response(JSON.stringify(tables[url.pathname.split('/').pop()] || []),{headers:{'Content-Type':'application/json'}});
    };
    const {db} = await import(${JSON.stringify(database)});
    await db.ready;
    assert.equal(db.initializationError,null);
    assert.equal(db.getCandidates().length,1);
    assert.equal(db.getFinalReview('cloud-exam').justification,'Persistido en nube');
    await assert.rejects(db.updateCandidate('cloud-candidate',{full_name:'No guardado'}));
    assert.equal(db.getCandidateById('cloud-candidate').full_name,'Cloud');
  `;
  const result=spawnSync(process.execPath,['--input-type=module','-e',code],{
    cwd:folder,encoding:'utf8',env:{...process.env,SUPABASE_URL:'https://test.example.invalid/rest/v1/',SUPABASE_SERVICE_ROLE_KEY:'test-key'}
  });
  assert.equal(result.status,0,result.stderr);
});
