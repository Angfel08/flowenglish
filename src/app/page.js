'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v6'

const dayPrompts = [
  { q: '¿Qué fue lo más difícil de hoy?', hint: 'Today the hardest thing was...' },
  { q: '¿Algo interesante que viviste hoy?', hint: 'Today I experienced...' },
  { q: '¿Tuviste que explicarle algo a alguien?', hint: 'Today I explained...' },
  { q: '¿Cuáles son tus planes para mañana?', hint: 'Tomorrow I plan to...' },
  { q: '¿Algo que te preocupó o estresó hoy?', hint: 'Today I was stressed about...' },
  { q: '¿Qué aprendiste hoy — en el trabajo o en la vida?', hint: 'Today I learned that...' },
  { q: '¿Con quién hablaste hoy y de qué?', hint: 'Today I talked to...' },
]

const empathy = {
  primera: { title: 'Bienvenido.', body: 'Vas a aprender diferente — no desde lecciones genéricas, sino desde lo que vives tú cada día. Tu inglés empieza hoy, donde estás.' },
  par: { title: 'Tiene todo el sentido.', body: 'Las apps populares están diseñadas para mantenerte enganchado, no para que realmente aprendas. Esta funciona al revés — tú eres el contenido.' },
  muchas: { title: 'No es tu culpa.', body: 'Las apps no estaban diseñadas para alguien como tú. Esta sí. Tu inglés de hoy — sea cual sea — es exactamente el punto de partida correcto.' },
}

const quotes = [
  'Cada oración que escribes en inglés es un paso real.',
  'El inglés no se aprende leyendo sobre él — se aprende usándolo.',
  'Hoy mejor que ayer. Eso es todo lo que importa.',
  'Tu día real es el mejor material de aprendizaje que existe.',
  'No hay errores aquí — solo inglés en construcción.',
  'La fluidez no llega de golpe. Llega así — un día a la vez.',
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
  { word: 'Make vs Do', q: 'I need to ___ a decision.', options: ['make', 'do', 'take', 'have'], correct: 0, exp: '"Make a decision" es la expresión correcta. "Do" se usa para actividades o tareas ("do the dishes"), "make" para crear o producir algo.' },
  { word: 'Say vs Tell', q: 'She ___ me that she was tired.', options: ['said', 'told', 'spoke', 'talked'], correct: 1, exp: '"Tell" siempre va seguido de la persona: "tell me", "tell him". "Say" no lleva objeto directo: "she said she was tired".' },
  { word: 'Since vs For', q: 'I have been working here ___ 3 years.', options: ['since', 'for', 'during', 'from'], correct: 1, exp: '"For" se usa con períodos de tiempo (3 years, 2 months). "Since" se usa con un punto específico en el tiempo (since 2021, since Monday).' },
  { word: 'Lend vs Borrow', q: 'Can you ___ me your pen?', options: ['borrow', 'lend', 'give', 'take'], correct: 1, exp: '"Lend" = dar algo temporalmente (yo te lo doy). "Borrow" = recibir algo temporalmente (yo lo tomo). "Can you lend me?" = ¿puedes prestarme?' },
  { word: 'Rise vs Raise', q: 'The company decided to ___ salaries.', options: ['rise', 'raise', 'grow', 'increase'], correct: 1, exp: '"Raise" es transitivo — necesita objeto (raise salaries, raise your hand). "Rise" es intransitivo — no lleva objeto (prices rise, the sun rises).' },
  { word: 'Affect vs Effect', q: 'Stress can ___ your health negatively.', options: ['effect', 'affect', 'impact', 'change'], correct: 1, exp: '"Affect" es el verbo (to affect something). "Effect" es el sustantivo (the effect of something). Truco: A de Affect = Acción (verbo).' },
  { word: 'Used to vs Usually', q: 'I ___ go to the gym every day when I was younger.', options: ['usually', 'used to', 'would often', 'am used to'], correct: 1, exp: '"Used to" habla de hábitos del pasado que ya no existen. "Usually" habla de hábitos actuales. "I used to go" = antes iba, ahora no.' },
  { word: 'Although vs However', q: '___ it was raining, we went for a walk.', options: ['However', 'Although', 'Despite', 'Nevertheless'], correct: 1, exp: '"Although" conecta dos ideas en una oración (although + clause). "However" conecta dos oraciones separadas con punto o punto y coma.' },
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
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; }
  body { background:#F4F3EF; font-family:'Plus Jakarta Sans',sans-serif; font-weight:300; color:#1A1A1A; -webkit-font-smoothing:antialiased; letter-spacing:-0.01em; }
  @keyframes pulse { 0%,80%,100%{opacity:.15;transform:scale(.65)} 40%{opacity:1;transform:scale(1)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in { animation: fadeIn 0.35s ease both; }
  .pop-in { animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .slide-up { animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  textarea { transition: border-color 0.2s, box-shadow 0.2s; }
  textarea:focus { outline:none; border-color:#2D5BE3 !important; box-shadow:0 0 0 3px rgba(45,91,227,0.08) !important; }
  input:focus { outline:none; border-color:#2D5BE3; box-shadow:0 0 0 3px rgba(45,91,227,0.08); }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#D3D1C7;border-radius:2px}
  .btn-press { transition: transform 0.1s, opacity 0.1s; }
  .btn-press:hover { opacity:0.92; }
  .btn-press:active { transform:scale(0.97); }
  .card-tap { transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s; }
  .card-tap:hover { border-color:#C0BEB8 !important; box-shadow:0 4px 16px rgba(0,0,0,0.09) !important; }
  .card-tap:active { transform:scale(0.99); }
`

  ({ color = '#2D5BE3' }) {
    return (
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
      </span>
    )
}

function TA({ value, onChange, placeholder, hint, rows = 5, disabled }) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
        style={{ width: '100%', background: disabled ? '#F0EFE9' : '#FFFFFF', border: `1.5px solid ${disabled ? '#E8E6E0' : '#E0DED8'}`, borderRadius: 14, padding: '0.95rem 1rem', fontSize: '0.95rem', color: '#1A1A1A', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 300, resize: 'none', lineHeight: 1.7, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: disabled ? 0.7 : 1 }}
      />
      {hint && !value && !disabled && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '0.72rem', color: '#C0BEB8', fontStyle: 'italic', pointerEvents: 'none' }}>{hint}</div>
      )}
    </div>
  )
}

function Btn({ onClick, disabled, loading, children, fullWidth, variant = 'primary', small }) {
  const v = {
    primary: { bg: disabled ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none', shadow: !disabled ? '0 2px 8px rgba(45,91,227,0.25)' : 'none' },
    ghost: { bg: 'transparent', color: '#6B6966', border: '1.5px solid #E0DED8', shadow: 'none' },
    success: { bg: '#0A9B6E', color: '#fff', border: 'none', shadow: '0 2px 8px rgba(10,155,110,0.2)' },
    danger: { bg: '#C23B22', color: '#fff', border: 'none', shadow: 'none' },
  }[variant]
  return (
    <button onClick={onClick} disabled={disabled || loading} className="btn-press"
      style={{ background: v.bg, color: v.color, border: v.border, borderRadius: 14, padding: small ? '0.6rem 1rem' : '0.9rem 1.5rem', fontSize: small ? '0.85rem' : '0.95rem', fontWeight: 500, cursor: (disabled || loading) ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s', boxShadow: v.shadow }}>
      {loading ? <><Dots color={variant === 'ghost' ? '#6B6966' : '#fff'} />{children}</> : children}
    </button>
  )
}

function FeedbackBox({ label, color, bgColor, content, delay = 0 }) {
  return (
    <div className="slide-up" style={{ background: bgColor || '#F4F3EF', border: `1px solid ${color}18`, borderLeft: `3px solid ${color}`, borderRadius: 14, padding: '1.25rem 1.2rem', marginTop: 16, animationDelay: `${delay}ms`, boxShadow: `0 1px 4px ${color}10` }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />{label}
      </div>
      <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#1A1A1A' }} dangerouslySetInnerHTML={{ __html: fmt(content) }} />
    </div>
  )
}

function TopBar({ step, total, onBack, title }) {
  return (
    <div style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 14, height: 54, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, transition: 'background 0.15s', lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.background = '#F4F3EF'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >←</button>
      )}
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontSize: '0.75rem', color: '#6B6966', marginBottom: 4, fontWeight: 500 }}>{title}</div>}
        <div style={{ background: '#F0EFE9', borderRadius: 99, height: 5, overflow: 'hidden' }}>
          <div style={{ width: `${Math.round((step / total) * 100)}%`, height: '100%', background: '#2D5BE3', borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
      </div>
      <span style={{ fontSize: '0.78rem', color: '#6B6966', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{step}/{total}</span>
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
  return <div style={{ display: 'inline-block', background: bg, color, fontSize: '0.68rem', fontWeight: 700, padding: '5px 14px', borderRadius: 99, marginBottom: '1.2rem', letterSpacing: '0.07em' }}>{label}</div>
}

function WarningBox({ message }) {
  return (
    <div className="slide-up" style={{ background: '#FDF3E7', border: '1.5px solid #F0D9B5', borderLeft: '3px solid #B85C00', borderRadius: 14, padding: '1rem 1.1rem', marginTop: 12 }}>
      <div style={{ fontSize: '0.88rem', color: '#7A3D00', lineHeight: 1.65 }}>{message}</div>
    </div>
  )
}

export default function Home() {
  const [state, setState] = useState(null)
  const [view, setView] = useState('loading')
  const [obStep, setObStep] = useState(1)
  const [obChoice, setObChoice] = useState('')
  const [obText, setObText] = useState('')
  const [obLearning, setObLearning] = useState('')
  const [obLoading, setObLoading] = useState(false)
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
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)])
  // Chat libre
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatTopic, setChatTopic] = useState('')
  const [chatEnded, setChatEnded] = useState(false)
  const [chatFeedback, setChatFeedback] = useState('')
  // Duelo
  const [duelIdx, setDuelIdx] = useState(0)
  const [duelSelected, setDuelSelected] = useState(null)
  const [duelScore, setDuelScore] = useState(0)
  const [duelDone, setDuelDone] = useState(false)
  // Situación
  const [situacion, setSituacion] = useState(null)
  const [sitMessages, setSitMessages] = useState([])
  const [sitInput, setSitInput] = useState('')
  const [sitLoading, setSitLoading] = useState(false)
  const [sitEnded, setSitEnded] = useState(false)
  const [sitFeedback, setSitFeedback] = useState('')
  // Frase
  const [frase, setFrase] = useState(null)
  const [fraseLoading, setFraseLoading] = useState(false)
  const [fraseInput, setFraseInput] = useState('')
  const [fraseResp, setFraseResp] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const init = { onboarded: false, sessions: [], vocab: [], learned: [], streak: 0, level: 'B1' }
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
    const opening = 'Let us talk about ' + topic.en + '. Answer in English as best you can:\n\nWhat can you tell me about ' + topic.en + '? Share something from your own experience.'
    setChatMessages([{ role: 'assistant', text: opening }])
    setChatInput(''); setChatEnded(false); setChatFeedback('')
    setView('chat')
  }

  function startSituacion(sit) {
    setSituacion(sit)
    setSitMessages([{ role: 'assistant', text: `Vamos a practicar: **${sit.title}**\n\n${sit.desc}.\n\nYo seré el otro personaje. Tú empieza — saluda y entra en situación. En inglés.` }])
    setSitInput(''); setSitEnded(false); setSitFeedback('')
    setView('situacion')
  }

  function startDuel() {
    const shuffled = [...duelWords].sort(() => Math.random() - 0.5).slice(0, 5)
    setDuelIdx(0); setDuelSelected(null); setDuelScore(0); setDuelDone(false)
    setView('duelo')
  }

  async function loadFrase() {
    setFraseLoading(true); setFraseInput(''); setFraseResp('')
    try {
      const resp = await callAI(`Eres coach de inglés. Genera UNA expresión o phrasal verb útil para alguien de nivel B1 que trabaja y viaja. Responde en este formato exacto:\n\nFRASE: [la expresión en inglés]\nSIGNIFICADO: [qué significa en español, en 1 línea simple]\nCUÁNDO USARLA: [1 situación concreta de trabajo o vida cotidiana]\nEJEMPLO: [oración de ejemplo natural en inglés]\n\nElige algo práctico y útil, no obvio.`)
      setFrase(resp)
    } catch (e) { }
    setFraseLoading(false)
    setView('frase')
  }

  const dayPrompt = dayPrompts[new Date().getDay() % dayPrompts.length]
  const reviewCards = (state?.vocab || []).slice(-9).slice(0, 3)
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  // ── HANDLERS ──
  async function submitObText() {
    if (obText.trim().length < 10) return
    setObLoading(true)
    try {
      const resp = await callAI(`Eres un coach de inglés cercano y motivador para hispanohablantes. RESPONDE EN ESPAÑOL natural y cálido, como si fueras un amigo bilingüe.\n\nPrimero evalúa si el texto es inglés válido (aunque imperfecto). Si el texto es claramente random, sin sentido, o no es inglés en absoluto, responde exactamente: INVALID\n\nSi es inglés válido (aunque con errores), da:\n1. Una observación positiva MUY específica sobre algo concreto del texto (no genérico)\n2. Una sola mejora usando sus propias palabras\n\nTono: amigo que te conoce, cálido, directo. Sin tecnicismos. Máximo 3 oraciones.\n\nTexto del usuario: "${obText}"`)
      if (resp.trim().startsWith('INVALID')) {
        alert('Escribe algo en inglés — aunque sea una sola oración sobre tu día. No importa si tiene errores.')
        setObLoading(false); return
      }
      setObLearning(resp); setObStep(4)
    } catch (e) { alert('Error: ' + e.message) }
    setObLoading(false)
  }

  async function submitDay() {
    if (dayText.trim().length < 15) return
    setDayLoading(true); setDayWarning('')
    setSessionDayText(dayText)
    try {
      const resp = await callAI(`Eres un coach de inglés cercano para nivel ${state?.level || 'B1'}. RESPONDE EN ESPAÑOL natural, como un amigo bilingüe que te ayuda.\n\nPrimero evalúa si el texto es inglés real (aunque con errores). Si no es inglés, responde: INVALID\nSi es muy corto o sin sentido para analizar, responde: TOO_SHORT\n\nSi es inglés válido, responde con esta estructura:\n**Buena noticia:** [Algo MUY específico que hizo bien — menciona sus palabras exactas del texto]\n\n**Una cosa para pulir:** [El error o expresión más importante. Formato: "escribiste X → suena más natural así: Y". Una línea de explicación.]\n\nTono: amigo cercano que te conoce, no profesor. Sin tecnicismos.\n\nAl final agrega:\nVOCAB_JSON:[{"word":"w1","def":"def simple en español","example":"ejemplo natural"},{"word":"w2","def":"def","example":"ej"},{"word":"w3","def":"def","example":"ej"}]\n\nTexto: "${dayText}"`)

      if (resp.trim().startsWith('INVALID')) {
        setDayWarning('Parece que esto no está en inglés. Escribe aunque sea una oración simple — el nivel no importa, solo que sea en inglés.')
        setDayLoading(false); return
      }
      if (resp.trim().startsWith('TOO_SHORT')) {
        setDayWarning('Cuéntame un poco más — con una o dos oraciones sobre tu día es suficiente para que pueda ayudarte bien.')
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
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural. Texto nivel ${state?.level || 'B1'}: "${text}"\n\nIdentifica el patrón más útil:\n**El patrón:** [Qué es y cuándo usarlo — 1-2 oraciones simples y cercanas]\n**Así se vería mejor:** [Toma algo de su texto y muéstralo mejorado]\n**Tu turno:** [Una situación simple para practicar ese patrón]\n\nMáximo 80 palabras. Tono: amigo que te corrige con cariño.`)
      setRetoPattern(resp)
    } catch (e) { }
  }

  async function submitVocab() {
    if (!vocabPractice.trim()) return
    setVocabLoading(true); setVocabWarning('')
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural.\n\nEl aprendiz debía usar una de estas palabras: ${sessionVocab.map(w => w.word).join(', ')}.\nEscribió: "${vocabPractice}"\n\nPrimero verifica: ¿usó alguna de esas palabras? ¿está en inglés?\nSi no usó ninguna de las palabras o no está en inglés, responde: INVALID\n\nSi está bien, da feedback en 2-3 oraciones: ¿la usó correctamente? ¿qué mejorarías? Sé específico y motivador. Tono de amigo.`)
      if (resp.trim().startsWith('INVALID')) {
        setVocabWarning(`Usa una de estas palabras en inglés: ${sessionVocab.map(w => w.word).join(', ')}. Puede ser una oración simple.`)
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
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural.\n\nEl aprendiz practica este patrón: "${retoPattern}"\nEscribió: "${retoInput}"\n\nVerifica: ¿intentó practicar el patrón? ¿está en inglés?\nSi no está relacionado o no es inglés, responde: INVALID\n\nSi es válido: corrección y ánimo en 2-3 oraciones. Muestra versión mejorada si necesario. Tono motivador y cercano.`)
      if (resp.trim().startsWith('INVALID')) {
        setRetoWarning('Intenta practicar el patrón en inglés — aunque sea una oración corta. No tiene que ser perfecta.')
        setRetoLoading(false); return
      }
      setRetoResp(resp); addLearned('Gramática: patrón del día practicado')
    } catch (e) { }
    setRetoLoading(false)
  }

  async function submitCierre() {
    setCierreLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL cercano y personal — como un coach que te conoce, no una app.\n\nEl aprendiz completó su sesión. Escribió sobre: "${sessionDayText.substring(0, 150)}". Vocabulario trabajado: ${sessionVocab.map(w => w.word).join(', ') || 'general'}. Nivel: ${state?.level || 'B1'}.\n\nEscribe 2-3 oraciones MUY personales:\n1. Menciona algo específico de lo que escribió hoy (usa sus propias palabras o tema)\n2. Un consejo concreto para mañana basado en lo que viste hoy\n\nNada genérico. Nada de "¡Excelente trabajo!". Habla como alguien que realmente leyó su texto.`)
      setCierreText(resp); addLearned(resp.substring(0, 90) + '...')
      save({ sessions: [...(state?.sessions || []), { date: new Date().toISOString() }], streak: (state?.streak || 0) + 1 })
    } catch (e) { }
    setCierreLoading(false)
  }

  // ── CHAT ──
  async function sendChat() {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', text: chatInput }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages); setChatInput(''); setChatLoading(true)
    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Aprendiz' : 'Coach'}: ${m.text}`).join('\n')
      const resp = await callAI(`Eres un coach de inglés amigable. Estás teniendo una conversación ORAL simulada con un aprendiz hispanohablante de nivel B1 sobre el tema: "${typeof chatTopic === 'object' ? chatTopic.en : chatTopic}".\n\nReglas:\n- Responde en inglés natural pero simple (nivel B1-B2)\n- Haz UNA sola pregunta de seguimiento al final\n- Si el aprendiz escribe en español, respóndele en español diciéndole amablemente que intente en inglés\n- Mantén la conversación fluida y natural\n- Máximo 3 oraciones de respuesta\n\nHistorial:\n${history}\n\nCoach:`)
      setChatMessages(p => [...p, { role: 'assistant', text: resp }])
    } catch (e) { }
    setChatLoading(false)
  }

  async function endChat() {
    setChatLoading(true)
    try {
      const history = chatMessages.filter(m => m.role === 'user').map(m => m.text).join(' | ')
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural y cálido.\n\nEl aprendiz tuvo una conversación en inglés sobre "${typeof chatTopic === 'object' ? chatTopic.en : chatTopic}". Sus mensajes: "${history}"\n\nDa un feedback personal de 3-4 oraciones:\n1. Algo específico que hizo bien (menciona sus palabras reales)\n2. Una expresión o patrón para mejorar\n3. Una frase de cierre motivadora\n\nTono: amigo que estuvo escuchando toda la conversación.`)
      setChatFeedback(resp); setChatEnded(true); addLearned(`Chat libre: ${typeof chatTopic === 'object' ? chatTopic.es : chatTopic}`)
    } catch (e) { }
    setChatLoading(false)
  }

  // ── SITUACIÓN ──
  async function sendSit() {
    if (!sitInput.trim()) return
    const userMsg = { role: 'user', text: sitInput }
    const newMessages = [...sitMessages, userMsg]
    setSitMessages(newMessages); setSitInput(''); setSitLoading(true)
    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Aprendiz' : 'Personaje'}: ${m.text}`).join('\n')
      const resp = await callAI(`Eres un personaje en un roleplay de inglés. La situación es: "${situacion?.title}" — ${situacion?.desc}.\n\nReglas:\n- Responde EN INGLÉS como el personaje (no como coach)\n- Sé realista pero con vocabulario B1-B2\n- Introduce pequeños desafíos naturales de la situación\n- Máximo 3 oraciones\n- Si el aprendiz escribe en español, di en inglés: "Sorry, could you say that in English?"\n\nHistorial:\n${history}\n\nPersonaje:`)
      setSitMessages(p => [...p, { role: 'assistant', text: resp }])
    } catch (e) { }
    setSitLoading(false)
  }

  async function endSit() {
    setSitLoading(true)
    try {
      const history = sitMessages.filter(m => m.role === 'user').map(m => m.text).join(' | ')
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL cercano.\n\nEl aprendiz hizo un roleplay de "${situacion?.title}". Sus intervenciones: "${history}"\n\nFeedback en 3-4 oraciones:\n1. Lo que manejó bien en la situación (específico)\n2. Una frase o expresión clave que le hubiera servido\n3. Cierre motivador\n\nTono: amigo que vio toda la actuación.`)
      setSitFeedback(resp); setSitEnded(true); addLearned(`Roleplay: ${situacion?.title}`)
    } catch (e) { }
    setSitLoading(false)
  }

  // ── FRASE ──
  async function submitFrase() {
    if (!fraseInput.trim()) return
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural.\n\nLa frase del día era:\n${frase}\n\nEl aprendiz la usó en: "${fraseInput}"\n\n¿La usó correctamente? ¿Suena natural? Feedback en 2-3 oraciones. Tono amigable.`)
      setFraseResp(resp); addLearned(`Frase del día aprendida`)
    } catch (e) { }
  }

  if (view === 'loading' || !state) return null

  // ════════════════════════════
  // ONBOARDING
  // ════════════════════════════
  if (view === 'onboarding') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <TopBar step={obStep} total={4} />
        <div className="fade-up" style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{ width: 36, height: 36, background: '#2D5BE3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Fraunces',serif", fontSize: 18 }}>F</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.4rem', color: '#1A1A1A', letterSpacing: '-0.02em' }}>FlowEnglish</span>
          </div>

          {obStep === 1 && <div key="s1" className="fade-up">
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.7rem,5vw,2.2rem)', lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>¿Cuántas veces has intentado aprender inglés?</h1>
            <p style={{ fontSize: '0.92rem', color: '#6B6966', marginBottom: '2rem', lineHeight: 1.65 }}>Sin juicio. Solo queremos entenderte bien.</p>
            {[['primera', 'Es mi primera vez 🌱'], ['par', 'Un par de veces 🔄'], ['muchas', 'Varias veces — nunca me ha funcionado 😤']].map(([val, label]) => (
              <button key={val} onClick={() => { setObChoice(val); setTimeout(() => setObStep(2), 280) }}
                style={{ display: 'block', width: '100%', background: obChoice === val ? '#EBF0FD' : '#FFFFFF', border: `1.5px solid ${obChoice === val ? '#2D5BE3' : '#E0DED8'}`, borderRadius: 14, padding: '1.1rem 1.25rem', cursor: 'pointer', fontSize: '0.95rem', color: obChoice === val ? '#2D5BE3' : '#1A1A1A', textAlign: 'left', marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: obChoice === val ? 500 : 400, transition: 'all 0.2s', boxShadow: obChoice === val ? '0 0 0 3px rgba(45,91,227,0.1)' : '0 1px 4px rgba(0,0,0,0.05)' }}
              >{label}</button>
            ))}
          </div>}

          {obStep === 2 && <div key="s2" className="fade-up">
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '1.2rem' }}>{empathy[obChoice].title}</h2>
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 16, padding: '1.4rem', marginBottom: '2rem', lineHeight: 1.75, fontSize: '0.95rem', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {empathy[obChoice].body}
            </div>
            <Btn onClick={() => setObStep(3)} fullWidth>Muéstrame cómo funciona →</Btn>
          </div>}

          {obStep === 3 && <div key="s3" className="fade-up">
            <ModuleTag label="TU PRIMER DÍA EN INGLÉS" color="#6B3FA0" bg="#F2EDFA" />
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Cuéntame algo que pasó hoy</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>En inglés, como puedas. Sin presión — no hay notas ni calificaciones.</p>
            <TA value={obText} onChange={e => setObText(e.target.value)} placeholder="Today I..." hint="Escribe lo primero que se te ocurra" rows={5} />
            <Btn onClick={submitObText} disabled={obText.length < 10} loading={obLoading} fullWidth>Ver mi análisis →</Btn>
          </div>}

          {obStep === 4 && <div key="s4" className="fade-up">
            <ModuleTag label="LO QUE TU COACH VIO" color="#0A7A57" bg="#E6F7F2" />
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Así empieza tu inglés real</h2>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #2D5BE3', borderRadius: 16, padding: '1.4rem', marginBottom: '1.8rem', boxShadow: '0 0 0 4px rgba(45,91,227,0.07)', fontSize: '0.92rem', lineHeight: 1.8, color: '#1A1A1A' }} dangerouslySetInnerHTML={{ __html: fmt(obLearning) }} />
            <Btn onClick={() => { save({ onboarded: true }); setView('home') }} fullWidth variant="success">Entrar a FlowEnglish →</Btn>
          </div>}
        </div>
      </div>
    </>
  )

  // ════════════════════════════
  // HOME
  // ════════════════════════════
  if (view === 'home') {
    const todayDone = (state.sessions || []).length > 0 && new Date((state.sessions || []).slice(-1)[0]?.date).toDateString() === new Date().toDateString()
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, background: '#2D5BE3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Fraunces',serif", fontSize: 14 }}>F</div>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>FlowEnglish</span>
            </div>
            <button onClick={() => setView('progress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>Mi progreso →</button>
          </header>

          <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg,#2D5BE3 0%,#1A3FA0 100%)', borderRadius: 20, padding: '1.6rem 1.7rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -20, right: 20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'relative' }}>
                <p style={{ fontSize: '0.82rem', opacity: 0.7, marginBottom: 3, fontWeight: 400 }}>{todayStr}</p>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>{greeting}</h2>
                <p style={{ fontSize: '0.83rem', opacity: 0.75, marginBottom: '1.3rem', lineHeight: 1.55, fontStyle: 'italic' }}>"{quote}"</p>
                {todayDone
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>✓ Sesión completada hoy</div>
                  </div>
                  : null
                }
                <button onClick={startSession}
                  style={{ background: '#FFFFFF', color: '#2D5BE3', border: 'none', borderRadius: 12, padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'transform 0.1s' }}
                >
                  {todayDone ? 'Otra sesión →' : 'Iniciar sesión de hoy →'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[['🔥', state.streak || 0, 'días de racha', '#B85C00', '#FDF3E7'], ['📚', state.vocab?.length || 0, 'palabras', '#0A7A57', '#E6F7F2'], ['✓', state.sessions?.length || 0, 'sesiones', '#2D5BE3', '#EBF0FD']].map(([icon, val, label, color, bg]) => (
                <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, padding: '0.9rem', border: '1px solid #ECEAE4', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', fontWeight: 400, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6B6966', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Actividades extra */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Actividades extra</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

                {/* Chat libre */}
                <div className="card-tap" onClick={() => setView('chat-select')} style={{ background: '#FFFFFF', borderRadius: 16, padding: '1rem', border: '1px solid #ECEAE4', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 3 }}>Chat libre</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6966', lineHeight: 1.5 }}>Conversa en inglés sobre lo que quieras</div>
                  <div style={{ fontSize: '0.7rem', color: '#2D5BE3', fontWeight: 600, marginTop: 8 }}>5-10 min</div>
                </div>

                {/* Duelo */}
                <div className="card-tap" onClick={startDuel} style={{ background: '#FFFFFF', borderRadius: 16, padding: '1rem', border: '1px solid #ECEAE4', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 3 }}>Duelo rápido</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6966', lineHeight: 1.5 }}>Elige la respuesta correcta — 5 preguntas</div>
                  <div style={{ fontSize: '0.7rem', color: '#B85C00', fontWeight: 600, marginTop: 8 }}>2 min</div>
                </div>

                {/* Situación real */}
                <div className="card-tap" onClick={() => setView('sit-select')} style={{ background: '#FFFFFF', borderRadius: 16, padding: '1rem', border: '1px solid #ECEAE4', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🎭</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 3 }}>Situación real</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6966', lineHeight: 1.5 }}>Roleplay de trabajo, viaje o vida real</div>
                  <div style={{ fontSize: '0.7rem', color: '#6B3FA0', fontWeight: 600, marginTop: 8 }}>5-8 min</div>
                </div>

                {/* Frase del día */}
                <div className="card-tap" onClick={loadFrase} style={{ background: '#FFFFFF', borderRadius: 16, padding: '1rem', border: '1px solid #ECEAE4', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 3 }}>Frase del día</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6966', lineHeight: 1.5 }}>Una expresión nueva y útil cada día</div>
                  <div style={{ fontSize: '0.7rem', color: '#0A7A57', fontWeight: 600, marginTop: 8 }}>2 min</div>
                </div>
              </div>
            </div>

            {/* Últimos aprendizajes */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #ECEAE4', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Últimos aprendizajes</span>
                <button onClick={() => setView('progress')} style={{ background: 'none', border: 'none', color: '#2D5BE3', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>Ver todo</button>
              </div>
              {(!state.learned || state.learned.length === 0)
                ? <div style={{ padding: '1.5rem 1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌱</div>
                  <div style={{ fontSize: '0.88rem', color: '#6B6966', lineHeight: 1.6 }}>Aquí aparecerá lo que vayas aprendiendo.<br />Completa tu primera sesión.</div>
                </div>
                : state.learned.slice(0, 4).map((l, i) => (
                  <div key={i} style={{ padding: '0.8rem 1.25rem', borderBottom: i < Math.min(3, state.learned.length - 1) ? '1px solid #F4F3EF' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A9B6E', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#1A1A1A' }}>{l.text}</div>
                      <div style={{ fontSize: '0.73rem', color: '#B0AEA8', marginTop: 2 }}>{l.date}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
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
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Chat libre</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>Elige un tema y conversamos en inglés. Te corrijo al final — mientras, solo habla.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatTopics.map(topic => (
              <button key={topic} onClick={() => startChat(topic)} className="card-tap"
                style={{ background: '#FFFFFF', border: '1px solid #ECEAE4', borderRadius: 14, padding: '0.9rem 1.1rem', cursor: 'pointer', fontSize: '0.92rem', color: '#1A1A1A', textAlign: 'left', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <span>{topic.es}</span>
                <span style={{ color: '#B0AEA8' }}>→</span>
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
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, lineHeight: 1 }}>←</button>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem', letterSpacing: '-0.02em' }}>{typeof chatTopic === 'object' ? '💬 ' + chatTopic.es : '💬 ' + chatTopic}</span>
          </div>
          {!chatEnded && <button onClick={endChat} style={{ background: 'none', border: '1.5px solid #E0DED8', borderRadius: 10, padding: '5px 14px', fontSize: '0.82rem', color: '#6B6966', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>Terminar</button>}
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, width: '100%', margin: '0 auto' }}>
          {chatMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ background: m.role === 'user' ? '#2D5BE3' : '#FFFFFF', color: m.role === 'user' ? '#fff' : '#1A1A1A', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '0.8rem 1rem', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: '80%', border: m.role === 'assistant' ? '1px solid #ECEAE4' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />
            </div>
          ))}
          {chatLoading && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ background: '#FFFFFF', border: '1px solid #ECEAE4', borderRadius: '18px 18px 18px 4px', padding: '0.8rem 1rem' }}><Dots /></div></div>}
          {chatEnded && chatFeedback && (
            <FeedbackBox label="Lo que tu coach notó" color="#2D5BE3" bgColor="#EBF0FD" content={chatFeedback} />
          )}
          {chatEnded && <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>}
        </div>
        {!chatEnded && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #ECEAE4', padding: '0.8rem 1.25rem', display: 'flex', gap: 10, maxWidth: 560, width: '100%', margin: '0 auto' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Write in English..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
              style={{ flex: 1, background: '#F4F3EF', border: '1.5px solid #E0DED8', borderRadius: 12, padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#1A1A1A', fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }} />
            <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
              style={{ background: !chatInput.trim() || chatLoading ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1rem', cursor: !chatInput.trim() || chatLoading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>→</button>
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
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Situación real</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>Elige una situación y la practicamos juntos — yo seré el otro personaje.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {situations.map(sit => (
              <button key={sit.title} onClick={() => startSituacion(sit)} className="card-tap"
                style={{ background: '#FFFFFF', border: '1px solid #ECEAE4', borderRadius: 14, padding: '1rem 1.1rem', cursor: 'pointer', textAlign: 'left', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{sit.icon}</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 3 }}>{sit.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B6966', lineHeight: 1.5 }}>{sit.desc}</div>
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
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, lineHeight: 1 }}>←</button>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem' }}>{situacion?.icon} {situacion?.title}</span>
          </div>
          {!sitEnded && <button onClick={endSit} style={{ background: 'none', border: '1.5px solid #E0DED8', borderRadius: 10, padding: '5px 14px', fontSize: '0.82rem', color: '#6B6966', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>Terminar</button>}
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, width: '100%', margin: '0 auto' }}>
          {sitMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ background: m.role === 'user' ? '#2D5BE3' : '#FFFFFF', color: m.role === 'user' ? '#fff' : '#1A1A1A', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '0.8rem 1rem', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: '80%', border: m.role === 'assistant' ? '1px solid #ECEAE4' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />
            </div>
          ))}
          {sitLoading && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ background: '#FFFFFF', border: '1px solid #ECEAE4', borderRadius: '18px 18px 18px 4px', padding: '0.8rem 1rem' }}><Dots /></div></div>}
          {sitEnded && sitFeedback && <FeedbackBox label="Feedback del roleplay" color="#6B3FA0" bgColor="#F2EDFA" content={sitFeedback} />}
          {sitEnded && <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>}
        </div>
        {!sitEnded && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #ECEAE4', padding: '0.8rem 1.25rem', display: 'flex', gap: 10, maxWidth: 560, width: '100%', margin: '0 auto' }}>
            <input value={sitInput} onChange={e => setSitInput(e.target.value)} placeholder="Your response in English..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendSit()}
              style={{ flex: 1, background: '#F4F3EF', border: '1.5px solid #E0DED8', borderRadius: 12, padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#1A1A1A', fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }} />
            <button onClick={sendSit} disabled={!sitInput.trim() || sitLoading}
              style={{ background: !sitInput.trim() || sitLoading ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1rem', cursor: !sitInput.trim() || sitLoading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>→</button>
          </div>
        )}
      </div>
    </>
  )

  // ════════════════════════════
  // DUELO
  // ════════════════════════════
  if (view === 'duelo') {
    const questions = duelWords.slice(0, 5)
    const q = questions[duelIdx]
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
          <TopBar step={duelIdx + 1} total={5} onBack={() => setView('home')} title="Duelo rápido" />
          <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!duelDone ? <>
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '1.4rem', border: '1px solid #ECEAE4', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B85C00', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{q.word}</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 400, color: '#1A1A1A', lineHeight: 1.4 }}>{q.q}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {q.options.map((opt, i) => {
                  const isSelected = duelSelected === i
                  const isCorrect = i === q.correct
                  const showResult = duelSelected !== null
                  let bg = '#FFFFFF', border = '1px solid #ECEAE4', color = '#1A1A1A'
                  if (showResult && isCorrect) { bg = '#E6F7F2'; border = '2px solid #0A9B6E'; color = '#0A7A57' }
                  else if (showResult && isSelected && !isCorrect) { bg = '#FDEEE9'; border = '2px solid #C23B22'; color = '#C23B22' }
                  return (
                    <button key={i} onClick={() => { if (duelSelected !== null) return; setDuelSelected(i); if (i === q.correct) setDuelScore(p => p + 1) }}
                      style={{ background: bg, border, borderRadius: 14, padding: '1rem 1.2rem', cursor: duelSelected !== null ? 'default' : 'pointer', fontSize: '0.95rem', color, textAlign: 'left', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: isSelected || showResult && isCorrect ? 500 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{opt}</span>
                      {showResult && isCorrect && <span>✓</span>}
                      {showResult && isSelected && !isCorrect && <span>✗</span>}
                    </button>
                  )
                })}
              </div>
              {duelSelected !== null && <>
                <div style={{ background: '#F4F3EF', border: '1px solid #E0DED8', borderRadius: 14, padding: '1rem', marginBottom: 16, fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>
                  <strong>💡 </strong>{q.exp}
                </div>
                <Btn onClick={() => { if (duelIdx < 4) { setDuelIdx(p => p + 1); setDuelSelected(null) } else { setDuelDone(true); addLearned(`Duelo rápido: ${duelScore + 1}/5 correctas`) } }} fullWidth>
                  {duelIdx < 4 ? 'Siguiente →' : 'Ver resultado →'}
                </Btn>
              </>}
            </> : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: duelScore >= 4 ? '#E6F7F2' : duelScore >= 2 ? '#FDF3E7' : '#FDEEE9', border: `2.5px solid ${duelScore >= 4 ? '#0A9B6E' : duelScore >= 2 ? '#B85C00' : '#C23B22'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontSize: '2rem', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                  {duelScore}/5
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    {duelScore === 5 ? '¡Perfecto!' : duelScore >= 3 ? '¡Bien hecho!' : 'Sigue practicando'}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.6 }}>
                    {duelScore === 5 ? 'Dominaste todas las preguntas de hoy.' : duelScore >= 3 ? `${duelScore} de 5 correctas — vas muy bien.` : `${duelScore} de 5 — repasa las que fallaste y vuelve a intentarlo.`}
                  </p>
                </div>
                <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════
  // FRASE DEL DÍA
  // ════════════════════════════
  if (view === 'frase') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>🎯 Frase del día</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.8rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {fraseLoading
            ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: '#6B6966' }}>
              <Dots color="#0A9B6E" /><span style={{ fontSize: '0.9rem' }}>Buscando una expresión útil para ti...</span>
            </div>
            : frase && <>
              <div style={{ background: '#FFFFFF', border: '1px solid #ECEAE4', borderRadius: 16, padding: '1.4rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {(() => {
                  const lines = frase.split('\n').filter(l => l.trim())
                  const get = (key) => { const l = lines.find(x => x.startsWith(key)); return l ? l.replace(key, '').trim() : '' }
                  const phrase = get('FRASE:')
                  const meaning = get('SIGNIFICADO:')
                  const when = get('CUÁNDO USARLA:')
                  const example = get('EJEMPLO:')
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#E6F7F2', borderRadius: 12, padding: '1rem 1.1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontFamily: "'Fraunces',serif", fontWeight: 400, color: '#0A7A57', marginBottom: 4 }}>{phrase}</div>
                      </div>
                      {meaning && <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Significado</div><div style={{ fontSize: '0.9rem', color: '#1A1A1A', lineHeight: 1.6 }}>{meaning}</div></div>}
                      {when && <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Cuándo usarla</div><div style={{ fontSize: '0.9rem', color: '#1A1A1A', lineHeight: 1.6 }}>{when}</div></div>}
                      {example && <div style={{ background: '#F4F3EF', borderRadius: 10, padding: '0.8rem 1rem' }}><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ejemplo</div><div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#1A1A1A', lineHeight: 1.6 }}>{example}</div></div>}
                    </div>
                  )
                })()}
              </div>
              {!fraseResp ? <>
                <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>Ahora úsala en tu propia oración:</p>
                <TA value={fraseInput} onChange={e => setFraseInput(e.target.value)} placeholder="Write your own sentence..." rows={3} />
                <Btn onClick={submitFrase} disabled={!fraseInput.trim()} fullWidth>Enviar →</Btn>
              </> : <>
                <FeedbackBox label="Feedback" color="#0A9B6E" bgColor="#F0FBF7" content={fraseResp} />
                <div style={{ marginTop: 16 }}>
                  <Btn onClick={() => setView('home')} fullWidth>Volver al inicio →</Btn>
                </div>
              </>}
            </>
          }
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
    const stepTitles = ['Mi día en inglés', 'Vocabulario vivo', 'Mini reto', 'Revisión rápida', 'Cierre del día']

    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
          <TopBar
            step={Math.min(stepNum, 5)} total={5}
            onBack={sessionStep === 'day' ? () => setView('home') : undefined}
            title={stepTitles[steps.indexOf(sessionStep)]}
          />

          {/* MI DÍA EN INGLÉS */}
          {sessionStep === 'day' && (
            <PageContent>
              <ModuleTag label="MÓDULO 1 · MI DÍA EN INGLÉS" color="#6B3FA0" bg="#F2EDFA" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>{dayPrompt.q}</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>En inglés, como puedas. La IA adapta el resto de la sesión a lo que escribas.</p>
              <TA value={dayText} onChange={e => setDayText(e.target.value)} placeholder="Today I..." hint={dayPrompt.hint} rows={5} disabled={!!dayResp} />
              {dayWarning && <WarningBox message={dayWarning} />}
              {!dayResp && <Btn onClick={submitDay} disabled={dayText.length < 15} loading={dayLoading} fullWidth>Analizar →</Btn>}
              {dayResp && <>
                <FeedbackBox label="Lo que tu coach encontró" color="#6B3FA0" bgColor="#F9F7FE" content={dayResp} />
                <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('vocab')} fullWidth>Continuar al vocabulario →</Btn></div>
              </>}
            </PageContent>
          )}

          {/* VOCABULARIO */}
          {sessionStep === 'vocab' && (
            <PageContent>
              <ModuleTag label="MÓDULO 2 · VOCABULARIO VIVO" color="#0A7A57" bg="#E6F7F2" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>3 palabras de tu propio texto</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.4rem', lineHeight: 1.65 }}>No de un diccionario genérico — de lo que tú mismo escribiste.</p>
              {vocabWords.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {vocabWords.map((w, i) => (
                    <div key={i} className="pop-in" style={{ background: '#FFFFFF', border: '1px solid #D4EDE6', borderRadius: 14, padding: '1rem 1.15rem', display: 'flex', gap: 14, alignItems: 'flex-start', animationDelay: `${i * 80}ms`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E6F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontSize: '1.1rem', color: '#0A7A57', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0A7A57', marginBottom: 2 }}>{w.word}</div>
                        <div style={{ fontSize: '0.82rem', color: '#6B6966', lineHeight: 1.5 }}>{w.def}</div>
                        <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#888', marginTop: 3, lineHeight: 1.5 }}>"{w.example}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!vocabResp ? <>
                <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>Usa una de estas palabras en una oración tuya:</p>
                <TA value={vocabPractice} onChange={e => setVocabPractice(e.target.value)} placeholder="Write your sentence in English..." rows={3} />
                {vocabWarning && <WarningBox message={vocabWarning} />}
                <Btn onClick={submitVocab} disabled={!vocabPractice.trim()} loading={vocabLoading} fullWidth>Enviar →</Btn>
              </> : <>
                <FeedbackBox label="Lo que tu coach vio" color="#0A9B6E" bgColor="#F0FBF7" content={vocabResp} />
                <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('reto')} fullWidth>Continuar al reto →</Btn></div>
              </>}
            </PageContent>
          )}

          {/* MINI RETO */}
          {sessionStep === 'reto' && (
            <PageContent>
              <ModuleTag label="MÓDULO 3 · MINI RETO" color="#B85C00" bg="#FDF3E7" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Tu patrón del día</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.4rem', lineHeight: 1.65 }}>Un solo patrón, sacado de tu texto. Así es como mejora el inglés real.</p>
              {!retoPattern
                ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: 14, color: '#6B6966' }}>
                  <Dots color="#B85C00" />
                  <span style={{ fontSize: '0.9rem' }}>Preparando tu reto personalizado...</span>
                </div>
                : <>
                  <div style={{ background: '#FFFFFF', border: '1px solid #F0D9B5', borderRadius: 14, padding: '1.2rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div dangerouslySetInnerHTML={{ __html: fmt(retoPattern) }} style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#1A1A1A' }} />
                  </div>
                  {!retoResp ? <>
                    <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>Tu turno — practica en inglés:</p>
                    <TA value={retoInput} onChange={e => setRetoInput(e.target.value)} placeholder="Write in English..." rows={3} />
                    {retoWarning && <WarningBox message={retoWarning} />}
                    <Btn onClick={submitReto} disabled={!retoInput.trim()} loading={retoLoading} fullWidth>Verificar →</Btn>
                  </> : <>
                    <FeedbackBox label="Lo que tu coach vio" color="#B85C00" bgColor="#FDF9F3" content={retoResp} />
                    <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('review')} fullWidth>Continuar a revisión →</Btn></div>
                  </>}
                </>
              }
            </PageContent>
          )}

          {/* REVISIÓN */}
          {sessionStep === 'review' && (
            <PageContent>
              <ModuleTag label="MÓDULO 4 · REVISIÓN RÁPIDA" color="#C23B22" bg="#FDEEE9" />
              {reviewCards.length === 0
                ? <>
                  <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.7rem', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Aún no hay tarjetas</h2>
                  <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.65, marginBottom: '1.5rem' }}>Con cada sesión vas acumulando vocabulario. ¡Vuelve mañana!</p>
                  <Btn onClick={() => setSessionStep('cierre')} fullWidth>Continuar →</Btn>
                </>
                : (() => {
                  const card = reviewCards[reviewIdx]
                  const isLast = reviewIdx >= reviewCards.length - 1
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.3rem,4vw,1.7rem)', lineHeight: 1.25, letterSpacing: '-0.03em', fontWeight: 400 }}>Revisión rápida</h2>
                        <span style={{ fontSize: '0.8rem', color: '#6B6966', background: '#F4F3EF', padding: '4px 12px', borderRadius: 99, fontWeight: 500 }}>{reviewIdx + 1}/{reviewCards.length}</span>
                      </div>
                      <div style={{ background: '#F0EFE9', borderRadius: 99, height: 4, marginBottom: '1.5rem', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(((reviewIdx + (reviewFlipped ? 0.5 : 0)) / reviewCards.length) * 100)}%`, height: '100%', background: '#C23B22', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      <div onClick={() => !reviewFlipped && setReviewFlipped(true)}
                        style={{ background: reviewFlipped ? '#FDEEE9' : '#FFFFFF', border: `2px solid ${reviewFlipped ? '#C23B22' : '#E0DED8'}`, borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center', cursor: reviewFlipped ? 'default' : 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, boxShadow: reviewFlipped ? '0 0 0 4px rgba(194,59,34,0.08)' : '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 400, color: reviewFlipped ? '#C23B22' : '#1A1A1A', letterSpacing: '-0.01em' }}>{card.word}</div>
                        {reviewFlipped
                          ? <>
                            <div style={{ fontSize: '0.92rem', color: '#2A2A2A', lineHeight: 1.65 }}>{card.def}</div>
                            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#6B6966', padding: '8px 16px', background: 'rgba(0,0,0,0.04)', borderRadius: 10 }}>"{card.example}"</div>
                          </>
                          : <div style={{ fontSize: '0.82rem', color: '#B0AEA8', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14 }}>👆</span> Toca para ver la definición</div>
                        }
                      </div>
                      {reviewFlipped
                        ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {[['✓  Lo tenía', '#0A9B6E', '#E6F7F2'], ['↺  Repasar', '#C23B22', '#FDEEE9']].map(([label, color, bg]) => (
                            <button key={label} onClick={() => { if (isLast) setSessionStep('cierre'); else { setReviewIdx(p => p + 1); setReviewFlipped(false) } }}
                              style={{ padding: '0.8rem', borderRadius: 12, border: `1.5px solid ${color}`, background: bg, color, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, transition: 'transform 0.1s' }}
                            >{label}</button>
                          ))}
                        </div>
                        : <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#B0AEA8', lineHeight: 1.6 }}>Primero decide si la recuerdas — luego voltea para verificar.</p>
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
              <ModuleTag label="MÓDULO 5 · CIERRE DEL DÍA" color="#0A7A57" bg="#E6F7F2" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>¿Qué aprendiste hoy?</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>Tu coach te dice exactamente en qué avanzaste — sin frases genéricas.</p>
              {!cierreText
                ? <Btn onClick={submitCierre} loading={cierreLoading} fullWidth>Ver mi resumen →</Btn>
                : <>
                  <FeedbackBox label="Tu coach dice" color="#0A9B6E" bgColor="#F0FBF7" content={cierreText} />
                  <div style={{ marginTop: 16 }}><Btn onClick={() => setSessionStep('done')} fullWidth variant="success">Ver sesión completa →</Btn></div>
                </>
              }
            </PageContent>
          )}

          {/* DONE */}
          {sessionStep === 'done' && (
            <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E6F7F2', border: '2.5px solid #0A9B6E', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M8 18L15 25L28 11" stroke="#0A9B6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.6rem,5vw,2rem)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 8 }}>Sesión completada</h2>
                <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.6 }}>Racha: <strong style={{ color: '#0A9B6E', fontWeight: 600 }}>{state.streak || 1} {(state.streak || 1) === 1 ? 'día' : 'días'}</strong> seguidos</p>
              </div>
              <div style={{ width: '100%', background: '#FFFFFF', borderRadius: 16, border: '1px solid #ECEAE4', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '0.85rem 1.25rem', background: '#F4F3EF', borderBottom: '1px solid #ECEAE4' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lo que hiciste hoy</span>
                </div>
                {[['Mi día en inglés', 'Texto libre analizado', '#6B3FA0'], ['Vocabulario vivo', `${vocabWords.length} palabras aprendidas`, '#0A9B6E'], ['Mini reto', 'Patrón gramatical practicado', '#B85C00'], ['Revisión rápida', `${reviewCards.length} tarjetas repasadas`, '#C23B22'], ['Cierre del día', 'Resumen personalizado', '#0A7A57']].map(([title, desc, color], i, arr) => (
                  <div key={title} style={{ padding: '0.85rem 1.25rem', borderBottom: i < arr.length - 1 ? '1px solid #F4F3EF' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.87rem', fontWeight: 500, color: '#1A1A1A' }}>{title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B6966', marginTop: 1 }}>{desc}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#0A9B6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                ))}
              </div>
              {cierreText && (
                <div style={{ width: '100%', background: '#F0FBF7', border: '1px solid #D4EDE6', borderRadius: 14, padding: '1rem 1.15rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0A7A57', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tu coach dice</div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#1A1A1A' }} dangerouslySetInnerHTML={{ __html: fmt(cierreText) }} />
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
  // PROGRESS
  // ════════════════════════════
  if (view === 'progress') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 18, padding: '6px 8px', borderRadius: 10, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Mi progreso</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[['🔥', state.streak || 0, 'días de racha'], ['📚', state.vocab?.length || 0, 'palabras guardadas'], ['✓', state.sessions?.length || 0, 'sesiones']].map(([icon, val, label]) => (
              <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, padding: '1rem', border: '1px solid #ECEAE4', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', fontWeight: 400, color: '#1A1A1A', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: '#6B6966', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #ECEAE4', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EFE9' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Todo lo que has aprendido</span>
            </div>
            {(!state.learned || state.learned.length === 0)
              ? <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🌱</div>
                <div style={{ fontSize: '0.88rem', color: '#6B6966', lineHeight: 1.65 }}>Aún no hay registros.<br />Completa tu primera sesión.</div>
              </div>
              : state.learned.map((l, i) => (
                <div key={i} style={{ padding: '0.85rem 1.25rem', borderBottom: i < state.learned.length - 1 ? '1px solid #F4F3EF' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A9B6E', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#1A1A1A' }}>{l.text}</div>
                    <div style={{ fontSize: '0.73rem', color: '#B0AEA8', marginTop: 2 }}>{l.date}</div>
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