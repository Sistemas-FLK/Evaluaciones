$base = "http://localhost:5000/api"

Write-Host "=== 1. Validando postulante Esther Cruzado ==="
$val = Invoke-RestMethod -Uri "$base/candidate/validate" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"code":"ESTHER-QUIMI-2026","accept_privacy":true}'
Write-Host "Candidata:" $val.candidate.full_name "Assessment ID:" $val.assessment.id

Write-Host "`n=== 2. Iniciando evaluación cronometrada ==="
$start = Invoke-RestMethod -Uri "$base/candidate/start" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{assessment_id=$val.assessment.id} | ConvertTo-Json)
Write-Host "Pregunta actual:" $start.current_question_index "Tiempo restante:" $start.time_remaining_seconds "segundos"

Write-Host "`n=== 3. Respondiendo Pregunta 1 (Opción B) ==="
$sub1 = Invoke-RestMethod -Uri "$base/assessment/$($val.assessment.id)/submit" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"question_id":1,"selected_option":"B","client_elapsed_seconds":15}'
Write-Host "Respuesta enviada. Pregunta siguiente:" $sub1.current_question_index

Write-Host "`n=== 4. Guardando borrador en Pregunta 2 ==="
$draft = Invoke-RestMethod -Uri "$base/assessment/$($val.assessment.id)/draft" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"question_id":2,"draft_text":"Estimado cliente, comprendo la diferencia de cotización. En QUIMICORP garantizamos..."}'
Write-Host "Borrador auto-guardado correctamente."

Write-Host "`n=== 5. Respondiendo Pregunta 2 (Texto abierto) ==="
$sub2 = Invoke-RestMethod -Uri "$base/assessment/$($val.assessment.id)/submit" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"question_id":2,"written_answer":"Estimado cliente, comprendo la diferencia de cotización. En QUIMICORP garantizamos certificación técnica de concentración activa, entrega en 24 horas y soporte post-venta. ¿Qué presentación y volumen específico requiere para verificar si podemos ofrecerle una escala de volumen?","client_elapsed_seconds":42}'
Write-Host "Respuesta abierta guardada. Pregunta siguiente:" $sub2.current_question_index

Write-Host "`n=== 6. Login de Evaluadora María ==="
$login = Invoke-RestMethod -Uri "$base/admin/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"key":"admin123","reviewer_name":"María"}'
$token = $login.token
Write-Host "Login exitoso. Token obtenido para María."

Write-Host "`n=== 7. Consultando detalle de candidata para calificar ==="
$detail = Invoke-RestMethod -Uri "$base/admin/candidate/$($val.candidate.id)" -Headers @{Authorization=$token}
$ansP2 = $detail.questions_detail | Where-Object { $_.question.id -eq 2 }
Write-Host "Respuesta registrada en P2:" $ansP2.candidate_answer.written_answer

Write-Host "`n=== 8. Calificando Pregunta 2 con rúbrica de 4 criterios (0 a 3) ==="
$score = Invoke-RestMethod -Uri "$base/admin/score" -Method POST -Headers @{"Content-Type"="application/json"; Authorization=$token} -Body (@{
    answer_id = $ansP2.candidate_answer.id
    reviewer_id = "maria_evaluadora"
    reviewer_name = "María"
    criterion_scores = @{ c1=3; c2=3; c3=3; c4=3 }
    observation = "Excelente manejo consultivo, no regala descuentos sin autorización e investiga la necesidad real."
} | ConvertTo-Json)
Write-Host "Puntaje asignado en P2:" $score.score.total_points "de 12 puntos."

Write-Host "`n=== 9. Verificando resumen actualizado ==="
$overview = Invoke-RestMethod -Uri "$base/admin/overview" -Headers @{Authorization=$token}
$esther = $overview.candidates | Where-Object { $_.full_name -like "*Esther*" }
Write-Host "Esther -> Puntaje Auto:" $esther.objective_score "/ 52 | Puntaje Manual:" $esther.manual_score "/ 48 | Total:" $esther.total_score "/ 100"

Write-Host "`n=== 10. Probando exportación CSV ==="
$csv = Invoke-RestMethod -Uri "$base/admin/export/csv" -Headers @{Authorization=$token}
Write-Host "Líneas CSV exportadas:" ($csv -split "`n").Count
