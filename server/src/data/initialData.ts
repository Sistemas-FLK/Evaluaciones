import { Question, AnswerKey, Candidate, Invitation, Assessment } from '../types.js';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    position: 1,
    category: 'Atención y Oportunidad de Venta',
    question_type: 'multiple_choice',
    statement: 'Un cliente escribe por WhatsApp preguntando por el precio de un producto de limpieza y comenta que posiblemente necesite 20 unidades.\n\n¿Cuál sería la respuesta comercial más adecuada?',
    situation: 'Atención de lead inbound por WhatsApp para producto de limpieza con potencial volumen.',
    options: [
      { id: 'A', text: 'Enviar únicamente el enlace al catálogo y esperar.' },
      { id: 'B', text: 'Confirmar el producto y la presentación, proporcionar el precio correspondiente y consultar la cantidad definitiva y el lugar de entrega para avanzar con la cotización.' },
      { id: 'C', text: 'Ofrecer inmediatamente el mayor descuento posible.' },
      { id: 'D', text: 'Pedirle que vuelva a escribir cuando esté completamente decidido.' }
    ],
    time_limit_seconds: 60,
    max_points: 8.00
  },
  {
    id: 2,
    position: 2,
    category: 'Negociación bajo Presión',
    question_type: 'open_text',
    statement: '¿Qué le responderías para intentar conservar al cliente y avanzar hacia el cierre de la venta?',
    situation: 'Eres ejecutiva de ventas de QUIMICORP. Un cliente quiere comprar productos al por mayor. Nuestra cotización es de S/ 1,200, pero otro proveedor le ofrece aparentemente lo mismo por S/ 1,050. El cliente responde: "Si no me mejoras el precio, compro en otro lado".',
    time_limit_seconds: 90,
    max_points: 12.00
  },
  {
    id: 3,
    position: 3,
    category: 'Captación de Clientes en Redes Sociales',
    question_type: 'open_text',
    statement: '¿Qué tres acciones concretas realizarías durante los próximos siete días para intentar conseguir esas consultas?',
    situation: 'QUIMICORP tiene una tienda virtual y cuentas de Facebook, Instagram y TikTok con pocos seguidores. No hay presupuesto para publicidad pagada durante la siguiente semana. Gerencia solicita generar al menos 10 consultas de potenciales compradores.',
    time_limit_seconds: 120,
    max_points: 12.00
  },
  {
    id: 4,
    position: 4,
    category: 'Razonamiento Numérico y Conversión',
    question_type: 'multiple_choice',
    statement: 'Una tienda virtual recibe 400 visitas y consigue 12 compras.\n\n¿Cuál es la tasa de conversión de visitas en compras?',
    situation: 'Medición de efectividad en comercio electrónico.',
    options: [
      { id: 'A', text: '0.3%' },
      { id: 'B', text: '3%' },
      { id: 'C', text: '12%' },
      { id: 'D', text: '30%' }
    ],
    time_limit_seconds: 75,
    max_points: 10.00
  },
  {
    id: 5,
    position: 5,
    category: 'Cálculo Comercial',
    question_type: 'multiple_choice',
    statement: 'Un producto tiene un costo de S/ 80 y un precio de venta de S/ 120. La empresa autoriza un descuento del 10% sobre el precio de venta. Sin considerar IGV ni otros gastos, ¿cuál sería la ganancia bruta por unidad después del descuento?',
    situation: 'Cálculo de márgenes unitarios bajo política de descuentos comerciales.',
    options: [
      { id: 'A', text: 'S/ 40' },
      { id: 'B', text: 'S/ 32' },
      { id: 'C', text: 'S/ 28' },
      { id: 'D', text: 'S/ 12' }
    ],
    time_limit_seconds: 75,
    max_points: 10.00
  },
  {
    id: 6,
    position: 6,
    category: 'Priorización y Toma de Decisiones',
    question_type: 'multiple_choice',
    statement: '¿Cuál es la mejor decisión inicial ante esta situación operativa?',
    situation: 'Son las 11:00 a. m. y recibes simultáneamente estas tareas:\n• Un cliente que ya pagó informa que su pedido presenta un problema de entrega.\n• Un cliente potencial solicita una cotización para comprar al por mayor.\n• Tienes una publicación promocional pendiente para redes sociales.',
    options: [
      { id: 'A', text: 'Terminar la publicación y atender los mensajes al finalizar.' },
      { id: 'B', text: 'Revisar y gestionar inmediatamente el problema del pedido pagado, responder oportunamente al cliente interesado para no perderlo y organizar después la publicación.' },
      { id: 'C', text: 'Ignorar las consultas hasta que el supervisor indique qué hacer.' },
      { id: 'D', text: 'Enviar mensajes automáticos y considerar todas las tareas terminadas.' }
    ],
    time_limit_seconds: 75,
    max_points: 8.00
  },
  {
    id: 7,
    position: 7,
    category: 'Ética Publicitaria y Responsabilidad',
    question_type: 'multiple_choice',
    statement: 'Debes crear una publicidad para un producto químico de limpieza. Alguien propone anunciar: "Elimina el 100% de las bacterias". Sin embargo, no existe información técnica disponible que respalde esa afirmación.\n\n¿Qué harías?',
    situation: 'Manejo de aserciones comerciales y cumplimiento normativo en productos químicos.',
    options: [
      { id: 'A', text: 'Publicarlo porque es una frase comercial atractiva.' },
      { id: 'B', text: 'Publicarlo con letras pequeñas indicando que es publicidad.' },
      { id: 'C', text: 'Solicitar documentación y autorización para verificar la afirmación y utilizar únicamente beneficios sustentados.' },
      { id: 'D', text: 'Copiar la publicidad de un competidor.' }
    ],
    time_limit_seconds: 60,
    max_points: 8.00
  },
  {
    id: 8,
    position: 8,
    category: 'Recuperación de una Venta',
    question_type: 'open_text',
    statement: 'Redacta exactamente el mensaje de WhatsApp que le enviarías para intentar recuperar la venta, sin ser insistente ni invasiva.',
    situation: 'Un cliente que aceptó recibir comunicaciones comerciales consultó por un producto de limpieza, pidió el enlace del e-commerce y dejó su compra pendiente. Han pasado 24 horas.',
    time_limit_seconds: 90,
    max_points: 12.00
  },
  {
    id: 9,
    position: 9,
    category: 'Creatividad y Contenido Comercial',
    question_type: 'open_text',
    statement: 'Escribe un guion breve que incluya una frase inicial llamativa, qué mostrarías del producto y cómo invitarías al cliente a solicitar información o comprar.\n\n(No inventes propiedades técnicas del producto).',
    situation: 'QUIMICORP necesita promocionar un producto de limpieza dirigido a pequeños negocios y compradores mayoristas. Tienes que preparar un video de 15 segundos para TikTok o Instagram Reels.',
    time_limit_seconds: 120,
    max_points: 12.00
  },
  {
    id: 10,
    position: 10,
    category: 'Análisis de Resultados Comerciales',
    question_type: 'multiple_choice',
    statement: 'Durante una jornada se recibieron 10 consultas en WhatsApp. De ellas, cuatro fueron identificadas como oportunidades comerciales calificadas y dos de esas cuatro terminaron en compras.\n\n¿Cuál fue la tasa de conversión de oportunidades calificadas en ventas?',
    situation: 'Embudo de ventas y conversión sobre leads calificados.',
    options: [
      { id: 'A', text: '20%' },
      { id: 'B', text: '40%' },
      { id: 'C', text: '50%' },
      { id: 'D', text: '80%' }
    ],
    time_limit_seconds: 75,
    max_points: 8.00
  }
];

export const INITIAL_ANSWER_KEYS: AnswerKey[] = [
  {
    question_id: 1,
    correct_option: 'B',
    scoring_metadata: { type: 'objective', points: 8 },
    explanation: 'La opción B confirma datos clave para cotizar y cerrar de forma consultiva.'
  },
  {
    question_id: 2,
    scoring_metadata: {
      type: 'rubric',
      criteria: [
        { id: 'c1', name: 'Investiga las necesidades del cliente', max: 3 },
        { id: 'c2', name: 'Compara condiciones y beneficios reales (calidad, concentración, entrega)', max: 3 },
        { id: 'c3', name: 'Propone una negociación o siguiente paso concreto', max: 3 },
        { id: 'c4', name: 'Mantiene profesionalismo y no promete descuentos no autorizados', max: 3 }
      ]
    },
    explanation: 'Evalúa negociación consultiva bajo presión de precio.'
  },
  {
    question_id: 3,
    scoring_metadata: {
      type: 'rubric',
      criteria: [
        { id: 'c1', name: 'Identificación del público objetivo relevante', max: 3 },
        { id: 'c2', name: 'Acciones orgánicas concretas y viables en 7 días', max: 3 },
        { id: 'c3', name: 'Estrategia para llevar interesados a WhatsApp o e-commerce', max: 3 },
        { id: 'c4', name: 'Indicadores para medir los resultados', max: 3 }
      ]
    },
    explanation: 'Evalúa estrategia orgánica de captación sin presupuesto de pauta publicitaria.'
  },
  {
    question_id: 4,
    correct_option: 'B',
    scoring_metadata: { type: 'objective', points: 10 },
    explanation: 'Fórmula: (12 / 400) × 100 = 3%.'
  },
  {
    question_id: 5,
    correct_option: 'C',
    scoring_metadata: { type: 'objective', points: 10 },
    explanation: 'Precio: S/ 108. Ganancia bruta: S/ 108 - S/ 80 = S/ 28.'
  },
  {
    question_id: 6,
    correct_option: 'B',
    scoring_metadata: { type: 'objective', points: 8 },
    explanation: 'Prioriza reclamo pagado crítico, responde al lead nuevo para no enfriarlo y luego programa el post.'
  },
  {
    question_id: 7,
    correct_option: 'C',
    scoring_metadata: { type: 'objective', points: 8 },
    explanation: 'Exige verificar técnicamente antes de lanzar promesas no sustentadas legalmente.'
  },
  {
    question_id: 8,
    scoring_metadata: {
      type: 'rubric',
      criteria: [
        { id: 'c1', name: 'Mensaje personalizado y tono profesional', max: 3 },
        { id: 'c2', name: 'Identificación de dudas o barreras de compra', max: 3 },
        { id: 'c3', name: 'Propuesta de siguiente paso o llamada a la acción', max: 3 },
        { id: 'c4', name: 'Respeto por el cliente y ausencia de presión indebida', max: 3 }
      ]
    },
    explanation: 'Evalúa seguimiento respetuoso y no invasivo a compras pendientes.'
  },
  {
    question_id: 9,
    scoring_metadata: {
      type: 'rubric',
      criteria: [
        { id: 'c1', name: 'Gancho inicial atractivo (primeros 3 segundos)', max: 3 },
        { id: 'c2', name: 'Mensaje dirigido al comprador correcto (negocios/mayoristas)', max: 3 },
        { id: 'c3', name: 'Beneficio relevante y verificable', max: 3 },
        { id: 'c4', name: 'Llamada a la acción comercial clara', max: 3 }
      ]
    },
    explanation: 'Evalúa síntesis comercial y creatividad para video corto en redes.'
  },
  {
    question_id: 10,
    correct_option: 'C',
    scoring_metadata: { type: 'objective', points: 8 },
    explanation: 'Fórmula: (2 / 4) × 100 = 50% de conversión sobre leads calificados.'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Esther Cruzado Albines',
    email: 'esther.cruzado@quimicorp-postulante.pe',
    phone: '+51 987 654 321',
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Geraldine Ruby',
    email: 'geraldine.ruby@quimicorp-postulante.pe',
    phone: '+51 912 345 678',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    candidate_id: '11111111-1111-1111-1111-111111111111',
    access_code: 'ESTHER-QUIMI-2026',
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    candidate_id: '22222222-2222-2222-2222-222222222222',
    access_code: 'GERALDINE-QUIMI-2026',
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    candidate_id: '11111111-1111-1111-1111-111111111111',
    invitation_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'pending',
    current_question_index: 1,
    objective_score: 0,
    manual_score: 0,
    total_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    candidate_id: '22222222-2222-2222-2222-222222222222',
    invitation_id: 'a2222222-2222-2222-2222-222222222222',
    status: 'pending',
    current_question_index: 1,
    objective_score: 0,
    manual_score: 0,
    total_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
