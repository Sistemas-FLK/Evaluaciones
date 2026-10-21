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
    explanation: 'Evalúa negociación consultiva bajo presión de precio.',
    benchmark_guide: {
      ideal_approach: 'Indagar amablemente qué producto/concentración le ofrecen por S/ 1,050. Defender el valor QUIMICORP (fórmula concentrada certificada con ficha técnica, mayor rendimiento por dilución, entrega puntual y factura con garantía de lote). Plantear alternativas comerciales (escala por volumen, muestra o despacho) sin regalar margen de golpe.',
      sample_answer: 'Hola estimado, entiendo perfectamente que busque optimizar sus costos. Para comparar bajo igualdad de condiciones, ¿qué concentración y presentación le están cotizando? En QUIMICORP garantizamos productos con registro sanitario y ficha técnica que rinden hasta el doble por dilución, además de entrega inmediata sin costo en su local. Si me confirma un pedido para entrega mensual, con gusto puedo coordinar con gerencia una escala preferencial o enviarle una muestra sin costo para que verifique el rendimiento real.',
      key_strengths: [
        'Mantiene la calma y no cede el descuento en pánico',
        'Investiga especificaciones para comparar justamente',
        'Argumenta rendimiento por litro, calidad certificada y servicio de entrega',
        'Propone una alternativa constructiva (escala por volumen o muestra)'
      ],
      red_flags: [
        'Bajar el precio a S/ 1,050 de inmediato sin autorización',
        'Descalificar o insultar al competidor',
        'Responder de forma cortante con un simple "ese es nuestro precio"'
      ]
    }
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
    explanation: 'Evalúa estrategia orgánica de captación sin presupuesto de pauta publicitaria.',
    benchmark_guide: {
      ideal_approach: 'Proponer 3 acciones orgánicas realizables en 7 días sin costo de pauta: 1) Prospección B2B directa a negocios afines (restaurantes, talleres, hoteles), 2) Videos de demostración visual (antes y después) en TikTok e Instagram Reels, 3) Publicación activa en comunidades y grupos comerciales de Facebook/WhatsApp, con enlace al catálogo virtual.',
      sample_answer: '1. Prospección directa en frío: Contactar 15 negocios locales al día vía WhatsApp/llamada (restaurantes, colegios, lavanderías) ofreciendo cotización mayorista o kit de prueba.\n2. Videos demostrativos antes/después: Publicar en TikTok e Instagram Reels casos reales de limpieza pesada mostrando el poder desengrasante, invitando a comentar "INFO" para enviar enlace del catálogo.\n3. Comunidades y grupos B2B: Publicar paquetes mayoristas con precio de fábrica en grupos de comerciantes y ferreterías en Facebook y WhatsApp, midiendo diariamente los leads que ingresan.',
      key_strengths: [
        'Propone 3 acciones concretas y viables en el plazo de 7 días',
        'Respeta estrictamente el presupuesto cero (no exige pauta pagada)',
        'Estrategia clara para llevar a los interesados a WhatsApp o la web',
        'Menciona métricas de seguimiento (consultas por día)'
      ],
      red_flags: [
        'Pedir pagar publicidad en Facebook Ads o contratar influencers',
        'Generalidades vagas como "subir historias" o "hacer sorteos"',
        'No orientar el contenido a captar clientes comerciales'
      ]
    }
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
    explanation: 'Evalúa seguimiento respetuoso y no invasivo a compras pendientes.',
    benchmark_guide: {
      ideal_approach: 'Mensaje empático y personalizado saludando por su nombre. Ofrece asistencia técnica para resolver dudas sobre la presentación, métodos de pago o entrega, sin hostigar ni sonar desesperado.',
      sample_answer: '¡Hola, estimado [Nombre]! Te saluda [Nombre] de QUIMICORP. Vi que ayer estuviste consultando por nuestro [Nombre del Producto] en la tienda virtual y dejaste tu orden pendiente. Quería consultar si tuviste alguna duda con la pasarela de pago o si necesitas que te ayude a coordinar el envío directo a tu negocio. Quedo a tu completa disposición para ayudarte.',
      key_strengths: [
        'Personalización con el nombre del cliente y tono cálido',
        'Disposición genuina de ayuda en vez de presión agresiva',
        'Identifica posibles barreras (pago, flete, ficha técnica)',
        'Cierre abierto y profesional acorde a la imagen de QUIMICORP'
      ],
      red_flags: [
        'Mensajes de reclamo como "¿Por qué no completó su compra?"',
        'Falsas amenazas de urgencia ("apúrese que se acaba")',
        'Enviar solo el enlace de pago sin ningún mensaje consultivo'
      ]
    }
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
    explanation: 'Evalúa síntesis comercial y creatividad para video corto en redes.',
    benchmark_guide: {
      ideal_approach: 'Estructura ágil para 15 segundos: Gancho en los primeros 3 segundos enfocado en el dolor del negocio, solución con el producto QUIMICORP en 4-10 segundos destacando rendimiento y ahorro por litro, y llamado a la acción comercial en 11-15 segundos sin promesas falsas.',
      sample_answer: '[0-3s Gancho]: "¿Tienes un negocio y gastas demasiado en productos de limpieza que no rinden?" (mostrando suciedad pesada en cocina o taller).\n[4-10s Solución]: "En QUIMICORP fabricamos desengrasantes y desinfectantes concentrados al por mayor. Rinden hasta el triple y ahorras hasta 35% por litro con entrega directa a tu local."\n[11-15s CTA]: "Escríbenos al enlace de nuestro perfil y solicita tu cotización mayorista hoy mismo."',
      key_strengths: [
        'Gancho contundente en los primeros 3 segundos',
        'Enfocado en compradores mayoristas y negocios',
        'Beneficio económico y de rendimiento real sin inventar propiedades',
        'Llamado a la acción (CTA) directo al WhatsApp o tienda'
      ],
      red_flags: [
        'Afirmar que "elimina el 100% de bacterias y virus para siempre"',
        'Iniciar con logos corporativos o música lenta sin gancho',
        'No incluir llamado a cotizar o comprar'
      ]
    }
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
    status: 'submitted',
    current_question_index: 10,
    objective_score: 52.00,
    manual_score: 46.00,
    total_score: 98.00,
    started_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 2400000).toISOString(),
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

export const INITIAL_ANSWERS: Answer[] = [
  {
    id: 'ans_11111111_1',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 1,
    selected_option: 'B',
    started_at: new Date(Date.now() - 3500000).toISOString(),
    submitted_at: new Date(Date.now() - 3470000).toISOString(),
    elapsed_seconds: 30,
    timed_out: false,
    objective_points: 8.00
  },
  {
    id: 'ans_11111111_2',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 2,
    written_answer: 'Hola estimado cliente, entiendo que busque optimizar sus costos. Para comparar en igualdad de condiciones, ¿qué presentación y concentración le están cotizando? En QUIMICORP garantizamos productos industriales con registro sanitario y ficha técnica que rinden hasta el doble por dilución, con despacho directo a su local. Si me confirma un pedido para entrega mensual, con gusto puedo coordinar con gerencia una escala preferencial de volumen o enviarle una muestra sin costo para que verifique el rendimiento real.',
    started_at: new Date(Date.now() - 3400000).toISOString(),
    submitted_at: new Date(Date.now() - 3328000).toISOString(),
    elapsed_seconds: 72,
    timed_out: false,
    objective_points: 0
  },
  {
    id: 'ans_11111111_3',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 3,
    written_answer: '1. Prospección directa en frío: Contactar 15 negocios locales al día (restaurantes, colegios, lavanderías) ofreciéndoles el catálogo mayorista con precios de fábrica o kit de prueba.\n2. Videos demostrativos antes y después: Publicar en TikTok e Instagram Reels casos reales de limpieza y desengrase pesado mostrando el rendimiento por dilución, invitando a comentar para cotizar.\n3. Grupos comerciales B2B: Publicar paquetes mayoristas en grupos de Facebook y comunidades de comerciantes, canalizando a los interesados al WhatsApp corporativo para cerrar cotizaciones.',
    started_at: new Date(Date.now() - 3300000).toISOString(),
    submitted_at: new Date(Date.now() - 3202000).toISOString(),
    elapsed_seconds: 98,
    timed_out: false,
    objective_points: 0
  },
  {
    id: 'ans_11111111_4',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 4,
    selected_option: 'B',
    started_at: new Date(Date.now() - 3150000).toISOString(),
    submitted_at: new Date(Date.now() - 3122000).toISOString(),
    elapsed_seconds: 28,
    timed_out: false,
    objective_points: 10.00
  },
  {
    id: 'ans_11111111_5',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 5,
    selected_option: 'C',
    started_at: new Date(Date.now() - 3050000).toISOString(),
    submitted_at: new Date(Date.now() - 3009000).toISOString(),
    elapsed_seconds: 41,
    timed_out: false,
    objective_points: 10.00
  },
  {
    id: 'ans_11111111_6',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 6,
    selected_option: 'B',
    started_at: new Date(Date.now() - 2950000).toISOString(),
    submitted_at: new Date(Date.now() - 2915000).toISOString(),
    elapsed_seconds: 35,
    timed_out: false,
    objective_points: 8.00
  },
  {
    id: 'ans_11111111_7',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 7,
    selected_option: 'C',
    started_at: new Date(Date.now() - 2850000).toISOString(),
    submitted_at: new Date(Date.now() - 2826000).toISOString(),
    elapsed_seconds: 24,
    timed_out: false,
    objective_points: 8.00
  },
  {
    id: 'ans_11111111_8',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 8,
    written_answer: '¡Hola, estimado cliente! Te saluda Esther de QUIMICORP. Vi que ayer estuviste consultando por nuestros productos en la tienda virtual y dejaste tu orden pendiente. Quería consultar si tuviste alguna duda con la pasarela de pago o si necesitas que te ayude a coordinar el envío directo a tu negocio. Quedo a tu completa disposición para ayudarte a cerrar tu pedido con total tranquilidad.',
    started_at: new Date(Date.now() - 2750000).toISOString(),
    submitted_at: new Date(Date.now() - 2682000).toISOString(),
    elapsed_seconds: 68,
    timed_out: false,
    objective_points: 0
  },
  {
    id: 'ans_11111111_9',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 9,
    written_answer: '[0-3s Gancho]: "¿Tienes un negocio y gastas demasiado en productos de limpieza que no rinden?" (mostrando piso industrial o grasa pesada en cocina).\n[4-10s Solución]: "En QUIMICORP fabricamos desengrasantes y desinfectantes concentrados al por mayor. Rinden el triple y ahorras hasta 35% por litro con entrega directa a tu local."\n[11-15s CTA]: "Escríbenos al enlace de nuestro perfil y solicita tu cotización mayorista hoy mismo."',
    started_at: new Date(Date.now() - 2600000).toISOString(),
    submitted_at: new Date(Date.now() - 2512000).toISOString(),
    elapsed_seconds: 88,
    timed_out: false,
    objective_points: 0
  },
  {
    id: 'ans_11111111_10',
    assessment_id: 'e1111111-1111-1111-1111-111111111111',
    question_id: 10,
    selected_option: 'C',
    started_at: new Date(Date.now() - 2450000).toISOString(),
    submitted_at: new Date(Date.now() - 2418000).toISOString(),
    elapsed_seconds: 32,
    timed_out: false,
    objective_points: 8.00
  }
];

export const INITIAL_REVIEWER_SCORES: ReviewerScore[] = [
  {
    id: 'rev_esther_2_maria',
    answer_id: 'ans_11111111_2',
    reviewer_id: 'maria_evaluadora',
    reviewer_name: 'María',
    criterion_scores: { c1: 3, c2: 3, c3: 3, c4: 3 },
    total_points: 12,
    observation: 'Excelente manejo de objeción de precio. No cedió margen y defendió rendimiento y ficha técnica.',
    reviewed_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'rev_esther_3_maria',
    answer_id: 'ans_11111111_3',
    reviewer_id: 'maria_evaluadora',
    reviewer_name: 'María',
    criterion_scores: { c1: 3, c2: 2, c3: 3, c4: 3 },
    total_points: 11,
    observation: 'Acciones prácticas y viables sin presupuesto. Buen enfoque B2B.',
    reviewed_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'rev_esther_8_maria',
    answer_id: 'ans_11111111_8',
    reviewer_id: 'maria_evaluadora',
    reviewer_name: 'María',
    criterion_scores: { c1: 3, c2: 3, c3: 3, c4: 3 },
    total_points: 12,
    observation: 'Tono consultivo, cordial y no invasivo. Indaga sobre dudas de pago y despacho.',
    reviewed_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'rev_esther_9_maria',
    answer_id: 'ans_11111111_9',
    reviewer_id: 'maria_evaluadora',
    reviewer_name: 'María',
    criterion_scores: { c1: 3, c2: 3, c3: 2, c4: 3 },
    total_points: 11,
    observation: 'Buen gancho inicial y llamado a la acción comercial claro para mayoristas.',
    reviewed_at: new Date(Date.now() - 1800000).toISOString()
  }
];
