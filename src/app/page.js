'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v5'

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
  primera: { title: 'Bienvenido.', body: 'Vas a aprender diferente. No desde lecciones genéricas — sino desde lo que vives tú cada día. Tu inglés empieza hoy.' },
  par: { title: 'Tiene todo el sentido.', body: 'Las apps populares están diseñadas para mantenerte enganchado, no para que realmente aprendas. Esta funciona al revés.' },
  muchas: { title: 'No es tu culpa.', body: 'Las apps no estaban diseñadas para alguien como tú. Esta sí. Tu inglés de hoy — sea cual sea — es el punto de partida.' },
}

const motivational = [
  'Cada oración que escribes en inglés es un paso real.',
  'El inglés no se aprende leyendo sobre él — se aprende usándolo.',
  'Hoy es mejor que ayer. Eso es todo lo que importa.',
  'Tu día real es el mejor material de aprendizaje que existe.',
  'No hay errores aquí — solo inglés en construcción.',
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
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; }
  body { background:#F4F3EF; font-family:'Plus Jakarta Sans',sans-serif; font-weight:300; color:#1A1A1A; -webkit-font-smoothing:antialiased; }
  @keyframes pulse { 0%,80%,100%{opacity:.15;transform:scale(.65)} 40%{opacity:1;transform:scale(1)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
  .pop-in { animation: popIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  textarea { transition: border-color 0.2s, box-shadow 0.2s; }
  textarea:focus { outline:none; border-color:#2D5BE3 !important; box-shadow:0 0 0 3px rgba(45,91,227,0.1) !important; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#D3D1C7;border-radius:2px}
  .hover-lift { transition: transform 0.15s, box-shadow 0.15s; }
  .hover-lift:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; }
`

function Dots({ color = '#2D5BE3' }) {
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

function Btn({ onClick, disabled, loading, children, fullWidth, variant = 'primary' }) {
  const styles = {
    primary: { bg: disabled ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none' },
    ghost: { bg: 'transparent', color: '#6B6966', border: '1.5px solid #E0DED8' },
    success: { bg: '#0A9B6E', color: '#fff', border: 'none' },
  }
  const st = styles[variant]
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ background: st.bg, color: st.color, border: st.border, borderRadius: 14, padding: '0.9rem 1.5rem', fontSize: '0.95rem', fontWeight: 500, cursor: (disabled || loading) ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s', boxShadow: variant === 'primary' && !disabled ? '0 2px 8px rgba(45,91,227,0.25)' : 'none' }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {loading ? <><Dots color={variant === 'ghost' ? '#6B6966' : '#fff'} />{children}</> : children}
    </button>
  )
}

function FeedbackBox({ label, color, bgColor, content, delay = 0 }) {
  return (
    <div className="fade-in" style={{ background: bgColor || '#F4F3EF', border: `1.5px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: 14, padding: '1.2rem', marginTop: 16, animationDelay: `${delay}ms` }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
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
        {title && <div style={{ fontSize: '0.78rem', color: '#6B6966', marginBottom: 4, fontWeight: 500 }}>{title}</div>}
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
  return <div style={{ display: 'inline-block', background: bg, color, fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: '1.1rem', letterSpacing: '0.06em' }}>{label}</div>
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
  const [dayLoading, setDayLoading] = useState(false)
  const [vocabWords, setVocabWords] = useState([])
  const [vocabPractice, setVocabPractice] = useState('')
  const [vocabResp, setVocabResp] = useState('')
  const [vocabLoading, setVocabLoading] = useState(false)
  const [retoPattern, setRetoPattern] = useState('')
  const [retoInput, setRetoInput] = useState('')
  const [retoResp, setRetoResp] = useState('')
  const [retoLoading, setRetoLoading] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [reviewFlipped, setReviewFlipped] = useState(false)
  const [reviewDone, setReviewDone] = useState([])
  const [cierreText, setCierreText] = useState('')
  const [cierreLoading, setCierreLoading] = useState(false)
  const [sessionDayText, setSessionDayText] = useState('')
  const [sessionVocab, setSessionVocab] = useState([])
  const [quote] = useState(motivational[Math.floor(Math.random() * motivational.length)])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const init = { onboarded: false, sessions: [], vocab: [], learned: [], streak: 0, level: 'B1', name: '' }
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
    setSessionStep('day'); setDayText(''); setDayResp('')
    setVocabWords([]); setVocabPractice(''); setVocabResp('')
    setRetoPattern(''); setRetoInput(''); setRetoResp('')
    setReviewIdx(0); setReviewFlipped(false); setReviewDone([])
    setCierreText(''); setSessionDayText(''); setSessionVocab([])
    setView('session')
  }

  const dayPrompt = dayPrompts[new Date().getDay() % dayPrompts.length]
  const reviewCards = (state?.vocab || []).slice(-9).slice(0, 3)
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  // ── ONBOARDING SUBMIT ──
  async function submitObText() {
    if (obText.trim().length < 10) return
    setObLoading(true)
    try {
      const resp = await callAI(`Eres un coach de inglés cercano y motivador para hispanohablantes. RESPONDE EN ESPAÑOL natural y cálido, como si fueras un amigo que sabe inglés. El usuario escribió su primer texto en inglés: "${obText}"\n\nDa:\n1. Una observación positiva específica sobre algo que hizo bien (no genérico)\n2. Una sola mejora concreta usando sus propias palabras del texto\n\nTono: cercano, motivador, directo. Sin tecnicismos. Máximo 3 oraciones en total.`)
      setObLearning(resp)
      setObStep(4)
    } catch (e) { alert('Error: ' + e.message) }
    setObLoading(false)
  }

  // ── SESSION: MI DÍA ──
  async function submitDay() {
    if (dayText.trim().length < 15) return
    setDayLoading(true)
    setSessionDayText(dayText)
    try {
      const resp = await callAI(`Eres un coach de inglés cercano para nivel ${state?.level || 'B1'}. RESPONDE EN ESPAÑOL natural, como un amigo que te ayuda — no como un profesor formal.\n\nEl usuario escribió: "${dayText}"\n\nResponde con esta estructura exacta:\n**Lo que hiciste bien:** [Sé específico. Menciona algo concreto de su texto, no frases genéricas.]\n\n**Una cosa para mejorar:** [El error o expresión más importante. Muestra: lo que escribió → cómo suena más natural. Explica en una línea por qué.]\n\nTono: cercano, directo, motivador. Sin tecnicismos gramaticales.\n\nAl final agrega esto exactamente:\nVOCAB_JSON:[{"word":"w1","def":"def en español simple","example":"ejemplo natural en inglés"},{"word":"w2","def":"def","example":"ej"},{"word":"w3","def":"def","example":"ej"}]`)
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
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural. Texto del aprendiz nivel ${state?.level || 'B1'}: "${text}"\n\nIdentifica el patrón más útil para practicar:\n**El patrón:** [Qué es y cuándo usarlo — 1-2 oraciones simples, sin tecnicismos]\n**Tu versión mejorada:** [Toma algo de lo que escribió y muestra cómo sonaría más natural]\n**Ahora inténtalo tú:** [Una situación simple para que practique ese mismo patrón]\n\nMáximo 80 palabras. Tono: como un amigo que te corrige, no como un profesor.`)
      setRetoPattern(resp)
    } catch (e) { }
  }

  async function submitVocab() {
    if (!vocabPractice.trim()) return
    setVocabLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL cercano y natural. El aprendiz usó vocabulario (${sessionVocab.map(w => w.word).join(', ')}) escribiendo: "${vocabPractice}"\n\n¿Usó bien la palabra? ¿Qué mejorarías? Sé específico y motivador. Máximo 2-3 oraciones. Tono de amigo, no de profesor.`)
      setVocabResp(resp); addLearned(`Vocabulario: ${sessionVocab.map(w => w.word).join(', ')}`)
    } catch (e) { }
    setVocabLoading(false)
  }

  async function submitReto() {
    if (!retoInput.trim()) return
    setRetoLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL natural. El aprendiz practicó este patrón: "${retoPattern}". Escribió: "${retoInput}"\n\n¿Está bien? ¿Qué mejorarías? Muestra la versión mejorada si es necesario. 2-3 oraciones máximo. Tono motivador y cercano.`)
      setRetoResp(resp); addLearned('Gramática: patrón del día practicado')
    } catch (e) { }
    setRetoLoading(false)
  }

  async function submitCierre() {
    setCierreLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL cercano y personal. El aprendiz hizo su sesión de hoy. Escribió sobre: "${sessionDayText.substring(0, 150)}". Trabajó vocabulario: ${sessionVocab.map(w => w.word).join(', ') || 'general'}. Nivel: ${state?.level || 'B1'}.\n\nEscribe un cierre personal de 2-3 oraciones:\n1. Qué hizo bien hoy (específico, no genérico)\n2. Un consejo concreto para mañana\n\nTono: como un coach que te conoce, no como una app. Nada de "¡Excelente trabajo!" genérico.`)
      setCierreText(resp); addLearned(resp.substring(0, 90) + '...')
      save({ sessions: [...(state?.sessions || []), { date: new Date().toISOString() }], streak: (state?.streak || 0) + 1 })
    } catch (e) { }
    setCierreLoading(false)
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

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{ width: 36, height: 36, background: '#2D5BE3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 500 }}>F</div>
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
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.25, display: 'block', marginBottom: '1.5rem' }}>{empathy[obChoice].title}</span>
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 16, padding: '1.4rem', lineHeight: 1.75, fontSize: '0.95rem', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.8rem' }}>
                {empathy[obChoice].body}
              </div>
            </div>
            <Btn onClick={() => setObStep(3)} fullWidth>Muéstrame cómo funciona →</Btn>
          </div>}

          {obStep === 3 && <div key="s3" className="fade-up">
            <ModuleTag label="TU PRIMER DÍA EN INGLÉS" color="#6B3FA0" bg="#F2EDFA" />
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Cuéntame algo que pasó hoy</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>En inglés, como puedas. Sin presión — no hay notas ni calificaciones aquí.</p>
            <TA value={obText} onChange={e => setObText(e.target.value)} placeholder="Today I..." hint="Escribe lo primero que se te ocurra" rows={5} />
            <Btn onClick={submitObText} disabled={obText.length < 10} loading={obLoading} fullWidth>
              Ver mi análisis →
            </Btn>
          </div>}

          {obStep === 4 && <div key="s4" className="fade-up">
            <ModuleTag label="TU PRIMER APRENDIZAJE" color="#0A7A57" bg="#E6F7F2" />
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Esto es lo que la IA vio en tu texto</h2>
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
    const hasSession = (state.sessions || []).length > 0
    const todayDone = hasSession && new Date((state.sessions || []).slice(-1)[0]?.date).toDateString() === new Date().toDateString()

    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#FFFFFF', borderBottom: '1px solid #ECEAE4', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, background: '#2D5BE3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Fraunces',serif", fontSize: 14 }}>F</div>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>FlowEnglish</span>
            </div>
            <button onClick={() => setView('progress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              Mi progreso →
            </button>
          </header>

          <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero card */}
            <div style={{ background: '#2D5BE3', borderRadius: 20, padding: '1.6rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -20, right: 20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'relative' }}>
                <p style={{ fontSize: '0.82rem', opacity: 0.7, marginBottom: 3, fontWeight: 400 }}>{todayStr}</p>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>{greeting}</h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.3rem', lineHeight: 1.5, fontStyle: 'italic' }}>"{quote}"</p>
                {todayDone
                  ? <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.7rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                    <span>✓</span> Sesión de hoy completada
                  </div>
                  : <button onClick={startSession}
                    style={{ background: '#FFFFFF', color: '#2D5BE3', border: 'none', borderRadius: 12, padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Iniciar sesión de hoy →
                  </button>
                }
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                ['🔥', state.streak || 0, 'días de racha'],
                ['📚', state.vocab?.length || 0, 'palabras'],
                ['✓', state.sessions?.length || 0, 'sesiones'],
              ].map(([icon, val, label]) => (
                <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, padding: '0.9rem', border: '1px solid #ECEAE4', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.4rem', fontWeight: 400, color: '#1A1A1A', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6B6966', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Últimas sesiones */}
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

            {/* Si ya hizo sesión hoy, ofrecer volver a hacer */}
            {todayDone && (
              <button onClick={startSession} style={{ background: 'transparent', border: '1.5px solid #E0DED8', borderRadius: 14, padding: '0.85rem', fontSize: '0.9rem', color: '#6B6966', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 400, width: '100%', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D5BE3'; e.currentTarget.style.color = '#2D5BE3' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0DED8'; e.currentTarget.style.color = '#6B6966' }}
              >
                Hacer otra sesión →
              </button>
            )}
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════
  // SESSION WIZARD
  // ════════════════════════════
  if (view === 'session') {
    const steps = ['day', 'vocab', 'reto', 'review', 'cierre', 'done']
    const stepNum = steps.indexOf(sessionStep) + 1

    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
          <TopBar
            step={Math.min(stepNum, 5)} total={5}
            onBack={sessionStep === 'day' ? () => setView('home') : undefined}
            title={['day', 'vocab', 'reto', 'review', 'cierre'].includes(sessionStep) ? ['Mi día en inglés', 'Vocabulario vivo', 'Mini reto', 'Revisión rápida', 'Cierre del día'][steps.indexOf(sessionStep)] : undefined}
          />

          {/* ── MI DÍA EN INGLÉS ── */}
          {sessionStep === 'day' && (
            <PageContent>
              <ModuleTag label="MÓDULO 1 · MI DÍA EN INGLÉS" color="#6B3FA0" bg="#F2EDFA" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>{dayPrompt.q}</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>En inglés, como puedas. La IA analiza tu texto para personalizar el resto de la sesión.</p>
              <TA value={dayText} onChange={e => setDayText(e.target.value)} placeholder="Today I..." hint={dayPrompt.hint} rows={5} disabled={!!dayResp} />
              {!dayResp
                ? <Btn onClick={submitDay} disabled={dayText.length < 15} loading={dayLoading} fullWidth>Analizar mi inglés →</Btn>
                : <>
                  <FeedbackBox label="Lo que la IA encontró en tu texto" color="#6B3FA0" bgColor="#F9F7FE" content={dayResp} />
                  <div style={{ marginTop: 16 }}>
                    <Btn onClick={() => setSessionStep('vocab')} fullWidth>Continuar al vocabulario →</Btn>
                  </div>
                </>
              }
            </PageContent>
          )}

          {/* ── VOCABULARIO ── */}
          {sessionStep === 'vocab' && (
            <PageContent>
              <ModuleTag label="MÓDULO 2 · VOCABULARIO VIVO" color="#0A7A57" bg="#E6F7F2" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>3 palabras de tu propio texto</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.4rem', lineHeight: 1.65 }}>Extraídas de lo que acabas de escribir — no de un diccionario genérico.</p>

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

              {!vocabResp
                ? <>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>Usa una de estas palabras en tu propia oración:</p>
                  <TA value={vocabPractice} onChange={e => setVocabPractice(e.target.value)} placeholder="Write your sentence here..." rows={3} />
                  <Btn onClick={submitVocab} disabled={!vocabPractice.trim()} loading={vocabLoading} fullWidth>Enviar →</Btn>
                </>
                : <>
                  <FeedbackBox label="Feedback" color="#0A9B6E" bgColor="#F0FBF7" content={vocabResp} />
                  <div style={{ marginTop: 16 }}>
                    <Btn onClick={() => setSessionStep('reto')} fullWidth>Continuar al reto →</Btn>
                  </div>
                </>
              }
            </PageContent>
          )}

          {/* ── MINI RETO ── */}
          {sessionStep === 'reto' && (
            <PageContent>
              <ModuleTag label="MÓDULO 3 · MINI RETO" color="#B85C00" bg="#FDF3E7" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>El patrón del día</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.4rem', lineHeight: 1.65 }}>Un solo patrón, basado en tu texto. Así es como realmente se mejora el inglés.</p>

              {!retoPattern
                ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: 14, color: '#6B6966' }}>
                  <Dots color="#B85C00" />
                  <span style={{ fontSize: '0.9rem' }}>Preparando tu reto personalizado...</span>
                </div>
                : <>
                  <div style={{ background: '#FFFFFF', border: '1px solid #F0D9B5', borderRadius: 14, padding: '1.2rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div dangerouslySetInnerHTML={{ __html: fmt(retoPattern) }} style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#1A1A1A' }} />
                  </div>
                  {!retoResp
                    ? <>
                      <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>Tu turno — escribe en inglés:</p>
                      <TA value={retoInput} onChange={e => setRetoInput(e.target.value)} placeholder="Write in English..." rows={3} />
                      <Btn onClick={submitReto} disabled={!retoInput.trim()} loading={retoLoading} fullWidth>Verificar →</Btn>
                    </>
                    : <>
                      <FeedbackBox label="Corrección" color="#B85C00" bgColor="#FDF9F3" content={retoResp} />
                      <div style={{ marginTop: 16 }}>
                        <Btn onClick={() => setSessionStep('review')} fullWidth>Continuar a revisión →</Btn>
                      </div>
                    </>
                  }
                </>
              }
            </PageContent>
          )}

          {/* ── REVISIÓN ── */}
          {sessionStep === 'review' && (
            <PageContent>
              <ModuleTag label="MÓDULO 4 · REVISIÓN RÁPIDA" color="#C23B22" bg="#FDEEE9" />
              {reviewCards.length === 0
                ? <>
                  <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.7rem', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>Aún no hay tarjetas</h2>
                  <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.65, marginBottom: '1.5rem' }}>Con cada sesión vas acumulando vocabulario. Vuelve mañana y habrá tarjetas para revisar.</p>
                  <Btn onClick={() => setSessionStep('cierre')} fullWidth>Continuar →</Btn>
                </>
                : (() => {
                  const card = reviewCards[reviewIdx]
                  const isLast = reviewIdx >= reviewCards.length - 1
                  const progress = Math.round(((reviewIdx + (reviewFlipped ? 0.5 : 0)) / reviewCards.length) * 100)
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.3rem,4vw,1.7rem)', lineHeight: 1.25, letterSpacing: '-0.03em', fontWeight: 400 }}>Revisión rápida</h2>
                        <span style={{ fontSize: '0.8rem', color: '#6B6966', background: '#F4F3EF', padding: '4px 12px', borderRadius: 99, fontWeight: 500 }}>{reviewIdx + 1} / {reviewCards.length}</span>
                      </div>
                      {/* Mini progress */}
                      <div style={{ background: '#F0EFE9', borderRadius: 99, height: 4, marginBottom: '1.5rem', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#C23B22', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      {/* Card */}
                      <div onClick={() => !reviewFlipped && setReviewFlipped(true)}
                        style={{ background: reviewFlipped ? '#FDEEE9' : '#FFFFFF', border: `2px solid ${reviewFlipped ? '#C23B22' : '#E0DED8'}`, borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center', cursor: reviewFlipped ? 'default' : 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, boxShadow: reviewFlipped ? '0 0 0 4px rgba(194,59,34,0.08)' : '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 400, color: reviewFlipped ? '#C23B22' : '#1A1A1A', letterSpacing: '-0.01em' }}>{card.word}</div>
                        {reviewFlipped
                          ? <>
                            <div style={{ fontSize: '0.92rem', color: '#2A2A2A', lineHeight: 1.65 }}>{card.def}</div>
                            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#6B6966', padding: '8px 16px', background: 'rgba(0,0,0,0.04)', borderRadius: 10 }}>"{card.example}"</div>
                          </>
                          : <div style={{ fontSize: '0.82rem', color: '#B0AEA8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>👆</span> Toca para ver la definición
                          </div>
                        }
                      </div>
                      {reviewFlipped
                        ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {[['✓  Lo tenía', '#0A9B6E', '#E6F7F2'], ['↺  Repasar', '#C23B22', '#FDEEE9']].map(([label, color, bg]) => (
                            <button key={label} onClick={() => {
                              if (isLast) setSessionStep('cierre')
                              else { setReviewIdx(p => p + 1); setReviewFlipped(false) }
                            }}
                              style={{ padding: '0.8rem', borderRadius: 12, border: `1.5px solid ${color}`, background: bg, color, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, transition: 'transform 0.1s' }}
                              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
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

          {/* ── CIERRE ── */}
          {sessionStep === 'cierre' && (
            <PageContent>
              <ModuleTag label="MÓDULO 5 · CIERRE DEL DÍA" color="#0A7A57" bg="#E6F7F2" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.03em', fontWeight: 400 }}>¿Qué aprendiste hoy?</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.65 }}>Tu coach personal te dice exactamente en qué avanzaste y qué hacer mañana.</p>
              {!cierreText
                ? <Btn onClick={submitCierre} loading={cierreLoading} fullWidth>Generar mi resumen →</Btn>
                : <>
                  <FeedbackBox label="Tu resumen de hoy" color="#0A9B6E" bgColor="#F0FBF7" content={cierreText} />
                  <div style={{ marginTop: 16 }}>
                    <Btn onClick={() => setSessionStep('done')} fullWidth variant="success">Ver mi sesión completa →</Btn>
                  </div>
                </>
              }
            </PageContent>
          )}

          {/* ── DONE ── */}
          {sessionStep === 'done' && (
            <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              {/* Big checkmark */}
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E6F7F2', border: '2.5px solid #0A9B6E', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M8 18L15 25L28 11" stroke="#0A9B6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.6rem,5vw,2rem)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 8 }}>Sesión completada</h2>
                <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.6 }}>
                  Racha actual: <strong style={{ color: '#0A9B6E', fontWeight: 600 }}>{state.streak || 1} {(state.streak || 1) === 1 ? 'día' : 'días'}</strong> seguidos
                </p>
              </div>

              {/* Summary cards */}
              <div style={{ width: '100%', background: '#FFFFFF', borderRadius: 16, border: '1px solid #ECEAE4', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '0.85rem 1.25rem', background: '#F4F3EF', borderBottom: '1px solid #ECEAE4' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lo que hiciste hoy</span>
                </div>
                {[
                  ['Mi día en inglés', 'Texto libre analizado por IA', '#6B3FA0'],
                  ['Vocabulario vivo', `${vocabWords.length} palabras de tu contexto`, '#0A9B6E'],
                  ['Mini reto', 'Patrón gramatical practicado', '#B85C00'],
                  ['Revisión rápida', `${reviewCards.length} tarjetas repasadas`, '#C23B22'],
                  ['Cierre del día', 'Resumen personalizado generado', '#0A7A57'],
                ].map(([title, desc, color], i, arr) => (
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
            {[['🔥', state.streak || 0, 'Racha', 'días'], ['📚', state.vocab?.length || 0, 'Vocabulario', 'palabras'], ['✓', state.sessions?.length || 0, 'Sesiones', 'completadas']].map(([icon, val, label, sub]) => (
              <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, padding: '1rem', border: '1px solid #ECEAE4', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', fontWeight: 400, color: '#1A1A1A', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: '#6B6966', marginTop: 4 }}>{sub}</div>
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