'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v4'

const anclaPrompts = [
  '¿Cuál fue el momento más complicado de tu día hoy?',
  '¿Qué fue lo más interesante que hiciste o viste hoy?',
  '¿Tuviste que explicarle algo a alguien hoy? ¿Qué fue?',
  '¿Qué harás mañana? Cuéntame tus planes.',
  '¿Hubo algo que te preocupó o estresó hoy?',
  '¿Qué aprendiste hoy — en el trabajo, en la vida, o leyendo algo?',
  '¿Con quién hablaste hoy y de qué?',
]

const empathy = {
  primera: 'Bienvenido. Vas a empezar diferente — aprendes desde lo que vives tú cada día, no desde lecciones genéricas.',
  par: 'Tiene sentido. Las apps populares están diseñadas para engancharte, no para que aprendas de verdad.',
  muchas: 'Eso no es falta de disciplina. Es que las apps no estaban diseñadas para alguien como tú. Esta sí.',
}

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
  html, body { height: 100%; }
  body { background:#F4F3EF; font-family:'Plus Jakarta Sans',sans-serif; font-weight:300; color:#1A1A1A; }
  @keyframes pulse { 0%,80%,100%{opacity:.2;transform:scale(.7)} 40%{opacity:1;transform:scale(1)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .fade-up { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in { animation: fadeIn 0.35s ease both; }
  textarea:focus { outline:none; border-color:#2D5BE3 !important; box-shadow: 0 0 0 3px rgba(45,91,227,0.1); }
  input:focus { outline:none; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#D3D1C7;border-radius:2px}
`

function Dots({ color = '#2D5BE3' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </span>
  )
}

function TA({ value, onChange, placeholder, rows = 4, disabled }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
      style={{ width: '100%', background: disabled ? '#F0EFE9' : '#FFFFFF', border: '1.5px solid #E0DED8', borderRadius: 12, padding: '0.9rem 1rem', fontSize: '0.95rem', color: '#1A1A1A', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 300, resize: 'none', lineHeight: 1.65, marginBottom: 12, transition: 'border-color 0.2s, box-shadow 0.2s', opacity: disabled ? 0.7 : 1 }}
    />
  )
}

function PrimaryBtn({ onClick, disabled, children, fullWidth }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: disabled ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none', borderRadius: 12, padding: '0.85rem 1.5rem', fontSize: '0.95rem', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s, transform 0.1s' }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  )
}

function FeedbackBox({ label, color, content }) {
  return (
    <div className="fade-in" style={{ background: '#F4F3EF', border: `1.5px solid ${color}20`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: '1.1rem 1.1rem 1.1rem 1.2rem', marginTop: 16 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#2A2A2A' }} dangerouslySetInnerHTML={{ __html: fmt(content) }} />
    </div>
  )
}

// ── LAYOUT SHELL ──
function AppShell({ step, totalSteps, onBack, children }) {
  const pct = Math.round((step / totalSteps) * 100)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F4F3EF' }}>
      {/* Top bar */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E6E0', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 16, height: 56, flexShrink: 0 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 20, lineHeight: 1, padding: '4px 6px', borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F4F3EF'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >←</button>
        )}
        <div style={{ flex: 1, background: '#F0EFE9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#2D5BE3', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: '#6B6966', minWidth: 40, textAlign: 'right', fontWeight: 500 }}>{step}/{totalSteps}</span>
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function PageWrap({ children }) {
  return (
    <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}

export default function Home() {
  const [state, setState] = useState(null)
  const [view, setView] = useState('loading') // loading | onboarding | home | session | progress

  // Onboarding
  const [obStep, setObStep] = useState(1)
  const [obChoice, setObChoice] = useState('')
  const [obText, setObText] = useState('')
  const [obLearning, setObLearning] = useState('')
  const [obLoading, setObLoading] = useState(false)

  // Session wizard: ancla|vocab|reto|review|cierre|done
  const [sessionStep, setSessionStep] = useState('ancla')
  const [anclaText, setAnclaText] = useState('')
  const [anclaResp, setAnclaResp] = useState('')
  const [anclaLoading, setAnclaLoading] = useState(false)
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
  const [cierreText, setCierreText] = useState('')
  const [cierreLoading, setCierreLoading] = useState(false)
  const [sessionAncla, setSessionAncla] = useState('')
  const [sessionVocab, setSessionVocab] = useState([])

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
    save({ learned: [{ text, date: today }, ...ex].slice(0, 40) })
  }

  function startSession() {
    setSessionStep('ancla')
    setAnclaText(''); setAnclaResp('')
    setVocabWords([]); setVocabPractice(''); setVocabResp('')
    setRetoPattern(''); setRetoInput(''); setRetoResp('')
    setReviewIdx(0); setReviewFlipped(false)
    setCierreText('')
    setSessionAncla(''); setSessionVocab([])
    setView('session')
  }

  // ── ONBOARDING HANDLERS ──
  async function submitObText() {
    if (obText.trim().length < 10) return
    setObLoading(true)
    try {
      const resp = await callAI(`Eres un coach de inglés para hispanohablantes. RESPONDE SIEMPRE EN ESPAÑOL excepto ejemplos. El usuario escribió su primer texto: "${obText}". Da UNA observación positiva específica y UNA sugerencia concreta usando sus propias palabras. Máximo 80 palabras. Sé cálido.`)
      setObLearning(resp)
      setObStep(4)
    } catch (e) { alert('Error: ' + e.message) }
    setObLoading(false)
  }

  // ── SESSION HANDLERS ──
  async function submitAncla() {
    if (anclaText.trim().length < 15) return
    setAnclaLoading(true)
    setSessionAncla(anclaText)
    try {
      const resp = await callAI(`Eres un coach de inglés para nivel ${state?.level || 'B1'}. RESPONDE EN ESPAÑOL excepto ejemplos en inglés.\n\nEl usuario escribió: "${anclaText}"\n\nResponde con:\n**Lo que hiciste bien:** [1-2 observaciones positivas específicas]\n**Una mejora para hoy:** [error más importante → versión natural, breve explicación]\n\nAl final, agrega exactamente:\nVOCAB_JSON:[{"word":"w1","def":"definición en español","example":"ejemplo en inglés"},{"word":"w2","def":"def","example":"ej"},{"word":"w3","def":"def","example":"ej"}]`)
      const match = resp.match(/VOCAB_JSON:(\[.*?\])/s)
      let words = []; let display = resp
      if (match) { try { words = JSON.parse(match[1]); display = resp.replace(/VOCAB_JSON:.*$/s, '').trim() } catch (e) { } }
      setAnclaResp(display)
      setVocabWords(words)
      setSessionVocab(words)
      save({ vocab: [...(state?.vocab || []), ...words] })
      // Preload reto in background
      genReto(anclaText)
    } catch (e) { alert('Error: ' + e.message) }
    setAnclaLoading(false)
  }

  async function genReto(text) {
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL excepto ejemplos. Texto nivel ${state?.level || 'B1'}: "${text}"\n\nIdentifica el patrón más importante:\n**Patrón:** [explicación breve]\n**Ejemplo correcto:** [versión mejorada de lo que escribió]\n**Tu reto:** [oración para completar o reescribir]\nMáximo 70 palabras.`)
      setRetoPattern(resp)
    } catch (e) { }
  }

  async function submitVocab() {
    if (!vocabPractice.trim()) return
    setVocabLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL. El aprendiz practicó (${sessionVocab.map(w => w.word).join(', ')}) escribiendo: "${vocabPractice}". Feedback en 2-3 oraciones: ¿usó bien la palabra? ¿mejora natural? Sé específico y motivador.`)
      setVocabResp(resp)
      addLearned(`Vocabulario: ${sessionVocab.map(w => w.word).join(', ')}`)
    } catch (e) { }
    setVocabLoading(false)
  }

  async function submitReto() {
    if (!retoInput.trim()) return
    setRetoLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL excepto ejemplos. Patrón: "${retoPattern}". El aprendiz escribió: "${retoInput}". Corrección y ánimo en 2-3 oraciones. Muestra versión mejorada si necesario.`)
      setRetoResp(resp)
      addLearned('Gramática: patrón del día practicado')
    } catch (e) { }
    setRetoLoading(false)
  }

  async function submitCierre() {
    setCierreLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL. Cierre de sesión. El aprendiz escribió sobre: "${sessionAncla.substring(0, 150)}". Vocabulario: ${sessionVocab.map(w => w.word).join(', ') || 'general'}. Nivel: ${state?.level || 'B1'}. Escribe 2-3 oraciones: qué practicó hoy + foco específico para mañana. Sé concreto.`)
      setCierreText(resp)
      addLearned(resp.substring(0, 90) + '...')
      save({ sessions: [...(state?.sessions || []), { date: new Date().toISOString() }], streak: (state?.streak || 0) + 1 })
    } catch (e) { }
    setCierreLoading(false)
  }

  const reviewCards = (state?.vocab || []).slice(-9).slice(0, 3)
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  const anclaPrompt = anclaPrompts[new Date().getDay() % anclaPrompts.length]
  const sessionSteps = ['ancla', 'vocab', 'reto', 'review', 'cierre']
  const sessionStepNum = sessionSteps.indexOf(sessionStep) + 1

  if (view === 'loading' || !state) return null

  // ══════════════════════════════════════════════════════
  // ONBOARDING
  // ══════════════════════════════════════════════════════
  if (view === 'onboarding') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        {/* Progress bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E6E0', height: 56, display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: 16, flexShrink: 0 }}>
          <div style={{ flex: 1, background: '#F0EFE9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${(obStep / 4) * 100}%`, height: '100%', background: '#2D5BE3', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#6B6966', fontWeight: 500 }}>{obStep}/4</span>
        </div>

        <div className="fade-up" style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{ width: 34, height: 34, background: '#2D5BE3', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>F</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.3rem', color: '#1A1A1A', letterSpacing: '-0.02em' }}>FlowEnglish</span>
          </div>

          {/* Step 1 */}
          {obStep === 1 && <div key="ob1" className="fade-up">
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.7rem,5vw,2.2rem)', lineHeight: 1.2, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>¿Cuántas veces has intentado aprender inglés?</h1>
            <p style={{ fontSize: '0.92rem', color: '#6B6966', marginBottom: '2rem', lineHeight: 1.6 }}>Sin juicio. Solo queremos entenderte.</p>
            {[['primera', 'Es mi primera vez'], ['par', 'Un par de veces'], ['muchas', 'Varias — nunca me ha funcionado']].map(([val, label]) => (
              <button key={val} onClick={() => { setObChoice(val); setTimeout(() => setObStep(2), 250) }}
                style={{ display: 'block', width: '100%', background: obChoice === val ? '#EBF0FD' : '#FFFFFF', border: `1.5px solid ${obChoice === val ? '#2D5BE3' : '#E0DED8'}`, borderRadius: 14, padding: '1.1rem 1.25rem', cursor: 'pointer', fontSize: '0.95rem', color: obChoice === val ? '#2D5BE3' : '#1A1A1A', textAlign: 'left', marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 400, transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => { if (obChoice !== val) { e.currentTarget.style.borderColor = '#B0AEA8' } }}
                onMouseLeave={e => { if (obChoice !== val) { e.currentTarget.style.borderColor = '#E0DED8' } }}
              >{label}</button>
            ))}
          </div>}

          {/* Step 2 */}
          {obStep === 2 && <div key="ob2" className="fade-up">
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', lineHeight: 1.75, fontSize: '0.95rem', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {empathy[obChoice]}
            </div>
            <PrimaryBtn onClick={() => setObStep(3)} fullWidth>Muéstrame cómo funciona →</PrimaryBtn>
          </div>}

          {/* Step 3 */}
          {obStep === 3 && <div key="ob3" className="fade-up">
            <div style={{ display: 'inline-block', background: '#EBF0FD', color: '#2D5BE3', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 99, marginBottom: '1rem', letterSpacing: '0.04em' }}>PRIMERA SESIÓN</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>Cuéntame algo que pasó hoy</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.6 }}>En inglés, como puedas. No hay errores aquí — solo tu día.</p>
            <TA value={obText} onChange={e => setObText(e.target.value)} placeholder="Today I..." rows={5} />
            <PrimaryBtn onClick={submitObText} disabled={obLoading || obText.length < 10} fullWidth>
              {obLoading ? <><Dots color="#fff" /> Analizando...</> : 'Analizar mi inglés →'}
            </PrimaryBtn>
          </div>}

          {/* Step 4 */}
          {obStep === 4 && <div key="ob4" className="fade-up">
            <div style={{ display: 'inline-block', background: '#E6F7F2', color: '#0A7A57', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 99, marginBottom: '1rem', letterSpacing: '0.04em' }}>TU PRIMER APRENDIZAJE</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.02em', fontWeight: 400 }}>Basado en lo que escribiste</h2>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #2D5BE3', borderRadius: 16, padding: '1.4rem', marginBottom: '1.8rem', boxShadow: '0 0 0 4px rgba(45,91,227,0.08)', fontSize: '0.92rem', lineHeight: 1.8, color: '#1A1A1A' }} dangerouslySetInnerHTML={{ __html: fmt(obLearning) }} />
            <PrimaryBtn onClick={() => { save({ onboarded: true }); setView('home') }} fullWidth>Entrar a mi app →</PrimaryBtn>
          </div>}
        </div>
      </div>
    </>
  )

  // ══════════════════════════════════════════════════════
  // HOME
  // ══════════════════════════════════════════════════════
  if (view === 'home') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E6E0', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: '#2D5BE3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>F</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>FlowEnglish</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#EBF0FD', color: '#2D5BE3', fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>{state.level || 'B1'}</span>
            <span style={{ background: '#E6F7F2', color: '#0A7A57', fontSize: '0.78rem', fontWeight: 500, padding: '3px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 8 }}>●</span>{state.streak || 0} días
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Greeting card */}
          <div style={{ background: '#2D5BE3', borderRadius: 20, padding: '1.8rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: 4, fontWeight: 400 }}>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,4vw,1.9rem)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.2rem' }}>{greeting}</h2>
            <button onClick={startSession}
              style={{ background: '#FFFFFF', color: '#2D5BE3', border: 'none', borderRadius: 12, padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform 0.1s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Iniciar sesión de hoy →
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[['Sesiones', state.sessions?.length || 0, 'completadas'], ['Vocab', state.vocab?.length || 0, 'palabras'], ['Racha', state.streak || 0, 'días']].map(([label, val, sub]) => (
              <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, padding: '1rem', border: '1px solid #E8E6E0', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', fontWeight: 400, color: '#2D5BE3', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: '#6B6966', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Progress tab */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E8E6E0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Lo que has aprendido</span>
              <button onClick={() => setView('progress')} style={{ background: 'none', border: 'none', color: '#2D5BE3', fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>Ver todo →</button>
            </div>
            {(!state.learned || state.learned.length === 0)
              ? <div style={{ padding: '1.5rem 1.25rem', textAlign: 'center', color: '#B0AEA8', fontSize: '0.88rem' }}>Completa tu primera sesión para ver tu progreso.</div>
              : state.learned.slice(0, 3).map((l, i) => (
                <div key={i} style={{ padding: '0.85rem 1.25rem', borderBottom: i < 2 && state.learned.length > i + 1 ? '1px solid #F0EFE9' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A9B6E', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.87rem', lineHeight: 1.5, color: '#1A1A1A' }}>{l.text}</div>
                    <div style={{ fontSize: '0.75rem', color: '#B0AEA8', marginTop: 2 }}>{l.date}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )

  // ══════════════════════════════════════════════════════
  // SESSION WIZARD
  // ══════════════════════════════════════════════════════
  if (view === 'session') {
    const stepLabels = { ancla: 'Ancla del día', vocab: 'Vocabulario vivo', reto: 'Mini reto', review: 'Revisión rápida', cierre: 'Cierre del día', done: 'Sesión completa' }

    return (
      <>
        <style>{CSS}</style>
        <AppShell step={sessionStepNum} totalSteps={5} onBack={sessionStep === 'ancla' ? () => setView('home') : undefined}>

          {/* ── ANCLA ── */}
          {sessionStep === 'ancla' && (
            <PageWrap>
              <div style={{ display: 'inline-block', background: '#F2EDFA', color: '#6B3FA0', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: '1.2rem', letterSpacing: '0.06em' }}>MÓDULO 1 · ANCLA DEL DÍA</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>{anclaPrompt}</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.6 }}>En inglés, como puedas. No hay errores — solo tu día.</p>
              <TA value={anclaText} onChange={e => setAnclaText(e.target.value)} placeholder="Today I..." rows={5} disabled={!!anclaResp} />
              {!anclaResp && <PrimaryBtn onClick={submitAncla} disabled={anclaLoading || anclaText.length < 15} fullWidth>
                {anclaLoading ? <><Dots color="#fff" />Analizando...</> : 'Analizar →'}
              </PrimaryBtn>}
              {anclaResp && <>
                <FeedbackBox label="Análisis de tu texto" color="#6B3FA0" content={anclaResp} />
                <div style={{ marginTop: 16 }}>
                  <PrimaryBtn onClick={() => setSessionStep('vocab')} fullWidth>Continuar →</PrimaryBtn>
                </div>
              </>}
            </PageWrap>
          )}

          {/* ── VOCABULARIO ── */}
          {sessionStep === 'vocab' && (
            <PageWrap>
              <div style={{ display: 'inline-block', background: '#E6F7F2', color: '#0A7A57', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: '1.2rem', letterSpacing: '0.06em' }}>MÓDULO 2 · VOCABULARIO VIVO</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>Palabras de tu texto de hoy</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.4rem', lineHeight: 1.6 }}>Aprénde estas palabras en el contexto de lo que tú mismo escribiste.</p>
              {vocabWords.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {vocabWords.map((w, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #D4EDE6', borderRadius: 14, padding: '1rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E6F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontSize: '1.1rem', color: '#0A7A57', flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0A7A57', marginBottom: 2 }}>{w.word}</div>
                        <div style={{ fontSize: '0.82rem', color: '#6B6966', lineHeight: 1.5 }}>{w.def}</div>
                        <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#1A1A1A', marginTop: 4, opacity: 0.65 }}>"{w.example}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!vocabResp && <>
                <p style={{ fontSize: '0.88rem', color: '#1A1A1A', fontWeight: 500, marginBottom: 8 }}>Usa una de estas palabras en una oración propia:</p>
                <TA value={vocabPractice} onChange={e => setVocabPractice(e.target.value)} placeholder="Escribe tu oración en inglés..." rows={3} />
                <PrimaryBtn onClick={submitVocab} disabled={vocabLoading || !vocabPractice.trim()} fullWidth>
                  {vocabLoading ? <><Dots color="#fff" />Revisando...</> : 'Enviar oración →'}
                </PrimaryBtn>
              </>}
              {vocabResp && <>
                <FeedbackBox label="Feedback" color="#0A9B6E" content={vocabResp} />
                <div style={{ marginTop: 16 }}>
                  <PrimaryBtn onClick={() => setSessionStep('reto')} fullWidth>Continuar →</PrimaryBtn>
                </div>
              </>}
            </PageWrap>
          )}

          {/* ── MINI RETO ── */}
          {sessionStep === 'reto' && (
            <PageWrap>
              <div style={{ display: 'inline-block', background: '#FDF3E7', color: '#B85C00', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: '1.2rem', letterSpacing: '0.06em' }}>MÓDULO 3 · MINI RETO</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>El patrón del día</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.4rem', lineHeight: 1.6 }}>Basado en tu texto, aquí está el patrón que más te conviene practicar hoy.</p>
              {retoPattern
                ? <>
                  <div style={{ background: '#FFFFFF', border: '1px solid #F0D9B5', borderRadius: 14, padding: '1.1rem 1.2rem', marginBottom: 20 }}>
                    <div dangerouslySetInnerHTML={{ __html: fmt(retoPattern) }} style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#1A1A1A' }} />
                  </div>
                  {!retoResp && <>
                    <p style={{ fontSize: '0.88rem', color: '#1A1A1A', fontWeight: 500, marginBottom: 8 }}>Practica el patrón aquí:</p>
                    <TA value={retoInput} onChange={e => setRetoInput(e.target.value)} placeholder="Escribe en inglés..." rows={3} />
                    <PrimaryBtn onClick={submitReto} disabled={retoLoading || !retoInput.trim()} fullWidth>
                      {retoLoading ? <><Dots color="#fff" />Verificando...</> : 'Verificar →'}
                    </PrimaryBtn>
                  </>}
                  {retoResp && <>
                    <FeedbackBox label="Corrección" color="#B85C00" content={retoResp} />
                    <div style={{ marginTop: 16 }}>
                      <PrimaryBtn onClick={() => setSessionStep('review')} fullWidth>Continuar →</PrimaryBtn>
                    </div>
                  </>}
                </>
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: 12, color: '#6B6966', fontSize: '0.9rem' }}>
                  <Dots color="#B85C00" /><span>Preparando tu reto...</span>
                </div>
              }
            </PageWrap>
          )}

          {/* ── REVISIÓN ── */}
          {sessionStep === 'review' && (
            <PageWrap>
              <div style={{ display: 'inline-block', background: '#FDEEE9', color: '#C23B22', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: '1.2rem', letterSpacing: '0.06em' }}>MÓDULO 4 · REVISIÓN RÁPIDA</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>
                {reviewCards.length > 0 ? `Tarjeta ${reviewIdx + 1} de ${reviewCards.length}` : 'Sin tarjetas aún'}
              </h2>
              {reviewCards.length === 0
                ? <>
                  <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.6, marginBottom: '1.5rem' }}>Aún no tienes tarjetas guardadas. Con cada sesión se van acumulando. ¡Vuelve mañana!</p>
                  <PrimaryBtn onClick={() => setSessionStep('cierre')} fullWidth>Continuar →</PrimaryBtn>
                </>
                : (() => {
                  const card = reviewCards[reviewIdx]
                  const isLast = reviewIdx >= reviewCards.length - 1
                  return (
                    <>
                      <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.6 }}>Toca la tarjeta para ver si la recuerdas.</p>
                      {/* Card */}
                      <div onClick={() => setReviewFlipped(p => !p)}
                        style={{ background: reviewFlipped ? '#FDEEE9' : '#FFFFFF', border: `2px solid ${reviewFlipped ? '#C23B22' : '#E0DED8'}`, borderRadius: 18, padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: reviewFlipped ? '0 0 0 4px rgba(194,59,34,0.1)' : '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', fontWeight: 400, color: reviewFlipped ? '#C23B22' : '#1A1A1A' }}>{card.word}</div>
                        {reviewFlipped
                          ? <>
                            <div style={{ fontSize: '0.9rem', color: '#2A2A2A', lineHeight: 1.6 }}>{card.def}</div>
                            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#6B6966' }}>"{card.example}"</div>
                          </>
                          : <div style={{ fontSize: '0.8rem', color: '#B0AEA8' }}>Toca para ver la definición</div>
                        }
                      </div>
                      {/* Actions */}
                      {reviewFlipped
                        ? <div style={{ display: 'flex', gap: 10 }}>
                          {[['✓ Lo tenía', '#0A9B6E', '#E6F7F2'], ['↺ Repasar', '#C23B22', '#FDEEE9']].map(([label, color, bg]) => (
                            <button key={label}
                              onClick={() => {
                                if (isLast) { setSessionStep('cierre') }
                                else { setReviewIdx(p => p + 1); setReviewFlipped(false) }
                              }}
                              style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: `1.5px solid ${color}`, background: bg, color, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, transition: 'transform 0.1s' }}>
                              {label}
                            </button>
                          ))}
                        </div>
                        : <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#B0AEA8' }}>Decide si lo recuerdas antes de ver la respuesta</div>
                      }
                    </>
                  )
                })()
              }
            </PageWrap>
          )}

          {/* ── CIERRE ── */}
          {sessionStep === 'cierre' && (
            <PageWrap>
              <div style={{ display: 'inline-block', background: '#E6F7F2', color: '#0A7A57', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: '1.2rem', letterSpacing: '0.06em' }}>MÓDULO 5 · CIERRE DEL DÍA</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,4vw,1.85rem)', lineHeight: 1.25, marginBottom: '0.7rem', letterSpacing: '-0.02em', fontWeight: 400 }}>Resumen de tu sesión</h2>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.6 }}>¿Qué aprendiste hoy y en qué enfocarte mañana?</p>
              {cierreText
                ? <>
                  <FeedbackBox label="Tu resumen" color="#0A9B6E" content={cierreText} />
                  <div style={{ marginTop: 16 }}>
                    <PrimaryBtn onClick={() => setSessionStep('done')} fullWidth>Ver mi progreso →</PrimaryBtn>
                  </div>
                </>
                : <PrimaryBtn onClick={submitCierre} disabled={cierreLoading} fullWidth>
                  {cierreLoading ? <><Dots color="#fff" />Generando...</> : 'Generar mi resumen →'}
                </PrimaryBtn>
              }
            </PageWrap>
          )}

          {/* ── DONE ── */}
          {sessionStep === 'done' && (
            <PageWrap>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E6F7F2', border: '2px solid #0A9B6E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
                <div>
                  <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.8rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>Sesión completada</h2>
                  <p style={{ fontSize: '0.9rem', color: '#6B6966', lineHeight: 1.6 }}>Racha actual: <strong style={{ color: '#0A9B6E' }}>{state.streak || 1} días</strong></p>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '1rem 1.25rem', border: '1px solid #E8E6E0', width: '100%', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B6966', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Esta sesión</div>
                  {[['Ancla del día', 'Texto libre analizado por IA'], ['Vocabulario', '3 palabras de tu contexto'], ['Mini reto', 'Patrón gramatical practicado'], ['Revisión', 'Tarjetas de sesiones anteriores'], ['Cierre', 'Resumen personalizado']].map(([title, desc]) => (
                    <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #F0EFE9' }}>
                      <span style={{ color: '#0A9B6E', fontWeight: 700, fontSize: 14 }}>✓</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B6966' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <PrimaryBtn onClick={() => setView('home')} fullWidth>Volver al inicio →</PrimaryBtn>
              </div>
            </PageWrap>
          )}

        </AppShell>
      </>
    )
  }

  // ══════════════════════════════════════════════════════
  // PROGRESS
  // ══════════════════════════════════════════════════════
  if (view === 'progress') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F4F3EF', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E6E0', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 12, height: 56 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6966', fontSize: 20, padding: '4px 6px', borderRadius: 8 }}>←</button>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Mi progreso</span>
        </header>
        <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[['Sesiones', state.sessions?.length || 0, 'completadas', '#2D5BE3'], ['Vocabulario', state.vocab?.length || 0, 'palabras guardadas', '#0A9B6E'], ['Racha', state.streak || 0, 'días seguidos', '#B85C00']].map(([label, val, sub, color]) => (
              <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, padding: '1rem', border: '1px solid #E8E6E0', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 400, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: '#6B6966', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E8E6E0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EFE9' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Todo lo que has aprendido</span>
            </div>
            {(!state.learned || state.learned.length === 0)
              ? <div style={{ padding: '2rem', textAlign: 'center', color: '#B0AEA8', fontSize: '0.88rem' }}>Aún no hay registros. Completa tu primera sesión.</div>
              : state.learned.map((l, i) => (
                <div key={i} style={{ padding: '0.85rem 1.25rem', borderBottom: i < state.learned.length - 1 ? '1px solid #F0EFE9' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A9B6E', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.87rem', lineHeight: 1.5, color: '#1A1A1A' }}>{l.text}</div>
                    <div style={{ fontSize: '0.75rem', color: '#B0AEA8', marginTop: 2 }}>{l.date}</div>
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