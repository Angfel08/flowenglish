'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v7'

const dayPrompts = [
  { q: '¿Qué fue lo más difícil de hoy?', hint: 'Today the hardest thing was...' },
  { q: '¿Algo interesante que viviste hoy?', hint: 'Today I experienced...' },
  { q: '¿Tuviste que explicarle algo a alguien?', hint: 'Today I explained...' },
  { q: '¿Cuáles son tus planes para mañana?', hint: 'Tomorrow I plan to...' },
  { q: '¿Algo que te preocupó o estresó hoy?', hint: 'Today I was stressed about...' },
  { q: '¿Qué aprendiste hoy -- en el trabajo o en la vida?', hint: 'Today I learned that...' },
  { q: '¿Con quién hablaste hoy y de qué?', hint: 'Today I talked to...' },
]

const empathy = {
  primera: { title: 'Bienvenido.', body: 'Vas a aprender diferente -- no desde lecciones genéricas, sino desde lo que vives tú cada día. Tu inglés empieza hoy, donde estás.' },
  par: { title: 'Tiene todo el sentido.', body: 'Las apps populares están diseñadas para mantenerte enganchado, no para que realmente aprendas. Esta funciona al revés -- tú eres el contenido.' },
  muchas: { title: 'No es tu culpa.', body: 'Las apps no estaban diseñadas para alguien como tú. Esta sí. Tu inglés de hoy -- sea cual sea -- es exactamente el punto de partida correcto.' },
}

const quotes = [
  'Cada oración que escribes en inglés es un paso real.',
  'El inglés no se aprende leyendo sobre él -- se aprende usándolo.',
  'Hoy mejor que ayer. Eso es todo lo que importa.',
  'Tu día real es el mejor material de aprendizaje que existe.',
  'No hay errores aquí -- solo inglés en construcción.',
  'La fluidez no llega de golpe. Llega así -- un día a la vez.',
  'Hablar inglés no es un talento. Es un hábito.',
]

const chatTopics = [
  { es: 'Tu trabajo o carrera', en: 'your work or career' },
  { es: 'Viajes que has hecho o quieres hacer', en: 'travel experiences or places you want to visit' },
  { es: 'Una serie o película que estás viendo', en: 'a TV show or movie you are watching' },
  { es: 'Tu rutina diaria', en: 'your daily routine' },
  { es: 'Algo que aprendiste recientemente', en: 'something you learned recently' },
  { es: 'Tus planes para el futuro', en: 'your plans for the future' },
  { es: 'Un hobby o actividad que disfrutas', en: 'a hobby or activity you enjoy' },
  { es: 'La última vez que usaste inglés', en: 'the last time you used English' },
]

const situations = [
  { title: 'Reunión de trabajo', desc: 'Presentas una idea a tu equipo en inglés', icon: '💼' },
  { title: 'Check-in en el aeropuerto', desc: 'Vuelas a Londres y hay un problema con tu maleta', icon: '✈️' },
  { title: 'Restaurante en el extranjero', desc: 'Pides comida y tienes una alergia que explicar', icon: '🍽️' },
  { title: 'Entrevista de trabajo', desc: 'Te preguntan sobre tu experiencia y objetivos', icon: '🤝' },
  { title: 'Llamada con cliente', desc: 'Un cliente en inglés tiene un problema que resolver', icon: '📞' },
  { title: 'Hotel con problema', desc: 'Tu habitación tiene un defecto y necesitas cambiarte', icon: '🏨' },
]

const duelWords = [
  { word: 'Make vs Do', q: 'I need to ___ a decision.', options: ['make', 'do', 'take', 'have'], correct: 0, exp: '"Make a decision" es correcto. "Do" va con tareas ("do the dishes"), "make" con crear o producir.' },
  { word: 'Say vs Tell', q: 'She ___ me that she was tired.', options: ['said', 'told', 'spoke', 'talked'], correct: 1, exp: '"Tell" siempre va con persona: "tell me", "tell him". "Say" no lleva objeto: "she said she was tired".' },
  { word: 'Since vs For', q: 'I have been working here ___ 3 years.', options: ['since', 'for', 'during', 'from'], correct: 1, exp: '"For" con periodos de tiempo (3 years). "Since" con un punto especifico en el tiempo (since 2021).' },
  { word: 'Lend vs Borrow', q: 'Can you ___ me your pen?', options: ['borrow', 'lend', 'give', 'take'], correct: 1, exp: '"Lend" = dar algo temporalmente. "Borrow" = recibirlo. "Can you lend me?" = puedes prestarme?' },
  { word: 'Rise vs Raise', q: 'The company decided to ___ salaries.', options: ['rise', 'raise', 'grow', 'increase'], correct: 1, exp: '"Raise" necesita objeto (raise salaries). "Rise" es intransitivo - no lleva objeto (prices rise).' },
  { word: 'Affect vs Effect', q: 'Stress can ___ your health negatively.', options: ['effect', 'affect', 'impact', 'change'], correct: 1, exp: '"Affect" es el verbo. "Effect" es el sustantivo. Truco: A de Affect = Accion (verbo).' },
  { word: 'Used to', q: 'I ___ go to the gym every day when I was younger.', options: ['usually', 'used to', 'would often', 'am used to'], correct: 1, exp: '"Used to" habla de habitos del pasado que ya no existen. "Usually" habla de habitos actuales.' },
  { word: 'Although vs However', q: '___ it was raining, we went for a walk.', options: ['However', 'Although', 'Despite', 'Nevertheless'], correct: 1, exp: '"Although" conecta dos ideas en una oracion. "However" conecta dos oraciones separadas.' },
  { word: 'Much vs Many', q: 'I do not have ___ time today.', options: ['many', 'much', 'lots', 'several'], correct: 1, exp: '"Much" con sustantivos incontables (time, money). "Many" con contables (people, ideas, meetings).' },
  { word: 'Few vs Little', q: 'We have very ___ money left in the budget.', options: ['few', 'little', 'small', 'less'], correct: 1, exp: '"Little" con incontables (little money). "Few" con contables (few people, few options).' },
  { word: 'At vs In vs On', q: 'The meeting is ___ Monday at 9am.', options: ['in', 'at', 'on', 'by'], correct: 2, exp: '"On" para dias (on Monday). "At" para horas (at 9am). "In" para meses o anos (in March, in 2024).' },
  { word: 'Will vs Going to', q: 'Look at those clouds - it ___ rain.', options: ['will', 'is going to', 'would', 'shall'], correct: 1, exp: '"Going to" cuando hay evidencia visible. "Will" para decisiones en el momento o predicciones generales.' },
  { word: 'Present Perfect', q: 'I ___ already sent the report.', options: ['have', 'has', 'had', 'did'], correct: 0, exp: '"Have" con I/you/we/they. "Has" con he/she/it. Se usa para acciones pasadas con resultado en el presente.' },
  { word: 'Passive Voice', q: 'The report ___ submitted yesterday.', options: ['was', 'is', 'were', 'had'], correct: 0, exp: 'Pasiva en pasado simple: was/were + participio. "The report was submitted" = alguien lo envio.' },
  { word: 'Second Conditional', q: 'If I ___ more time, I would learn French.', options: ['have', 'had', 'would have', 'will have'], correct: 1, exp: 'Segunda condicional: If + past simple, would + infinitive. Expresa situaciones hipoteticas en el presente.' },
  { word: 'Despite vs Although', q: '___ being tired, she finished the project.', options: ['Although', 'Despite', 'Even if', 'However'], correct: 1, exp: '"Despite" + sustantivo o gerundio (despite being tired). "Although" + sujeto + verbo (although she was tired).' },
  { word: 'Keep + gerund', q: 'You should ___ practicing every day.', options: ['stop', 'keep', 'quit', 'avoid'], correct: 1, exp: '"Keep" + gerundio = continuar haciendo algo (keep practicing). "Stop" + gerundio = dejar de hacerlo.' },
  { word: 'Suggest', q: 'She suggested ___ to the gym together.', options: ['to go', 'go', 'going', 'went'], correct: 2, exp: '"Suggest" va seguido de gerundio (suggest going) o "that + verbo base". Nunca "suggest to go".' },
  { word: 'Wish', q: 'I wish I ___ speak English fluently.', options: ['can', 'could', 'would', 'will'], correct: 1, exp: '"Wish" en presente usa pasado simple: "I wish I could" (pero no puedo). Expresa deseos sobre la realidad actual.' },
  { word: 'Too vs Enough', q: 'This coffee is ___ hot to drink.', options: ['enough', 'too', 'very', 'so'], correct: 1, exp: '"Too" = mas de lo deseable (too hot = no puedo tomarlo). "Enough" = suficiente. "Too" va antes del adjetivo.' },
  { word: 'Already vs Yet', q: 'Have you finished the report ___?', options: ['already', 'yet', 'still', 'just'], correct: 1, exp: '"Yet" en preguntas y negaciones. "Already" en afirmaciones (I have already done it).' },
  { word: 'By vs Until', q: 'Please send me the file ___ Friday.', options: ['until', 'by', 'before to', 'at'], correct: 1, exp: '"By" = no mas tarde que (by Friday = antes del viernes). "Until" = hasta ese momento continuamente.' },
  { word: 'So vs Such', q: 'It was ___ a great presentation.', options: ['so', 'such', 'very', 'too'], correct: 1, exp: '"Such" antes de articulo + sustantivo (such a great idea). "So" antes de adjetivo sin sustantivo (so great).' },
  { word: 'Gerund vs Infinitive', q: 'I enjoy ___ new languages.', options: ['learn', 'to learn', 'learning', 'learned'], correct: 2, exp: 'Despues de enjoy/finish/avoid/mind -> gerundio. Despues de want/decide/hope/need -> infinitivo (to + verb).' },
  { word: 'Causative Have', q: 'I need to have my car ___', options: ['fix', 'fixing', 'fixed', 'to fix'], correct: 2, exp: 'Causative have: "have something done" = mandar a hacer algo. "I had my car fixed" = lo mande a arreglar.' },
]



function fmt(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

async function callAI(prompt) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error de servidor')
  return data.text
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; }
  body { background:#F0F4EF; font-family:'DM Sans',sans-serif; font-weight:300; color:#161A16; -webkit-font-smoothing:antialiased; }
  :root {
    --g:#1A5C41; --g-mid:#22784F; --g-light:#EAF4EE; --g-border:#C2DFD0;
    --bg:#F0F4EF; --bg2:#E8EDE7; --surface:#FFFFFF; --surface2:#F5F8F4;
    --border:#DDE5DC; --border2:#C2D4C0; --text:#161A16; --muted:#4E604E; --muted2:#8FA08F;
    --amber:#A85200; --amber-l:#FBF0E6; --coral:#A83020; --coral-l:#FCECEA;
    --blue:#1A3F8F; --blue-l:#E8EEF8; --purple:#4A2E7A; --purple-l:#EEEAF8;
    --shadow-xs:0 1px 2px rgba(0,0,0,0.05);
    --shadow-sm:0 1px 4px rgba(0,0,0,0.07),0 0 1px rgba(0,0,0,0.04);
    --shadow-md:0 4px 12px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.05);
    --shadow-lg:0 8px 24px rgba(0,0,0,0.1),0 2px 6px rgba(0,0,0,0.06);
    --r:16px; --r-sm:10px; --r-xs:7px;
  }
  @keyframes pulse { 0%,80%,100%{opacity:.15;transform:scale(.65)} 40%{opacity:1;transform:scale(1)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
  .pop-in { animation: popIn 0.38s cubic-bezier(0.16,1,0.3,1) both; }
  .slide-up { animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1) both; }
  textarea { transition: border-color 0.18s, box-shadow 0.18s; }
  textarea:focus { outline:none; border-color:var(--g) !important; box-shadow:0 0 0 3px rgba(26,92,65,0.1) !important; }
  input:focus { outline:none; border-color:var(--g) !important; box-shadow:0 0 0 3px rgba(26,92,65,0.1) !important; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
  .pressable { transition: transform 0.1s ease, opacity 0.1s ease; cursor:pointer; }
  .pressable:hover { opacity:0.91; }
  .pressable:active { transform:scale(0.97); }
  .card-tap { transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s; cursor:pointer; }
  .card-tap:hover { border-color:var(--border2) !important; box-shadow:var(--shadow-md) !important; transform:translateY(-1px); }
  .card-tap:active { transform:translateY(0) scale(0.99); }
  h1,h2,h3 { font-family:'Instrument Serif',serif; font-weight:400; letter-spacing:-0.02em; }
`'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v7'

const dayPrompts = [
  { q: '¿Qué fue lo más difícil de hoy?', hint: 'Today the hardest thing was...' },
  { q: '¿Algo interesante que viviste hoy?', hint: 'Today I experienced...' },
  { q: '¿Tuviste que explicarle algo a alguien?', hint: 'Today I explained...' },
  { q: '¿Cuáles son tus planes para mañana?', hint: 'Tomorrow I plan to...' },
  { q: '¿Algo que te preocupó o estresó hoy?', hint: 'Today I was stressed about...' },
  { q: '¿Qué aprendiste hoy -- en el trabajo o en la vida?', hint: 'Today I learned that...' },
  { q: '¿Con quién hablaste hoy y de qué?', hint: 'Today I talked to...' },
]

const empathy = {
  primera: { title: 'Bienvenido.', body: 'Vas a aprender diferente -- no desde lecciones genéricas, sino desde lo que vives tú cada día. Tu inglés empieza hoy, donde estás.' },
  par: { title: 'Tiene todo el sentido.', body: 'Las apps populares están diseñadas para mantenerte enganchado, no para que realmente aprendas. Esta funciona al revés -- tú eres el contenido.' },
  muchas: { title: 'No es tu culpa.', body: 'Las apps no estaban diseñadas para alguien como tú. Esta sí. Tu inglés de hoy -- sea cual sea -- es exactamente el punto de partida correcto.' },
}

const quotes = [
  'Cada oración que escribes en inglés es un paso real.',
  'El inglés no se aprende leyendo sobre él -- se aprende usándolo.',
  'Hoy mejor que ayer. Eso es todo lo que importa.',
  'Tu día real es el mejor material de aprendizaje que existe.',
  'No hay errores aquí -- solo inglés en construcción.',
  'La fluidez no llega de golpe. Llega así -- un día a la vez.',
  'Hablar inglés no es un talento. Es un hábito.',
]

const chatTopics = [
  { es: 'Tu trabajo o carrera', en: 'your work or career' },
  { es: 'Viajes que has hecho o quieres hacer', en: 'travel experiences or places you want to visit' },
  { es: 'Una serie o película que estás viendo', en: 'a TV show or movie you are watching' },
  { es: 'Tu rutina diaria', en: 'your daily routine' },
  { es: 'Algo que aprendiste recientemente', en: 'something you learned recently' },
  { es: 'Tus planes para el futuro', en: 'your plans for the future' },
  { es: 'Un hobby o actividad que disfrutas', en: 'a hobby or activity you enjoy' },
  { es: 'La última vez que usaste inglés', en: 'the last time you used English' },
]

const situations = [
  { title: 'Reunión de trabajo', desc: 'Presentas una idea a tu equipo en inglés', icon: '💼' },
  { title: 'Check-in en el aeropuerto', desc: 'Vuelas a Londres y hay un problema con tu maleta', icon: '✈️' },
  { title: 'Restaurante en el extranjero', desc: 'Pides comida y tienes una alergia que explicar', icon: '🍽️' },
  { title: 'Entrevista de trabajo', desc: 'Te preguntan sobre tu experiencia y objetivos', icon: '🤝' },
  { title: 'Llamada con cliente', desc: 'Un cliente en inglés tiene un problema que resolver', icon: '📞' },
  { title: 'Hotel con problema', desc: 'Tu habitación tiene un defecto y necesitas cambiarte', icon: '🏨' },
]

const duelWords = [
  { word: 'Make vs Do', q: 'I need to ___ a decision.', options: ['make', 'do', 'take', 'have'], correct: 0, exp: '"Make a decision" es lo correcto. "Do" se usa para tareas ("do the dishes"), "make" para crear o producir algo.' },
  { word: 'Say vs Tell', q: 'She ___ me that she was tired.', options: ['said', 'told', 'spoke', 'talked'], correct: 1, exp: '"Tell" siempre va seguido de la persona: "tell me", "tell him". "Say" no lleva objeto directo: "she said she was tired".' },
  { word: 'Since vs For', q: 'I have been working here ___ 3 years.', options: ['since', 'for', 'during', 'from'], correct: 1, exp: '"For" se usa con períodos de tiempo (3 years). "Since" se usa con un punto específico en el tiempo (since 2021).' },
  { word: 'Lend vs Borrow', q: 'Can you ___ me your pen?', options: ['borrow', 'lend', 'give', 'take'], correct: 1, exp: '"Lend" = dar algo temporalmente (yo te lo doy). "Borrow" = recibir algo temporalmente. "Can you lend me?" = ¿puedes prestarme?' },
  { word: 'Rise vs Raise', q: 'The company decided to ___ salaries.', options: ['rise', 'raise', 'grow', 'increase'], correct: 1, exp: '"Raise" necesita objeto (raise salaries, raise your hand). "Rise" es intransitivo -- no lleva objeto (prices rise).' },
  { word: 'Affect vs Effect', q: 'Stress can ___ your health negatively.', options: ['effect', 'affect', 'impact', 'change'], correct: 1, exp: '"Affect" es el verbo. "Effect" es el sustantivo. Truco: A de Affect = Acción (verbo).' },
  { word: 'Used to', q: 'I ___ go to the gym every day when I was younger.', options: ['usually', 'used to', 'would often', 'am used to'], correct: 1, exp: '"Used to" habla de hábitos del pasado que ya no existen. "Usually" habla de hábitos actuales.' },
  { word: 'Although vs However', q: '___ it was raining, we went for a walk.', options: ['However', 'Although', 'Despite', 'Nevertheless'], correct: 1, exp: '"Although" conecta dos ideas en una oración. "However" conecta dos oraciones separadas con punto y coma.' },
  {
    word: 'Much vs Many', q: 'I don't have ___ time today.', options:['many','much','lots','several'], correct:1, exp:'"Much" se usa con sustantivos incontables(time, money, water). "Many" con contables(people, ideas, meetings).' },
  { word: 'Few vs Little', q: 'We have very ___ money left in the budget.', options: ['few', 'little', 'small', 'less'], correct: 1, exp: '"Little" con incontables (little money, little time). "Few" con contables (few people, few options).' },
  { word: 'At vs In vs On', q: 'The meeting is ___ Monday at 9am.', options: ['in', 'at', 'on', 'by'], correct: 2, exp: '"On" para días (on Monday, on Friday). "At" para horas (at 9am). "In" para meses o años (in March, in 2024).' },
  { word: 'Will vs Going to', q: 'Look at those clouds -- it ___ rain.', options: ['will', 'is going to', 'would', 'shall'], correct: 1, exp: '"Going to" cuando hay evidencia visible (look at those clouds). "Will" para decisiones en el momento o predicciones sin evidencia.' },
  { word: 'Present Perfect', q: 'I ___ already sent the report.', options: ['have', 'has', 'had', 'did'], correct: 0, exp: 'Present perfect con "I/you/we/they" usa "have". Con "he/she/it" usa "has". Se usa para acciones pasadas con relevancia presente.' },
  { word: 'Passive Voice', q: 'The report ___ submitted yesterday.', options: ['was', 'is', 'were', 'had'], correct: 0, exp: 'Pasiva en pasado simple: "was/were + participio". El sujeto recibe la acción. "The report was submitted" = alguien lo envió.' },
  { word: 'Conditionals', q: 'If I ___ more time, I would learn French.', options: ['have', 'had', 'would have', 'will have'], correct: 1, exp: 'Segunda condicional: "If + past simple, would + infinitive". Expresa situaciones hipotéticas o poco probables en el presente.' },
  { word: 'Despite vs Although', q: '___ being tired, she finished the project.', options: ['Although', 'Despite', 'Even if', 'However'], correct: 1, exp: '"Despite" va seguido de sustantivo o gerundio (despite being tired). "Although" va seguido de sujeto + verbo (although she was tired).' },
  { word: 'Keep vs Stop', q: 'You should ___ practicing every day.', options: ['stop', 'keep', 'quit', 'avoid'], correct: 1, exp: '"Keep" + gerundio = continuar haciendo algo (keep practicing). "Stop" + gerundio = dejar de hacer algo (stop practicing).' },
  { word: 'Suggest', q: 'She suggested ___ to the gym together.', options: ['to go', 'go', 'going', 'went'], correct: 2, exp: '"Suggest" va seguido de gerundio (suggest going) o "that + sujeto + verbo base" (suggest that we go). Nunca "suggest to go".' },
  { word: 'Wish', q: 'I wish I ___ speak English fluently.', options: ['can', 'could', 'would', 'will'], correct: 1, exp: '"Wish" para el presente usa pasado simple: "I wish I could" (pero no puedo). "I wish I were" (pero no soy). Expresa deseos sobre la realidad actual.' },
  { word: 'Used to vs Use to', q: 'Did you ___ live in Santiago?', options: ['use to', 'used to', 'using to', 'uses to'], correct: 0, exp: 'Con "did" (preguntas y negaciones), se usa "use to" sin la d: "Did you use to...?" En afirmativo: "I used to live there".' },
  { word: 'Gerund vs Infinitive', q: 'I enjoy ___ new languages.', options: ['learn', 'to learn', 'learning', 'learned'], correct: 2, exp: 'Después de "enjoy", "finish", "avoid", "consider", "mind" → gerundio (-ing). Después de "want", "decide", "hope", "need" → infinitivo (to + verb).' },
  { word: 'Too vs Enough', q: 'This coffee is ___ hot to drink.', options: ['enough', 'too', 'very', 'so'], correct: 1, exp: '"Too" significa "más de lo deseable" (too hot = no puedo tomarlo). "Enough" significa "suficiente" (hot enough). "Too" va antes del adjetivo.' },
  {
    word: 'Already vs Yet', q: 'Have you finished the report ___?', options: ['already', 'yet', 'still', 'just'], correct: 1, exp: '"Yet" en preguntas y negaciones (have you done it yet? / I haven't done it yet). "Already" en afirmaciones(I have already done it).' },
  { word: 'By vs Until', q: 'Please send me the file ___ Friday.', options: ['until', 'by', 'before to', 'at'], correct: 1, exp: '"By" = no más tarde que (by Friday = antes del viernes). "Until" = hasta ese momento continuamente (I will wait until Friday).' },
  { word: 'So vs Such', q: 'It was ___ a great presentation.', options: ['so', 'such', 'very', 'too'], correct: 1, exp: '"Such" va antes de artículo + sustantivo (such a great idea). "So" va antes de adjetivo o adverbio sin sustantivo (so great, so quickly).' },
]



function fmt(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

async function callAI(prompt) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error de servidor')
  return data.text
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; }
  body {
    background:#F0F4EF;
    font-family:'DM Sans',sans-serif;
    font-weight:300;
    color:#161A16;
    -webkit-font-smoothing:antialiased;
    font-size:16px;
  }
  :root {
    --g:#1A5C41;
    --g-mid:#22784F;
    --g-light:#EAF4EE;
    --g-border:#C2DFD0;
    --bg:#F0F4EF;
    --bg2:#E8EDE7;
    --surface:#FFFFFF;
    --surface2:#F5F8F4;
    --border:#DDE5DC;
    --border2:#C2D4C0;
    --text:#161A16;
    --muted:#4E604E;
    --muted2:#8FA08F;
    --amber:#A85200;
    --amber-l:#FBF0E6;
    --coral:#A83020;
    --coral-l:#FBEAE8;
    --blue:#1840A0;
    --blue-l:#E8EEFB;
    --purple:#50308A;
    --purple-l:#EEE8FA;
    --shadow-xs:0 1px 2px rgba(0,0,0,0.05);
    --shadow-sm:0 1px 4px rgba(0,0,0,0.07),0 2px 8px rgba(0,0,0,0.04);
    --shadow-md:0 2px 8px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.05);
    --r:16px;
    --r-sm:10px;
    --r-xs:8px;
  }
  @keyframes pulse { 0%,80%,100%{opacity:.15;transform:scale(.6)} 40%{opacity:1;transform:scale(1)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flipIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in { animation: fadeIn 0.35s ease both; }
  .pop-in { animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .slide-up { animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .flip-in { animation: flipIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
  textarea { transition: border-color 0.2s, box-shadow 0.2s; }
  textarea:focus { outline:none; border-color:var(--g) !important; box-shadow:0 0 0 3px rgba(26,92,65,0.1) !important; }
  input:focus { outline:none; border-color:var(--g) !important; box-shadow:0 0 0 3px rgba(26,92,65,0.1) !important; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
  .pressable { transition:transform 0.12s,opacity 0.12s; cursor:pointer; }
  .pressable:hover { opacity:0.91; }
  .pressable:active { transform:scale(0.97); }
  .card-tap { transition:border-color 0.15s,box-shadow 0.15s; cursor:pointer; }
  .card-tap:hover { border-color:var(--border2) !important; box-shadow:var(--shadow-md) !important; }
`

  ({ color }) {
    const c = color || 'var(--g)'
  return (
  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
    ))}
  </span>
)
}

function TA({ value, onChange, placeholder, hint, rows, disabled }) {
  const r = rows || 5
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={r} disabled={disabled}
        style={{ width: '100%', background: disabled ? 'var(--surface2)' : 'var(--surface)', border: `1.5px solid ${disabled ? 'var(--border)' : 'var(--border2)'}`, borderRadius: 'var(--r)', padding: '0.95rem 1rem', fontSize: '0.95rem', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontWeight: 300, resize: 'none', lineHeight: 1.7, boxShadow: 'var(--shadow-sm)', opacity: disabled ? 0.7 : 1 }}
      />
      {hint && !value && !disabled && (
        <div style={{ position: 'absolute', bottom: 18, right: 12, fontSize: '0.72rem', color: 'var(--muted2)', fontStyle: 'italic', pointerEvents: 'none' }}>{hint}</div>
      )}
    </div>
  )
}

function Btn({ onClick, disabled, loading, children, fullWidth, variant, small }) {
  const v = variant || 'primary'
  const configs = {
    primary: { bg: disabled ? 'rgba(26,92,65,0.35)' : 'var(--g)', color: '#fff', border: 'none', shadow: disabled ? 'none' : '0 1px 3px rgba(26,92,65,0.3),0 4px 12px rgba(26,92,65,0.15)' },
    ghost: { bg: 'transparent', color: 'var(--muted)', border: '1px solid var(--border2)', shadow: 'none' },
    outline: { bg: 'var(--g-light)', color: 'var(--g)', border: '1.5px solid var(--g)', shadow: 'none' },
    danger: { bg: 'var(--coral)', color: '#fff', border: 'none', shadow: 'none' },
  }
  const cfg = configs[v] || configs.primary
  return (
    <button onClick={onClick} disabled={disabled || loading} className="pressable"
      style={{ background: cfg.bg, color: cfg.color, border: cfg.border, borderRadius: 'var(--r)', padding: small ? '0.55rem 1rem' : '0.85rem 1.5rem', fontSize: small ? '0.83rem' : '0.92rem', fontWeight: 500, letterSpacing: '0.01em', cursor: (disabled || loading) ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: cfg.shadow, opacity: (disabled && !loading) ? 0.55 : 1, transition: 'all 0.15s' }}>
      {loading ? <><Dots color={v === 'primary' || v === 'danger' ? '#fff' : 'var(--g)'} />{children}</> : children}
    </button>
  )
}

function FeedbackBox({ label, color, bgColor, content }) {
  const c = color || 'var(--g)'
  const bg = bgColor || 'var(--g-light)'
  return (
    <div className="slide-up" style={{ background: bg, border: `1px solid ${c}20`, borderLeft: `3px solid ${c}`, borderRadius: 'var(--r)', padding: '1.1rem 1.2rem 1.1rem 1.25rem', marginTop: 14 }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: c, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block' }} />{label}
      </div>
      <div style={{ fontSize: '0.88rem', lineHeight: 1.85, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: fmt(content) }} />
    </div>
  )
}

function TopBar({ step, total, onBack, title }) {
  return (
    <div style={{ background: 'rgba(240,244,239,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 14, height: 52, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
      {onBack && (
        <button onClick={onBack} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
      )}
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>}
        <div style={{ background: 'var(--border)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
          <div style={{ width: `${Math.round((step / total) * 100)}%`, height: '100%', background: 'var(--g)', borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
      </div>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{step}/{total}</span>
    </div>
  )
}

function PageContent({ children }) {
  return (
    <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}

function ModuleTag({ label, color, bg }) {
  return (
    <div style={{ display: 'inline-block', background: bg || 'var(--g-light)', color: color || 'var(--g)', fontSize: '0.65rem', fontWeight: 600, padding: '5px 14px', borderRadius: 99, marginBottom: '1.1rem', letterSpacing: '0.1em' }}>{label}</div>
  )
}

function WarningBox({ message }) {
  return (
    <div className="slide-up" style={{ background: 'var(--amber-l)', border: '1px solid rgba(168,82,0,0.2)', borderLeft: '3px solid var(--amber)', borderRadius: 'var(--r)', padding: '0.85rem 1rem', marginTop: 10, fontSize: '0.85rem', color: '#6A3200', lineHeight: 1.65 }}>
      {message}
    </div>
  )
}

function LevelBadge({ level }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: level.color + '18', border: `1px solid ${level.color}30`, borderRadius: 99, padding: '3px 10px' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: level.color }} />
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: level.color, letterSpacing: '0.04em' }}>{level.code}</span>
    </div>
  )
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ background: isUser ? 'var(--g)' : 'var(--surface)', color: isUser ? '#fff' : 'var(--text)', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '0.8rem 1rem', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: '80%', border: isUser ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} dangerouslySetInnerHTML={{ __html: fmt(msg.text) }} />
    </div>
  )
}

export default function Home() {
  const [state, setState] = useState(null)
  const [view, setView] = useState('loading')

  // Onboarding
  const [obStep, setObStep] = useState(1)
  const [obChoice, setObChoice] = useState('')
  const [obName, setObName] = useState('')
  const [obText, setObText] = useState('')
  const [obLearning, setObLearning] = useState('')
  const [obLoading, setObLoading] = useState(false)

  // Session
  const [sessionStep, setSessionStep] = useState('day')
  const [dayText, setDayText] = useState('')
  const [dayResp, setDayResp] = useState('')
  const [dayWarning, setDayWarning] = useState('')
  const [dayLoading, setDayLoading] = useState(false)
  const [vocabWords, setVocabWords] = useState([])
  const [vocabPractice, setVocabPractice] = useState('')
  const [vocabResp, setVocabResp] = useState('')
  const [vocabWarning, setVocabWarning] = useState('')
  const [vocabLoading, setVocabLoading] = useState(false)
  const [retoPattern, setRetoPattern] = useState('')
  const [retoInput, setRetoInput] = useState('')
  const [retoResp, setRetoResp] = useState('')
  const [retoWarning, setRetoWarning] = useState('')
  const [retoLoading, setRetoLoading] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [reviewFlipped, setReviewFlipped] = useState(false)
  const [cierreText, setCierreText] = useState('')
  const [cierreLoading, setCierreLoading] = useState(false)
  const [sessionDayText, setSessionDayText] = useState('')
  const [sessionVocab, setSessionVocab] = useState([])

  // Activities
  const [chatTopic, setChatTopic] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const [chatFeedback, setChatFeedback] = useState('')
  const [situacion, setSituacion] = useState(null)
  const [sitMessages, setSitMessages] = useState([])
  const [sitInput, setSitInput] = useState('')
  const [sitLoading, setSitLoading] = useState(false)
  const [sitEnded, setSitEnded] = useState(false)
  const [sitFeedback, setSitFeedback] = useState('')
  const [duelQ, setDuelQ] = useState([])
  const [duelIdx, setDuelIdx] = useState(0)
  const [duelSelected, setDuelSelected] = useState(null)
  const [duelScore, setDuelScore] = useState(0)
  const [duelDone, setDuelDone] = useState(false)
  const [frase, setFrase] = useState(null)
  const [fraseLoading, setFraseLoading] = useState(false)
  const [fraseInput, setFraseInput] = useState('')
  const [fraseResp, setFraseResp] = useState('')

  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const init = { onboarded: false, name: '', sessions: [], vocab: [], learned: [], streak: 0, lastSessionDate: '' }
    const s = saved ? { ...init, ...JSON.parse(saved) } : init
    setState(s)
    setView(s.onboarded ? 'home' : 'onboarding')
  }, [])

  function save(updates) {
    const next = { ...state, ...updates }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }

  function addLearned(text) {
    const today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    const ex = state?.learned || []
    if (ex.find(l => l.text === text)) return
    save({ learned: [{ text, date: today }, ...ex].slice(0, 50) })
  }

  function startSession() {
    setSessionStep('day'); setDayText(''); setDayResp(''); setDayWarning('')
    setVocabWords([]); setVocabPractice(''); setVocabResp(''); setVocabWarning('')
    setRetoPattern(''); setRetoInput(''); setRetoResp(''); setRetoWarning('')
    setReviewIdx(0); setReviewFlipped(false)
    setCierreText(''); setSessionDayText(''); setSessionVocab([])
    setView('session')
  }

  function startChat(topic) {
    setChatTopic(topic)
    const opening = 'Let\'s talk about ' + topic.en + '. I\'ll start with a question -- answer in English as best you can:\n\nWhat can you tell me about ' + topic.en + '? Share something from your own experience.'
    setChatMessages([{ role: 'assistant', text: opening }])
    setChatInput(''); setChatEnded(false); setChatFeedback('')
    setView('chat')
  }

  function startSituacion(sit) {
    setSituacion(sit)
    setSitMessages([{ role: 'assistant', text: `Let's practice: **${sit.title}**\n\n${sit.desc}.\n\nI'll play the other person. You start -- greet me and get into the situation. In English.` }])
    setSitInput(''); setSitEnded(false); setSitFeedback('')
    setView('situacion')
  }

  function startDuel() {
    const shuffled = [...duelWords].sort(() => Math.random() - 0.5).slice(0, 5)
    setDuelQ(shuffled); setDuelIdx(0); setDuelSelected(null); setDuelScore(0); setDuelDone(false)
    setView('duelo')
  }

  async function loadFrase() {
    setFraseLoading(true); setFraseInput(''); setFraseResp(''); setFrase(null)
    setView('frase')
    try {
      const resp = await callAI(`Eres coach de inglés. Genera UNA expresión o phrasal verb útil para nivel B1 relacionado con trabajo o vida cotidiana. Responde en este formato EXACTO, una línea por sección:\n\nFRASE: [la expresión en inglés]\nSIGNIFICADO: [qué significa en español, 1 línea]\nCUÁNDO USARLA: [1 situación concreta]\nEJEMPLO: [oración de ejemplo en inglés]\n\nElige algo práctico, no obvio.`)
      setFrase(resp)
    } catch (e) { setFrase('ERROR') }
    setFraseLoading(false)
  }

  // Session handlers
  async function submitObText() {
    if (obText.trim().length < 10) return
    setObLoading(true)
    try {
      const resp = await callAI(`Eres un coach de inglés cercano y motivador. RESPONDE EN ESPAÑOL natural y cálido.\n\nPrimero verifica si el texto está en inglés (aunque sea imperfecto). Si no es inglés, responde exactamente: INVALID\n\nSi es inglés válido, da:\n1. Una observación positiva MUY específica sobre algo concreto del texto\n2. Una sola mejora usando sus propias palabras\n\nTono: amigo bilingüe, cálido, directo. Sin tecnicismos. Máximo 3 oraciones.\n\nTexto: "${obText}"`)
      if (resp.trim().startsWith('INVALID')) {
        alert('Escribe algo en inglés -- aunque sea una sola oración. No importa si tiene errores.')
        setObLoading(false); return
      }
      setObLearning(resp); setObStep(5)
    } catch (e) { alert('Error: ' + e.message) }
    setObLoading(false)
  }

  async function submitDay() {
    if (dayText.trim().length < 15) return
    setDayLoading(true); setDayWarning(''); setSessionDayText(dayText)
    try {
      const resp = await callAI(`Eres un coach de inglés cercano. RESPONDE EN ESPAÑOL natural, como un amigo bilingüe que te ayuda.\n\nVerifica si el texto está en inglés real. Si no, responde: INVALID\nSi es muy corto o sin sentido, responde: TOO_SHORT\n\nSi es válido:\n**Buena noticia:** [algo MUY específico que hizo bien -- menciona sus palabras exactas]\n\n**Una cosa para pulir:** [el error más importante. Formato: "escribiste X → suena mejor así: Y". Una línea de explicación.]\n\nTono: amigo cercano, no profesor. Sin tecnicismos.\n\nAl final agrega:\nVOCAB_JSON:[{"word":"w1","def":"def simple en español","example":"ejemplo natural en inglés"},{"word":"w2","def":"def","example":"ej"},{"word":"w3","def":"def","example":"ej"}]\n\nTexto: "${dayText}"`)
      if (resp.trim().startsWith('INVALID')) {
        setDayWarning('Parece que esto no está en inglés. Escribe aunque sea una oración simple -- el nivel no importa.')
        setDayLoading(false); return
      }
      if (resp.trim().startsWith('TOO_SHORT')) {
        setDayWarning('Cuéntame un poco más -- con dos oraciones sobre tu día es suficiente.')
        setDayLoading(false); return
      }
      const match = resp.match(/VOCAB_JSON:(\[.*?\])/s)
      let words = []; let display = resp
      if (match) { try { words = JSON.parse(match[1]); display = resp.replace(/VOCAB_JSON:.*$/s, '').trim() } catch (e) { } }
      setDayResp(display); setVocabWords(words); setSessionVocab(words)
      save({ vocab: [...(state?.vocab || []), ...words] })
      genReto(dayText)
    } catch (e) { alert('Error: ' + e.message) }
    setDayLoading(false)
  }

  async function genReto(text) {
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural. Texto del aprendiz: "${text}"\n\nIdentifica el patrón más útil:\n**El patrón:** [qué es y cuándo usarlo -- 1-2 oraciones simples]\n**Así se vería mejor:** [toma algo de su texto y muéstralo mejorado]\n**Tu turno:** [una situación simple para practicar ese patrón]\n\nMáximo 80 palabras. Tono: amigo que te corrige con cariño.`)
      setRetoPattern(resp)
    } catch (e) { }
  }

  async function submitVocab() {
    if (!vocabPractice.trim()) return
    setVocabLoading(true); setVocabWarning('')
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural.\n\nEl aprendiz debía usar una de estas palabras: ${sessionVocab.map(w => w.word).join(', ')}.\nEscribió: "${vocabPractice}"\n\n¿Usó alguna de esas palabras? ¿Está en inglés? Si no, responde: INVALID\n\nSi está bien: feedback en 2-3 oraciones. ¿La usó correctamente? ¿Qué mejorarías? Sé específico y motivador.`)
      if (resp.trim().startsWith('INVALID')) {
        setVocabWarning(`Usa una de estas palabras en inglés: ${sessionVocab.map(w => w.word).join(', ')}.`)
        setVocabLoading(false); return
      }
      setVocabResp(resp); addLearned(`Vocabulario: ${sessionVocab.map(w => w.word).join(', ')}`)
    } catch (e) { }
    setVocabLoading(false)
  }

  async function submitReto() {
    if (!retoInput.trim()) return
    setRetoLoading(true); setRetoWarning('')
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural.\n\nPatrón a practicar: "${retoPattern}"\nEl aprendiz escribió: "${retoInput}"\n\n¿Intentó practicar el patrón en inglés? Si no, responde: INVALID\n\nSi está bien: corrección y ánimo en 2-3 oraciones. Muestra versión mejorada si necesario.`)
      if (resp.trim().startsWith('INVALID')) {
        setRetoWarning('Intenta practicar el patrón en inglés -- aunque sea una oración corta.')
        setRetoLoading(false); return
      }
      setRetoResp(resp); addLearned('Gramática: patrón del día practicado')
    } catch (e) { }
    setRetoLoading(false)
  }

  async function submitCierre() {
    setCierreLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL cercano y personal.\n\nEl aprendiz ${state?.name || ''}completó su sesión. Escribió sobre: "${sessionDayText.substring(0, 150)}". Vocabulario trabajado: ${sessionVocab.map(w => w.word).join(', ') || 'general'}.\n\nEscribe 2-3 oraciones MUY personales:\n1. Menciona algo específico de lo que escribió hoy\n2. Un consejo concreto para mañana\n\nNada genérico. Habla como alguien que realmente leyó su texto.`)
      setCierreText(resp); addLearned(resp.substring(0, 90) + '...')
      const today = new Date().toISOString()
      const newSessions = [...(state?.sessions || []), { date: today }]
      const newStreak = (state?.lastSessionDate && new Date(state.lastSessionDate).toDateString() === new Date(Date.now() - 86400000).toDateString()) ? (state.streak || 0) + 1 : 1
      save({ sessions: newSessions, streak: newStreak, lastSessionDate: today })
    } catch (e) { }
    setCierreLoading(false)
  }

  async function sendChat() {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', text: chatInput }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages); setChatInput(''); setChatLoading(true)
    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.text}`).join('\n')
      const resp = await callAI(`You are a friendly English coach having a spoken conversation with a B1 Spanish speaker about: "${chatTopic?.en || 'general topics'}".\n\nRules:\n- Respond in natural but simple English (B1-B2 level)\n- Ask ONE follow-up question at the end\n- If learner writes in Spanish, reply in Spanish asking them to try in English\n- Keep response to 2-3 sentences max\n- Be encouraging and conversational\n\nConversation:\n${history}\n\nCoach:`)
      setChatMessages(p => [...p, { role: 'assistant', text: resp }])
    } catch (e) { }
    setChatLoading(false)
  }

  async function endChat() {
    setChatLoading(true)
    try {
      const history = chatMessages.filter(m => m.role === 'user').map(m => m.text).join(' | ')
      const topicLabel = chatTopic?.en || 'general'
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural y cálido.\n\nEl aprendiz tuvo una conversación en inglés sobre "${topicLabel}". Sus mensajes: "${history}"\n\nFeedback personal en 3-4 oraciones:\n1. Algo específico que hizo bien (menciona sus palabras reales)\n2. Una expresión o patrón para mejorar con ejemplo\n3. Cierre motivador\n\nTono: amigo que estuvo escuchando toda la conversación.`)
      setChatFeedback(resp); setChatEnded(true)
      addLearned(`Chat libre: ${chatTopic?.es || topicLabel}`)
    } catch (e) { }
    setChatLoading(false)
  }

  async function sendSit() {
    if (!sitInput.trim()) return
    const userMsg = { role: 'user', text: sitInput }
    const newMessages = [...sitMessages, userMsg]
    setSitMessages(newMessages); setSitInput(''); setSitLoading(true)
    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Learner' : 'Character'}: ${m.text}`).join('\n')
      const resp = await callAI(`You are a character in an English roleplay. The situation is: "${situacion?.title}" -- ${situacion?.desc}.\n\nRules:\n- Respond IN ENGLISH as the character (not as a coach)\n- Use realistic B1-B2 vocabulary\n- Introduce natural challenges of the situation\n- Keep it to 2-3 sentences\n- If learner writes in Spanish say: "Sorry, could you say that in English?"\n\nConversation:\n${history}\n\nCharacter:`)
      setSitMessages(p => [...p, { role: 'assistant', text: resp }])
    } catch (e) { }
    setSitLoading(false)
  }

  async function endSit() {
    setSitLoading(true)
    try {
      const history = sitMessages.filter(m => m.role === 'user').map(m => m.text).join(' | ')
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL cercano.\n\nEl aprendiz hizo un roleplay de "${situacion?.title}". Sus intervenciones: "${history}"\n\nFeedback en 3-4 oraciones:\n1. Lo que manejó bien en la situación (específico)\n2. Una frase o expresión clave que le hubiera servido\n3. Cierre motivador\n\nTono: amigo que vio toda la actuación.`)
      setSitFeedback(resp); setSitEnded(true)
      addLearned(`Roleplay: ${situacion?.title}`)
    } catch (e) { }
    setSitLoading(false)
  }

  async function submitFrase() {
    if (!fraseInput.trim()) return
    try {
      const lines = (frase || '').split('\n').filter(l => l.trim())
      const phraseWord = lines.find(l => l.startsWith('FRASE:'))?.replace('FRASE:', '').trim() || ''
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural.\n\nLa frase del día era: "${phraseWord}"\nEl aprendiz la usó en: "${fraseInput}"\n\n¿La usó correctamente? ¿Suena natural? Feedback en 2-3 oraciones. Tono amigable y motivador.`)
      setFraseResp(resp); addLearned(`Frase del día: ${phraseWord}`)
    } catch (e) { }
  }

  const reviewCards = (state?.vocab || []).slice(-9).slice(0, 3)
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  const dayPrompt = dayPrompts[new Date().getDay() % dayPrompts.length]
  const todayDone = (state?.sessions || []).length > 0 && new Date((state?.sessions || []).slice(-1)[0]?.date).toDateString() === new Date().toDateString()
  const firstName = state?.name?.split(' ')[0] || ''

  if (view === 'loading' || !state) return null

  // ════════════════════════════
  // ONBOARDING
  // ════════════════════════════
  if (view === 'onboarding') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <TopBar step={obStep} total={5} />
        <div className="fade-up" style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--g)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Instrument Serif',serif", fontSize: 18 }}>F</div>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.4rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>FlowEnglish</span>
          </div>

          {/* Step 1: Attempts */}
          {obStep === 1 && (
            <div key="ob1" className="fade-up">
              <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.7rem,5vw,2.2rem)', lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>¿Cuántas veces has intentado aprender inglés?</h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.65 }}>Sin juicio. Solo queremos entenderte bien.</p>
              {[['primera', 'Es mi primera vez 🌱'], ['par', 'Un par de veces 🔄'], ['muchas', 'Varias veces -- nunca me ha funcionado 😤']].map(([val, label]) => (
                <button key={val} onClick={() => { setObChoice(val); setTimeout(() => setObStep(2), 280) }} className="pressable"
                  style={{ display: 'block', width: '100%', background: obChoice === val ? 'var(--g-light)' : 'var(--surface)', border: `1.5px solid ${obChoice === val ? 'var(--g)' : 'var(--border2)'}`, borderRadius: 'var(--r)', padding: '1.1rem 1.25rem', fontSize: '0.95rem', color: obChoice === val ? 'var(--g)' : 'var(--text)', textAlign: 'left', marginBottom: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: obChoice === val ? 500 : 400, boxShadow: obChoice === val ? '0 0 0 3px rgba(29,107,78,0.1)' : 'var(--shadow-sm)' }}
                >{label}</button>
              ))}
            </div>
          )}

          {/* Step 2: Empathy */}
          {obStep === 2 && (
            <div key="ob2" className="fade-up">
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '1.2rem', color: 'var(--text)' }}>{empathy[obChoice].title}</h2>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.4rem', marginBottom: '2rem', lineHeight: 1.75, fontSize: '0.95rem', color: 'var(--text)', boxShadow: 'var(--shadow-sm)' }}>
                {empathy[obChoice].body}
              </div>
              <Btn onClick={() => setObStep(3)} fullWidth>Muéstrame cómo funciona →</Btn>
            </div>
          )}

          {/* Step 3: Name */}
          {obStep === 3 && (
            <div key="ob3" className="fade-up">
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>¿Cómo te llamas?</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>Para que tu coach te conozca desde el primer día.</p>
              <input value={obName} onChange={e => setObName(e.target.value)} placeholder="Tu nombre..." onKeyDown={e => e.key === 'Enter' && obName.trim().length > 1 && setObStep(4)}
                style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border2)', borderRadius: 'var(--r)', padding: '0.95rem 1rem', fontSize: '1rem', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}
              />
              <Btn onClick={() => setObStep(4)} disabled={obName.trim().length < 2} fullWidth>Continuar →</Btn>
            </div>
          )}

          {/* Step 4: First text */}
          {obStep === 4 && (
            <div key="ob4" className="fade-up">
              <ModuleTag label="TU PRIMER DÍA EN INGLÉS" />
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Cuéntame algo que pasó hoy, {obName.split(' ')[0]}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>En inglés, como puedas. Sin presión -- no hay notas ni calificaciones.</p>
              <TA value={obText} onChange={e => setObText(e.target.value)} placeholder="Today I..." hint="Escribe lo primero que se te ocurra" rows={5} />
              <Btn onClick={submitObText} disabled={obText.length < 10} loading={obLoading} fullWidth>Ver mi análisis →</Btn>
            </div>
          )}

          {/* Step 5: First learning */}
          {obStep === 5 && (
            <div key="ob5" className="fade-up">
              <ModuleTag label="LO QUE TU COACH VIO" color="var(--g)" bg="var(--g-light)" />
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Así empieza tu inglés real, {obName.split(' ')[0]}</h2>
              <div style={{ background: 'var(--surface)', border: `1.5px solid var(--g)`, borderRadius: 'var(--r)', padding: '1.4rem', marginBottom: '1.8rem', boxShadow: '0 0 0 4px rgba(29,107,78,0.07)', fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: fmt(obLearning) }} />
              <Btn onClick={() => { save({ onboarded: true, name: obName }); setView('home') }} fullWidth variant="primary">Entrar a FlowEnglish →</Btn>
            </div>
          )}
        </div>
      </div>
    </>
  )

  // ════════════════════════════
  // HOME
  // ════════════════════════════
  if (view === 'home') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: 'var(--g)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Instrument Serif',serif", fontSize: 14 }}>F</div>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>FlowEnglish</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setView('progress')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.82rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>Mi progreso →</button>
          </div>
        </header>

        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

          {/* Hero */}
          <div style={{ background: 'var(--g)', borderRadius: 20, padding: '1.7rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 3, fontWeight: 400 }}>{todayStr}</p>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                {greeting}{firstName ? `, ${firstName}` : ''}
              </h2>
              <p style={{ fontSize: '0.83rem', opacity: 0.75, marginBottom: '1.3rem', lineHeight: 1.55, fontStyle: 'italic' }}>"{quote}"</p>
              {todayDone && (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.55rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginBottom: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Sesión completada hoy
                </div>
              )}
              <div>
                <button onClick={startSession} className="pressable"
                  style={{ background: '#fff', color: 'var(--g)', border: 'none', borderRadius: 12, padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                  {todayDone ? 'Otra sesión →' : 'Iniciar sesión de hoy →'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '🔥', val: state.streak || 0, label: 'días de racha', color: 'var(--amber)', bg: 'var(--amber-l)' },
              { icon: '📚', val: state.vocab?.length || 0, label: 'palabras', color: 'var(--g)', bg: 'var(--g-light)' },
              { icon: '✓', val: state.sessions?.length || 0, label: 'sesiones', color: 'var(--blue)', bg: 'var(--blue-l)' },
            ].map(({ icon, val, label, color, bg }) => (
              <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '1rem', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s,box-shadow 0.15s' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.5rem', fontWeight: 400, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>



          {/* Activities */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Actividades extra</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '🃏', title: 'Mis tarjetas', desc: 'Repasa con tu Anki personal', time: '5 min', color: 'var(--g)', onClick: () => { window.location.href = '/tarjetas' } },
                { icon: '💬', title: 'Chat libre', desc: 'Conversa en inglés sobre lo que quieras', time: '5-10 min', color: 'var(--blue)', onClick: () => setView('chat-select') },
                { icon: '⚡', title: 'Duelo rápido', desc: '5 preguntas de gramática real', time: '2 min', color: 'var(--amber)', onClick: startDuel },
                { icon: '🎭', title: 'Situación real', desc: 'Roleplay de trabajo, viaje o vida real', time: '5-8 min', color: 'var(--purple)', onClick: () => setView('sit-select') },
                { icon: '🎯', title: 'Frase del día', desc: 'Una expresión nueva y útil', time: '2 min', color: 'var(--g)', onClick: loadFrase },
              ].map(({ icon, title, desc, time, color, onClick }) => (
                <div key={title} onClick={onClick} className="card-tap"
                  style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '1.1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>{desc}</div>
                  <div style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>{time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent learnings */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>Últimos aprendizajes</span>
              <button onClick={() => setView('progress')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--g)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Ver todo</button>
            </div>
            {(!state.learned || state.learned.length === 0)
              ? <div style={{ padding: '1.5rem 1.2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌱</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Aquí aparecerá lo que vayas aprendiendo.<br />Completa tu primera sesión.</div>
              </div>
              : state.learned.slice(0, 4).map((l, i) => (
                <div key={i} style={{ padding: '0.8rem 1.2rem', borderBottom: i < Math.min(3, state.learned.length - 1) ? '1px solid var(--bg)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--g)', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: 'var(--text)' }}>{l.text}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--muted2)', marginTop: 2 }}>{l.date}</div>
                  </div>
                </div>
              ))
            }
          </div>

        </div>
      </div>
    </>
  )

  // ════════════════════════════
  // SESSION WIZARD
  // ════════════════════════════
  if (view === 'session') {
    const steps = ['day', 'vocab', 'reto', 'review', 'cierre', 'done']
    const stepNum = steps.indexOf(sessionStep) + 1
    const stepTitles = { day: 'Mi día en inglés', vocab: 'Vocabulario vivo', reto: 'Mini reto', review: 'Revisión rápida', cierre: 'Cierre del día' }

    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <TopBar step={Math.min(stepNum, 5)} total={5} onBack={sessionStep === 'day' ? () => setView('home') : undefined} title={stepTitles[sessionStep]} />

          {/* MI DÍA */}
          {sessionStep === 'day' && (
            <PageContent>
              <ModuleTag label="MÓDULO 1 · MI DÍA EN INGLÉS" />
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>{dayPrompt.q}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>En inglés, como puedas. La IA adapta el resto de la sesión a lo que escribas.</p>
              <TA value={dayText} onChange={e => setDayText(e.target.value)} placeholder="Today I..." hint={dayPrompt.hint} rows={5} disabled={!!dayResp} />
              {dayWarning && <WarningBox message={dayWarning} />}
              {!dayResp
                ? <Btn onClick={submitDay} disabled={dayText.length < 15} loading={dayLoading} fullWidth>Analizar →</Btn>
                : <>
                  <FeedbackBox label="Lo que tu coach encontró" content={dayResp} />
                  <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('vocab')} fullWidth>Continuar al vocabulario →</Btn></div>
                </>
              }
            </PageContent>
          )}

          {/* VOCABULARIO */}
          {sessionStep === 'vocab' && (
            <PageContent>
              <ModuleTag label="MÓDULO 2 · VOCABULARIO VIVO" />
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>3 palabras de tu propio texto</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.4rem', lineHeight: 1.65 }}>No de un diccionario genérico -- de lo que tú mismo escribiste.</p>
              {vocabWords.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {vocabWords.map((w, i) => (
                    <div key={i} className="pop-in" style={{ background: 'var(--surface)', border: '1px solid var(--g-border)', borderRadius: 'var(--r)', padding: '1rem 1.15rem', display: 'flex', gap: 14, animationDelay: `${i * 80}ms`, boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--g-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', color: 'var(--g)', flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--g)', marginBottom: 2 }}>{w.word}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{w.def}</div>
                        <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--muted)', marginTop: 3, opacity: 0.8 }}>"{w.example}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!vocabResp
                ? <>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Usa una de estas palabras en una oración tuya:</p>
                  <TA value={vocabPractice} onChange={e => setVocabPractice(e.target.value)} placeholder="Write your sentence in English..." rows={3} />
                  {vocabWarning && <WarningBox message={vocabWarning} />}
                  <Btn onClick={submitVocab} disabled={!vocabPractice.trim()} loading={vocabLoading} fullWidth>Enviar →</Btn>
                </>
                : <>
                  <FeedbackBox label="Lo que tu coach vio" content={vocabResp} />
                  <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('reto')} fullWidth>Continuar al reto →</Btn></div>
                </>
              }
            </PageContent>
          )}

          {/* MINI RETO */}
          {sessionStep === 'reto' && (
            <PageContent>
              <ModuleTag label="MÓDULO 3 · MINI RETO" color="var(--amber)" bg="var(--amber-l)" />
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Tu patrón del día</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.4rem', lineHeight: 1.65 }}>Un solo patrón, sacado de tu texto. Así mejora el inglés real.</p>
              {!retoPattern
                ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: 14, color: 'var(--muted)' }}>
                  <Dots color="var(--amber)" /><span style={{ fontSize: '0.9rem' }}>Preparando tu reto personalizado...</span>
                </div>
                : <>
                  {!retoResp ? (
                    <>
                      {(() => {
                        const lines = retoPattern.split('\n').filter(l => l.trim())
                        const pattern = lines.find(l => l.includes('patrón') || l.includes('Patrón'))?.replace(/\*\*/g, '') || ''
                        const challenge = lines.find(l => l.includes('turno') || l.includes('inténtalo'))?.replace(/\*\*/g, '') || ''
                        return (
                          <>
                            {pattern && (
                              <div style={{ background: 'var(--surface)', border: '1px solid #F0D9B5', borderRadius: 'var(--r)', padding: '1rem 1.2rem', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>El patrón</div>
                                <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: fmt(pattern) }} />
                              </div>
                            )}
                            {challenge && (
                              <div style={{ background: 'var(--amber-l)', borderRadius: 'var(--r)', padding: '1rem 1.2rem', marginBottom: 16, border: '1px solid #F0D9B5' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tu reto</div>
                                <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: fmt(challenge) }} />
                              </div>
                            )}
                          </>
                        )
                      })()}
                      <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Practica en inglés:</p>
                      <TA value={retoInput} onChange={e => setRetoInput(e.target.value)} placeholder="Write in English..." rows={3} />
                      {retoWarning && <WarningBox message={retoWarning} />}
                      <Btn onClick={submitReto} disabled={!retoInput.trim()} loading={retoLoading} fullWidth>Verificar →</Btn>
                    </>
                  ) : (
                    <>
                      <FeedbackBox label="Lo que tu coach vio" color="var(--amber)" bgColor="var(--amber-l)" content={retoResp} />
                      <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('review')} fullWidth>Continuar a revisión →</Btn></div>
                    </>
                  )}
                </>
              }
            </PageContent>
          )}

          {/* REVISIÓN */}
          {sessionStep === 'review' && (
            <PageContent>
              <ModuleTag label="MÓDULO 4 · REVISIÓN RÁPIDA" color="var(--coral)" bg="var(--coral-l)" />
              {reviewCards.length === 0
                ? <>
                  <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.7rem', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Aún no hay tarjetas</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>Con cada sesión vas acumulando vocabulario. ¡Vuelve mañana!</p>
                  <Btn onClick={() => setSessionStep('cierre')} fullWidth>Continuar →</Btn>
                </>
                : (() => {
                  const card = reviewCards[reviewIdx]
                  const isLast = reviewIdx >= reviewCards.length - 1
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.3rem,4vw,1.7rem)', letterSpacing: '-0.03em', fontWeight: 400 }}>Revisión rápida</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '4px 12px', borderRadius: 99, fontWeight: 500 }}>{reviewIdx + 1}/{reviewCards.length}</span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: 99, height: 4, marginBottom: '1.5rem', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(((reviewIdx + (reviewFlipped ? 0.5 : 0)) / reviewCards.length) * 100)}%`, height: '100%', background: 'var(--coral)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      <div onClick={() => !reviewFlipped && setReviewFlipped(true)}
                        style={{ background: reviewFlipped ? 'var(--coral-l)' : 'var(--surface)', border: `2px solid ${reviewFlipped ? 'var(--coral)' : 'var(--border2)'}`, borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center', cursor: reviewFlipped ? 'default' : 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, boxShadow: reviewFlipped ? `0 0 0 4px rgba(184,58,34,0.08)` : 'var(--shadow-md)', marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.6rem', fontWeight: 400, color: reviewFlipped ? 'var(--coral)' : 'var(--text)' }}>{card.word}</div>
                        {reviewFlipped
                          ? <>
                            <div style={{ fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.65 }}>{card.def}</div>
                            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--muted)', padding: '8px 16px', background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--r-sm)' }}>"{card.example}"</div>
                          </>
                          : <div style={{ fontSize: '0.82rem', color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>👆</span> Toca para ver la definición
                          </div>
                        }
                      </div>
                      {reviewFlipped
                        ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {[['✓  Lo tenía', 'var(--g)', 'var(--g-light)'], ['↺  Repasar', 'var(--coral)', 'var(--coral-l)']].map(([label, color, bg]) => (
                            <button key={label} className="pressable" onClick={() => { if (isLast) setSessionStep('cierre'); else { setReviewIdx(p => p + 1); setReviewFlipped(false) } }}
                              style={{ padding: '0.8rem', borderRadius: 'var(--r)', border: `1.5px solid ${color}`, background: bg, color, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                              {label}
                            </button>
                          ))}
                        </div>
                        : <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted2)', lineHeight: 1.6 }}>Primero decide si la recuerdas -- luego voltea.</p>
                      }
                    </>
                  )
                })()
              }
            </PageContent>
          )}

          {/* CIERRE */}
          {sessionStep === 'cierre' && (
            <PageContent>
              <ModuleTag label="MÓDULO 5 · CIERRE DEL DÍA" />
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>¿Qué aprendiste hoy?</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>Tu coach te dice exactamente en qué avanzaste -- sin frases genéricas.</p>
              {!cierreText
                ? <Btn onClick={submitCierre} loading={cierreLoading} fullWidth>Ver mi resumen →</Btn>
                : <>
                  <FeedbackBox label="Tu coach dice" content={cierreText} />
                  <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('done')} fullWidth>Ver sesión completa →</Btn></div>
                </>
              }
            </PageContent>
          )}

          {/* DONE */}
          {sessionStep === 'done' && (
            <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--g-light)', border: '2.5px solid var(--g)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M8 18L15 25L28 11" stroke="var(--g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.6rem,5vw,2rem)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 8 }}>Sesión completada{firstName ? `, ${firstName}` : ''}.</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Racha: <strong style={{ color: 'var(--g)', fontWeight: 600 }}>{state.streak || 1} {(state.streak || 1) === 1 ? 'día' : 'días'}</strong>
                </p>
              </div>
              <div style={{ width: '100%', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '0.8rem 1.2rem', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lo que hiciste hoy</span>
                </div>
                {[['Mi día en inglés', 'Texto libre analizado', 'var(--purple)'], ['Vocabulario vivo', `${vocabWords.length} palabras aprendidas`, 'var(--g)'], ['Mini reto', 'Patrón gramatical practicado', 'var(--amber)'], ['Revisión rápida', `${reviewCards.length} tarjetas repasadas`, 'var(--coral)'], ['Cierre del día', 'Resumen personalizado', 'var(--g)']].map(([title, desc, color], i, arr) => (
                  <div key={title} style={{ padding: '0.8rem 1.2rem', borderBottom: i < arr.length - 1 ? '1px solid var(--bg)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.87rem', fontWeight: 500, color: 'var(--text)' }}>{title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>{desc}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="var(--g)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                ))}
              </div>
              {cierreText && (
                <div style={{ width: '100%', background: 'var(--g-light)', border: '1px solid var(--g-border)', borderRadius: 'var(--r)', padding: '1rem 1.15rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--g)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tu coach dice</div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: fmt(cierreText) }} />
                </div>
              )}
              <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>
            </div>
          )}
        </div>
      </>
    )
  }

  // ════════════════════════════
  // CHAT SELECT
  // ════════════════════════════
  if (view === 'chat-select') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Chat libre</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>Elige un tema y conversamos en inglés. Te corrijo al final -- mientras, solo habla.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatTopics.map(topic => (
              <button key={topic.es} onClick={() => startChat(topic)} className="card-tap"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '0.9rem 1.1rem', fontSize: '0.92rem', color: 'var(--text)', textAlign: 'left', fontFamily: "'DM Sans',sans-serif", fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
                <span>{topic.es}</span>
                <span style={{ color: 'var(--muted2)' }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  // ════════════════════════════
  // CHAT
  // ════════════════════════════
  if (view === 'chat') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1rem' }}>💬 {chatTopic?.es || ''}</span>
          </div>
          {!chatEnded && <button onClick={endChat} className="pressable" style={{ background: 'none', border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)', padding: '5px 14px', fontSize: '0.82rem', color: 'var(--muted)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>Terminar</button>}
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, width: '100%', margin: '0 auto' }}>
          {chatMessages.map((m, i) => <ChatBubble key={i} msg={m} />)}
          {chatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '0.8rem 1rem', boxShadow: 'var(--shadow-sm)' }}><Dots /></div>
            </div>
          )}
          {chatEnded && chatFeedback && <FeedbackBox label="Lo que tu coach notó" content={chatFeedback} />}
          {chatEnded && <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>}
        </div>
        {!chatEnded && (
          <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '0.8rem 1.25rem', display: 'flex', gap: 10, maxWidth: 560, width: '100%', margin: '0 auto' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Write in English..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
              style={{ flex: 1, background: 'var(--surface2)', border: '1.5px solid var(--border2)', borderRadius: 12, padding: '0.7rem 1rem', fontSize: '0.9rem', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }} />
            <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} className="pressable"
              style={{ background: !chatInput.trim() || chatLoading ? 'var(--muted2)' : 'var(--g)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.1rem', cursor: !chatInput.trim() || chatLoading ? 'not-allowed' : 'pointer', fontSize: '1.1rem' }}>→</button>
          </div>
        )}
      </div>
    </>
  )

  // ════════════════════════════
  // SITUACIÓN SELECT
  // ════════════════════════════
  if (view === 'sit-select') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Situación real</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>Elige una situación y la practicamos -- yo seré el otro personaje.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {situations.map(sit => (
              <button key={sit.title} onClick={() => startSituacion(sit)} className="card-tap"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem 1.1rem', textAlign: 'left', fontFamily: "'DM Sans',sans-serif", boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{sit.icon}</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{sit.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{sit.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  // ════════════════════════════
  // SITUACIÓN
  // ════════════════════════════
  if (view === 'situacion') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1rem' }}>{situacion?.icon} {situacion?.title}</span>
          </div>
          {!sitEnded && <button onClick={endSit} className="pressable" style={{ background: 'none', border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)', padding: '5px 14px', fontSize: '0.82rem', color: 'var(--muted)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>Terminar</button>}
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, width: '100%', margin: '0 auto' }}>
          {sitMessages.map((m, i) => <ChatBubble key={i} msg={m} />)}
          {sitLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '0.8rem 1rem' }}><Dots /></div>
            </div>
          )}
          {sitEnded && sitFeedback && <FeedbackBox label="Feedback del roleplay" color="var(--purple)" bgColor="var(--purple-l)" content={sitFeedback} />}
          {sitEnded && <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>}
        </div>
        {!sitEnded && (
          <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '0.8rem 1.25rem', display: 'flex', gap: 10, maxWidth: 560, width: '100%', margin: '0 auto' }}>
            <input value={sitInput} onChange={e => setSitInput(e.target.value)} placeholder="Your response in English..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendSit()}
              style={{ flex: 1, background: 'var(--surface2)', border: '1.5px solid var(--border2)', borderRadius: 12, padding: '0.7rem 1rem', fontSize: '0.9rem', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }} />
            <button onClick={sendSit} disabled={!sitInput.trim() || sitLoading} className="pressable"
              style={{ background: !sitInput.trim() || sitLoading ? 'var(--muted2)' : 'var(--purple)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.1rem', cursor: !sitInput.trim() || sitLoading ? 'not-allowed' : 'pointer', fontSize: '1.1rem' }}>→</button>
          </div>
        )}
      </div>
    </>
  )

  // ════════════════════════════
  // DUELO
  // ════════════════════════════
  if (view === 'duelo') {
    const q = duelQ[duelIdx]
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <TopBar step={duelIdx + 1} total={5} onBack={() => setView('home')} title="Duelo rápido" />
          <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!duelDone && q ? (
              <>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '1.4rem', border: '1px solid var(--border)', marginBottom: 20, boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{q.word}</div>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.4 }}>{q.q}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {q.options.map((opt, i) => {
                    const isSelected = duelSelected === i
                    const isCorrect = i === q.correct
                    const showResult = duelSelected !== null
                    let bg = 'var(--surface)', border = '1px solid var(--border)', color = 'var(--text)'
                    if (showResult && isCorrect) { bg = 'var(--g-light)'; border = `2px solid var(--g)`; color = 'var(--g)' }
                    else if (showResult && isSelected && !isCorrect) { bg = 'var(--coral-l)'; border = `2px solid var(--coral)`; color = 'var(--coral)' }
                    return (
                      <button key={i} onClick={() => { if (duelSelected !== null) return; setDuelSelected(i); if (i === q.correct) setDuelScore(p => p + 1) }} className={duelSelected === null ? 'pressable' : ''}
                        style={{ background: bg, border, borderRadius: 'var(--r)', padding: '1rem 1.2rem', cursor: duelSelected !== null ? 'default' : 'pointer', fontSize: '0.95rem', color, textAlign: 'left', fontFamily: "'DM Sans',sans-serif", fontWeight: isSelected || showResult && isCorrect ? 500 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
                        <span>{opt}</span>
                        {showResult && isCorrect && <span>✓</span>}
                        {showResult && isSelected && !isCorrect && <span>✗</span>}
                      </button>
                    )
                  })}
                </div>
                {duelSelected !== null && (
                  <>
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: 16, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
                      <strong style={{ color: 'var(--g)' }}>💡 </strong>{q.exp}
                    </div>
                    <Btn onClick={() => { if (duelIdx < 4) { setDuelIdx(p => p + 1); setDuelSelected(null) } else { setDuelDone(true); addLearned(`Duelo rápido: ${duelScore + 1}/5 correctas`) } }} fullWidth>
                      {duelIdx < 4 ? 'Siguiente →' : 'Ver resultado →'}
                    </Btn>
                  </>
                )}
              </>
            ) : duelDone ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: duelScore >= 4 ? 'var(--g-light)' : duelScore >= 2 ? 'var(--amber-l)' : 'var(--coral-l)', border: `2.5px solid ${duelScore >= 4 ? 'var(--g)' : duelScore >= 2 ? 'var(--amber)' : 'var(--coral)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Instrument Serif',serif", fontSize: '2rem', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                  {duelScore}/5
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.7rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    {duelScore === 5 ? '¡Perfecto!' : duelScore >= 3 ? '¡Bien hecho!' : 'Sigue practicando'}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    {duelScore === 5 ? 'Dominaste todas las preguntas.' : duelScore >= 3 ? `${duelScore} de 5 correctas -- vas muy bien.` : `${duelScore} de 5 -- repasa y vuelve a intentarlo.`}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  <Btn onClick={startDuel} fullWidth variant="outline">Jugar de nuevo →</Btn>
                  <Btn onClick={() => setView('home')} fullWidth variant="ghost">Volver al inicio</Btn>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════
  // FRASE DEL DÍA
  // ════════════════════════════
  if (view === 'frase') {
    const lines = (frase || '').split('\n').filter(l => l.trim())
    const getField = (key) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() || ''
    const phrase = getField('FRASE:')
    const meaning = getField('SIGNIFICADO:')
    const when = getField('CUÁNDO USARLA:')
    const example = getField('EJEMPLO:')

    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
            <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>🎯 Frase del día</span>
          </header>
          <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {fraseLoading || !frase
              ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--muted)' }}>
                <Dots /><span style={{ fontSize: '0.9rem' }}>Buscando una expresión útil para ti...</span>
              </div>
              : frase === 'ERROR'
                ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Hubo un error al cargar la frase.</p>
                  <Btn onClick={loadFrase}>Intentar de nuevo →</Btn>
                </div>
                : <>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.4rem', marginBottom: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {phrase && (
                      <div style={{ background: 'var(--g-light)', borderRadius: 'var(--r-sm)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.4rem', fontWeight: 400, color: 'var(--g)' }}>{phrase}</div>
                      </div>
                    )}
                    {meaning && (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Significado</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>{meaning}</div>
                      </div>
                    )}
                    {when && (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Cuándo usarla</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>{when}</div>
                      </div>
                    )}
                    {example && (
                      <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '0.8rem 1rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ejemplo</div>
                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.6 }}>{example}</div>
                      </div>
                    )}
                  </div>
                  {!fraseResp
                    ? <>
                      <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Ahora úsala en una oración tuya:</p>
                      <TA value={fraseInput} onChange={e => setFraseInput(e.target.value)} placeholder="Write your own sentence in English..." rows={3} />
                      <Btn onClick={submitFrase} disabled={!fraseInput.trim()} fullWidth>Enviar →</Btn>
                    </>
                    : <>
                      <FeedbackBox label="Lo que tu coach vio" content={fraseResp} />
                      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Btn onClick={loadFrase} fullWidth variant="outline">Nueva frase →</Btn>
                        <Btn onClick={() => setView('home')} fullWidth variant="ghost">Volver al inicio</Btn>
                      </div>
                    </>
                  }
                </>
            }
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════
  // PROGRESS
  // ════════════════════════════
  if (view === 'progress') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Mi progreso</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Profile card */}
          <div style={{ background: 'var(--g)', borderRadius: 'var(--r)', padding: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Instrument Serif',serif", fontSize: '1.4rem', fontWeight: 400, flexShrink: 0 }}>
              {(state.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', fontWeight: 400, marginBottom: 2 }}>{state.name || 'Aprendiz'}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>{level.code} · {level.label}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[['🔥', state.streak || 0, 'Racha', 'días'], ['📚', state.vocab?.length || 0, 'Vocabulario', 'palabras'], ['✓', state.sessions?.length || 0, 'Sesiones', 'completadas']].map(([icon, val, label, sub]) => (
              <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '1rem', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.5rem', fontWeight: 400, color: 'var(--text)', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Level progress */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '1rem 1.2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Camino de niveles</div>
            {levels.map((l, i) => {
              const isActive = l.code === level.code
              const isPast = (state.sessions?.length || 0) >= l.min
              return (
                <div key={l.code} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < levels.length - 1 ? 12 : 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isPast ? l.color : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: isPast ? '#fff' : 'var(--muted2)', flexShrink: 0, border: isActive ? `3px solid ${l.color}` : 'none', boxShadow: isActive ? `0 0 0 3px ${l.color}25` : 'none' }}>{l.code}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.87rem', fontWeight: isActive ? 600 : 400, color: isActive ? l.color : 'var(--text)' }}>{l.label}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>{l.min === 0 ? 'Nivel inicial' : `Desde ${l.min} sesiones`}</div>
                  </div>
                  {isPast && !isActive && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="var(--g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  {isActive && <div style={{ fontSize: '0.72rem', fontWeight: 700, color: l.color, background: `${l.color}15`, padding: '2px 8px', borderRadius: 99 }}>Actual</div>}
                </div>
              )
            })}
          </div>

          {/* Learned */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Todo lo que has aprendido</span>
            </div>
            {(!state.learned || state.learned.length === 0)
              ? <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🌱</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>Aún no hay registros.<br />Completa tu primera sesión.</div>
              </div>
              : state.learned.map((l, i) => (
                <div key={i} style={{ padding: '0.8rem 1.2rem', borderBottom: i < state.learned.length - 1 ? '1px solid var(--bg)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--g)', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: 'var(--text)' }}>{l.text}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--muted2)', marginTop: 2 }}>{l.date}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )

  return null
}