import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = new URL('../dist/', import.meta.url).href;
const folder = mkdtempSync(join(tmpdir(), 'quimi-management-'));
function run(code) {
 const result=spawnSync(process.execPath,['--input-type=module','-e',`
  import assert from 'node:assert/strict';
  const {db}=await import(${JSON.stringify(root+'data/mockDatabase.js')});
  const {candidateManagementService:manage}=await import(${JSON.stringify(root+'services/candidateManagementService.js')});
  const {assessmentService:exam}=await import(${JSON.stringify(root+'services/assessmentService.js')});
  const {reviewService:review}=await import(${JSON.stringify(root+'services/reviewService.js')});
  await db.ready;
  ${code}
 `],{cwd:folder,encoding:'utf8',env:{...process.env,SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',SUPABASE_ANON_KEY:'',LOCAL_DATA_FILE:join(folder,'database.json')}});
 assert.equal(result.status,0,result.stderr);
}
test('CRUD, asistencia y bloqueo de sesiones conservan respuestas y sobreviven un reinicio',()=>{
 run(`
  const created=await review.registerNewCandidate('Prueba Gestión','management@example.invalid');
  const id=created.candidate.id, assessmentId=created.assessment.id, code=created.invitation.access_code;
  assert.ok(code.startsWith('PRUEBA-QUIMI-'));
  await manage.edit(id,{full_name:'  Prueba Editada  ',email:' MANAGEMENT@example.invalid ',phone:'12345'},'QA');
  assert.equal(db.getCandidateById(id).full_name,'Prueba Editada');
  assert.equal(db.getCandidateById(id).email,'management@example.invalid');
  await assert.rejects(manage.edit(id,{full_name:'A',email:'bad'},'QA'));
  await assert.rejects(manage.edit(id,{full_name:'Valida',email:db.getCandidates()[0].email},'QA'));
  await assert.rejects(manage.remove(id,'','QA'));
  await assert.rejects(manage.participation(id,'incomplete','No inició la prueba','QA'));
  await manage.participation(id,'no_show','No asistió a la cita de prueba','QA');
  assert.equal((await review.getOverview()).candidates.find(c=>c.candidate_id===id).status,'no_show');
  assert.equal((await review.getOverview()).kpis.no_show,1);
  assert.equal((await exam.lookupInvitationCode(code)).found,false);
  await assert.rejects(exam.validateInvitation(code));
  await assert.rejects(exam.startAssessment(assessmentId));
  await manage.participation(id,'active','Se corrigió el registro de prueba','QA');
  await exam.startAssessment(assessmentId);
  await exam.submitAnswer(assessmentId,1,{selected_option:'B'});
  await exam.saveDraft(assessmentId,2,'Borrador a conservar');
  await assert.rejects(manage.participation(id,'no_show','Ya había empezado','QA'));
  await manage.participation(id,'incomplete','Se retiró de la prueba ficticia','QA');
  await assert.rejects(exam.getCurrentQuestion(assessmentId));
  await assert.rejects(exam.submitAnswer(assessmentId,2,{written_answer:'No guardar'}));
  await assert.rejects(exam.saveDraft(assessmentId,2,'No guardar'));
  await manage.remove(id,'Eliminar registro ficticio','QA');
  const overview=await review.getOverview();
  assert.ok(!overview.candidates.some(c=>c.candidate_id===id));
  assert.ok(overview.deleted_candidates.some(c=>c.candidate_id===id));
  assert.ok(!(await review.exportCSV()).includes('management@example.invalid'));
  assert.equal(db.getAnswer(assessmentId,1).selected_option,'B');
  assert.equal(db.getAnswer(assessmentId,2).draft_answer,'Borrador a conservar');
 `);
 run(`
  const c=db.getCandidateByEmail('management@example.invalid');
  const a=db.getAssessmentByCandidateId(c.id);
  assert.equal(db.getCandidateAdministrativeState(c.id).deleted,true);
  assert.equal(db.getCandidateAdministrativeState(c.id).participation,'incomplete');
  assert.equal(db.getCandidateAdministrativeState(c.id).participation_changed_by,'QA');
  assert.equal(db.getAnswer(a.id,2).draft_answer,'Borrador a conservar');
  await manage.restore(c.id,'Restaurar registro de prueba','QA');
  assert.equal(db.getCandidateAdministrativeState(c.id).deleted,false);
  await assert.rejects(exam.startAssessment(a.id));
  await manage.participation(c.id,'active','Reabrir después de la prueba','QA');
  const question=await exam.getCurrentQuestion(a.id);
  assert.equal(question.question.id,2);
  assert.equal(question.draft_answer,'Borrador a conservar');
  assert.equal(db.getAnswer(a.id,1).selected_option,'B');
 `);
});
