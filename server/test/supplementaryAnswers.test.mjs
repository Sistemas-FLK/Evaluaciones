import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=new URL('../dist/',import.meta.url).href;
const folder=mkdtempSync(join(tmpdir(),'quimi-supplements-'));
function run(code){const result=spawnSync(process.execPath,['--input-type=module','-e',`
 import assert from 'node:assert/strict';
 const {db}=await import(${JSON.stringify(root+'data/mockDatabase.js')});
 const {assessmentService:exam}=await import(${JSON.stringify(root+'services/assessmentService.js')});
 const {reviewService:review}=await import(${JSON.stringify(root+'services/reviewService.js')});
 const {saveSupplementaryAnswers:save}=await import(${JSON.stringify(root+'services/supplementaryAnswerService.js')});
 await db.ready;
 ${code}
`],{cwd:folder,encoding:'utf8',env:{...process.env,SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',SUPABASE_ANON_KEY:'',LOCAL_DATA_FILE:join(folder,'database.json')}});assert.equal(result.status,0,result.stderr);}
test('complementarias conservan originales, separan rúbricas, recalculan y sobreviven reinicio',()=>{
 run(`
  const created=await review.registerNewCandidate('Prueba complementarias','supplement@example.invalid');
  const id=created.candidate.id,a=created.assessment.id;
  await exam.startAssessment(a);
  for(const q of db.getQuestions())await exam.submitAnswer(a,q.id,q.question_type==='open_text'?{written_answer:'Original pregunta '+q.id}:{selected_option:db.getAnswerKey(q.id).correct_option});
  const original=JSON.stringify(db.getAnswer(a,2));
  await review.submitReviewerScore(db.getAnswer(a,2).id,'original','Evaluador original',{c1:1,c2:1,c3:1,c4:1},'Calificación original');
  const input={request_id:'a'.repeat(64),reviewer_id:'codex_chat',reviewer_name:'Revisión del chat',answers:[{question_id:2,text:'Complementaria sin cambiar el original',criterion_scores:{c1:0,c2:1,c3:3,c4:1},observation:'Motivo de nota'}]};
  await assert.rejects(save(id,{...input,answers:[{...input.answers[0],question_id:1}]}));
  await save(id,input);
  await save(id,input);
  assert.equal(JSON.stringify(db.getAnswer(a,2)),original);
  assert.equal(db.getSupplementaryAnswers(a,2).length,1);
  assert.equal(db.getEffectiveReviewerScores(db.getAnswer(a,2).id).length,1);
  assert.equal(db.getReviewerScoresByAnswer(db.getAnswer(a,2).id).length,2);
  assert.equal(db.getAssessmentById(a).manual_score,5);
  assert.equal(db.getAssessmentById(a).total_score,57);
  const detail=await review.getCandidateDetail(id);
  assert.equal(detail.questions_detail[1].original_reviews[0].total_points,4);
  assert.equal(detail.questions_detail[1].reviews[0].total_points,5);
  assert.equal(detail.questions_detail[1].reviews[0].reviewer_id,'codex_chat');
  assert.equal(detail.questions_detail[1].supplementary_answers[0].outside_time,true);
  await assert.rejects(save(id,{...input,answers:[{...input.answers[0],text:'Texto cambiado con la misma clave'}]}));
 `);
 run(`
  const c=db.getCandidateByEmail('supplement@example.invalid');
  const detail=await review.getCandidateDetail(c.id);
  assert.equal(detail.assessment.total_score,57);
  assert.equal(detail.questions_detail[1].candidate_answer.written_answer,'Original pregunta 2');
  assert.equal(detail.questions_detail[1].supplementary_answers[0].text,'Complementaria sin cambiar el original');
  assert.equal(detail.questions_detail[1].reviews[0].total_points,5);
 `);
});
