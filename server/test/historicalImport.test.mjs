import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = new URL('../dist/', import.meta.url).href;
const folder = mkdtempSync(join(tmpdir(), 'quimi-history-'));
function run(code) {
  const result=spawnSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    const {db}=await import(${JSON.stringify(root+'data/mockDatabase.js')});
    const {importHistoricalEvaluation:importReport}=await import(${JSON.stringify(root+'services/historicalImport.js')});
    const {reviewService}=await import(${JSON.stringify(root+'services/reviewService.js')});
    await db.ready;
    ${code}
  `],{cwd:folder,encoding:'utf8',env:{...process.env,SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',SUPABASE_ANON_KEY:'',LOCAL_DATA_FILE:join(folder,'database.json')}});
  assert.equal(result.status,0,result.stderr);
}
test('importación histórica conserva preguntas originales, notas, fecha y no duplica al repetir o reiniciar',()=>{
 run(`
  const candidate=db.getCandidates()[0];
  const assessment=db.getAssessmentByCandidateId(candidate.id);
  const invitation=Array.from(db.invitations.values()).find(i=>i.candidate_id===candidate.id);
  const payload={access_code:invitation.access_code,candidate_name:candidate.full_name,source_file:'fixture.xlsx',source_sha256:'0'.repeat(64),evaluation_date:'2026-10-21',original_verdict:'Recomendada (fixture)',recommendation:'Recomendada',objective_score:52,manual_score:48,total_score:100,
   questions:db.getQuestions().map(q=>({question:q.id===9?{...q,category:'Reclamo histórico',statement:'Gestionar una devolución original'}:q,answer_key:db.getAnswerKey(q.id),points:q.max_points,...(q.question_type==='multiple_choice'?{selected_option:db.getAnswerKey(q.id).correct_option}:{written_answer:'Respuesta ficticia del archivo',criterion_scores:{c1:3,c2:3,c3:3,c4:3},observation:'Nota original'})}))};
  await assert.rejects(importReport({...payload,total_score:99}));
  assert.equal(db.getAnswersByAssessment(assessment.id).length,0);
  await importReport(payload);
  assert.equal(db.getAssessmentById(assessment.id).status,'graded');
  assert.equal(db.getAssessmentById(assessment.id).total_score,100);
  assert.equal(db.getAnswersByAssessment(assessment.id).length,10);
  assert.equal((await importReport(payload)).already_imported,true);
  const detail=await reviewService.getCandidateDetail(candidate.id);
  assert.equal(detail.questions_detail[8].question.statement,'Gestionar una devolución original');
  assert.equal(db.getQuestionById(9).category,'Creatividad y Contenido Comercial');
  assert.equal(detail.final_review.final_scores.historical_import.timing_available,false);
  await assert.rejects(importReport({...payload,source_sha256:'1'.repeat(64)}));
 `);
 run(`
  const candidate=db.getCandidates()[0];
  const detail=await reviewService.getCandidateDetail(candidate.id);
  assert.equal(detail.assessment.total_score,100);
  assert.equal(detail.questions_detail[8].question.statement,'Gestionar una devolución original');
  assert.equal(detail.questions_detail[8].reviews[0].total_points,12);
  assert.equal(detail.final_review.final_scores.historical_import.evaluation_date,'2026-10-21');
 `);
});
