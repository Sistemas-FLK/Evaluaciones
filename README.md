# QUIMICORP TALENT — Plataforma de Evaluación Comercial
### QUIMICORP PERÚ S.A.C. — Ejecutiva de Ventas, Captación Digital y E-commerce

Plataforma full-stack moderna, profesional, responsive y funcional para evaluar competencias comerciales, negociación consultiva, razonamiento numérico, ética comercial y estrategias de captación digital.

---

## 1. Credenciales y Accesos Iniciales Pre-configurados

### Portal de Candidatas
| Candidata | Correo Electrónico | Código de Invitación |
|---|---|---|
| **Esther Cruzado Albines** | `esther.cruzado@quimicorp-postulante.pe` | `ESTHER-QUIMI-2026` |
| **Geraldine Ruby** | `geraldine.ruby@quimicorp-postulante.pe` | `GERALDINE-QUIMI-2026` |

*El sistema cuenta además con un botón de auto-completado rápido para facilitar pruebas inmediatas durante llamadas de Google Meet.*

### Panel de Administración y Evaluadores
- **URL**: Haz clic en el botón superior **"Evaluador"** en la barra de navegación.
- **Clave de Acceso**: `admin123`
- **Roles de Evaluador Disponibles**:
  - `María` (Evaluadora Principal de Ventas)
  - `Segundo Evaluador` (Comité Comercial y E-commerce)

---

## 2. Arquitectura del Sistema

```text
quimicorp-talent/
├── package.json                   # Scripts para arrancar client y server
├── .env.example                   # Variables de entorno
├── supabase/
│   ├── schema.sql                 # DDL de tablas PostgreSQL, RLS e índices
│   └── seed.sql                   # Banco de 10 preguntas, claves y candidatas iniciales
├── server/                        # Backend API (Node.js / Express + TypeScript)
│   ├── src/
│   │   ├── config/supabase.ts     # Cliente Supabase PostgreSQL con reporte transparente
│   │   ├── data/                  # Datos iniciales y repositorio con auditoría
│   │   ├── services/              # Motor de evaluación, timestamps y calificaciones
│   │   ├── routes/                # Rutas /api/candidate, /api/assessment, /api/admin
│   │   └── index.ts               # Servidor Express (Puerto 5000)
│   └── package.json
└── client/                        # Frontend (React 19 + Vite + Tailwind CSS + Lucide)
    ├── src/
    │   ├── components/            # Portal candidata y Panel evaluador
    │   ├── services/api.ts        # Cliente API REST
    │   ├── App.tsx                # Integración completa
    │   └── index.css              # Identidad visual QUIMICORP (#08265C / #2563EB)
    ├── vite.config.ts             # Proxy hacia backend en :5000
    └── package.json
```

---

## 3. Instrucciones de Ejecución Local

### 1. Iniciar el Servidor Backend:
```bash
cd server
npm install
npm run dev
```
*El backend escuchará en `http://localhost:5000`.*

### 2. Iniciar el Cliente Frontend:
```bash
cd client
npm install
npm run dev
```
*El frontend estará disponible en `http://localhost:3000`.*

---

## 4. Conexión con Supabase PostgreSQL

La plataforma incluye los scripts listos para producción en la carpeta `supabase/`:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** y ejecuta en orden:
   - `supabase/schema.sql` (Crea tablas normalizadas, restricciones, índices y políticas RLS).
   - `supabase/seed.sql` (Carga las 10 preguntas oficiales, rúbricas seguras y las 2 candidatas).
3. En el archivo `server/.env` (o `.env` raíz), configura:
   ```env
   PORT=5000
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-secreta
   ADMIN_SECRET_KEY=admin123
   ```
4. Reinicia el servidor. La plataforma detectará la conexión y cambiará la insignia superior de **"Modo Contingencia"** a **"Supabase Conectado"**.

*Nota de Transparencia:* Si las credenciales de Supabase no se configuran, la aplicación opera en modo de contingencia local sin simular datos falsos ni interrumpir la evaluación de la candidata.

---

## 5. Características Clave Implementadas

1. **Seguridad Total:** Las respuestas correctas y los criterios de puntuación nunca se envían al navegador de la candidata.
2. **Motor de Tiempo Anti-Manipulación:** Control de segundos en el servidor; alertas en color **naranja** al restar 15s y avance forzoso en **rojo** a los 0s.
3. **Auto-Guardado Continuo:** Respuestas abiertas protegidas en tiempo real contra desconexiones o recargas del navegador.
4. **Calificación Dual (María y 2do Evaluador):** Sistema de rúbricas de 0 a 3 puntos por criterio con detección de discrepancias para facilitar el consenso.
5. **Comparativa y Dictamen:** Gráficos de competencias, velocidad vs. precisión y selector colegiado de recomendación con justificación.
6. **Exportación:** Descarga en formato CSV y vista ejecutiva para impresión / guardado en PDF con membrete oficial de QUIMICORP PERÚ S.A.C.
