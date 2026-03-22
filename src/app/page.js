'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v3'

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
  primera: 'Bienvenido. Vas a empezar diferente. Sin lecciones genéricas — aprendes desde lo que vives tú cada día.',
  par: 'Tiene sentido que no te haya funcionado. Las apps populares están diseñadas para engancharte, no para que aprendas de verdad.',
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

function Dots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.5 }} />
      ))}
    </span>
  )
}

function ProgressBar({ value, total }) {
  const pct = Math.round((value / total) * 100)
  return (
    <div style={{ background: '#E8E6E0', borderRadius: 99, height: 5, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: '#2D5BE3', borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function ModuleCard({ icon, title, mins, borderColor, bgColor, status, open, onToggle, children, locked }) {
  const badges = {
    done: { bg: '#E6F7F2', color: '#0A7A57', label: 'Completado' },
    active: { bg: '#EBF0FD', color: '#2D5BE3', label: 'En curso' },
    locked: { bg: '#F0EFE9', color: '#B0AEA8', label: 'Bloqueado' },
    pending: { bg: '#F0EFE9', color: '#6B6966', label: 'Pendiente' },
  }
  const b = badges[status] || badges.pending
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 16, border: `1.5px solid ${open ? borderColor : '#E8E6E0'}`, boxShadow: open ? `0 0 0 3px ${bgColor}` : '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.25s ease', overflow: 'hidden', opacity: locked ? 0.5 : 1 }}>
      <div onClick={locked ? undefined : onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: locked ? 'default' : 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1A1A1A' }}>{title}</div>
            <div style={{ fontSize: '0.75rem', color: '#6B6966', marginTop: 2 }}>{mins}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: b.bg, color: b.color }}>{b.label}</span>
          {!locked && <span style={{ color: '#B0AEA8', fontSize: 11, transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>}
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F0EFE9' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function AIBox({ label, color, content }) {
  return (
    <div style={{ background: '#F7F6F2', border: '1px solid #E8E6E0', borderRadius: 10, padding: '1rem', marginTop: 10 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
      </div>
      <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#1A1A1A' }} dangerouslySetInnerHTML={{ __html: fmt(content) }} />
    </div>
  )
}

function TA({ value, onChange, placeholder, rows = 4, disabled }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
      style={{ width: '100%', background: disabled ? '#F7F6F2' : '#FAFAF8', border: '1.5px solid #E8E6E0', borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#1A1A1A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, resize: 'none', lineHeight: 1.65, outline: 'none', marginBottom: 10, transition: 'border-color 0.2s', opacity: disabled ? 0.6 : 1 }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = '#2D5BE3' }}
      onBlur={e => e.target.style.borderColor = '#E8E6E0'}
    />
  )
}

function Btn({ onClick, disabled, children, full }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: disabled ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem', fontSize: '0.88rem', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}>
      {children}
    </button>
  )
}

export default function Home() {
  const [state, setState] = useState(null)
  const [screen, setScreen] = useState('loading')
  const [obStep, setObStep] = useState(1)
  const [obChoice, setObChoice] = useState('')
  const [obText, setObText] = useState('')
  const [obLearning, setObLearning] = useState('')
  const [obLoading, setObLoading] = useState(false)
  const [tab, setTab] = useState('session')
  const [openMod, setOpenMod] = useState('ancla')
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
  const [flipped, setFlipped] = useState({})
  const [cierreText, setCierreText] = useState('')
  const [cierreLoading, setCierreLoading] = useState(false)
  const [done, setDone] = useState({})
  const [sessionAncla, setSessionAncla] = useState('')
  const [sessionVocab, setSessionVocab] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const init = { onboarded: false, sessions: [], vocab: [], learned: [], streak: 0, level: 'B1' }
    const s = saved ? { ...init, ...JSON.parse(saved) } : init
    setState(s)
    setScreen(s.onboarded ? 'app' : 'onboarding')
  }, [])

  function save(updates) {
    const next = { ...state, ...updates }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }

  function markDone(mod) { setDone(p => ({ ...p, [mod]: true })) }

  function addLearned(text) {
    const today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    const ex = state?.learned || []
    if (ex.find(l => l.text === text)) return
    save({ learned: [{ text, date: today }, ...ex].slice(0, 30) })
  }

  const doneCount = Object.keys(done).length

  async function submitOb() {
    if (obText.trim().length < 10) return
    setObLoading(true)
    try {
      const resp = await callAI(`Eres un coach de inglés para hispanohablantes. RESPONDE SIEMPRE EN ESPAÑOL excepto ejemplos en inglés. El usuario escribió su primer texto en inglés: "${obText}". Da UNA observación positiva específica y UNA sugerencia concreta usando sus propias palabras. Máximo 80 palabras. Sé cálido y directo.`)
      setObLearning(resp)
      setObStep(4)
    } catch (e) { alert('Error: ' + e.message) }
    setObLoading(false)
  }

  async function submitAncla() {
    if (anclaText.trim().length < 15) return
    setAnclaLoading(true)
    setSessionAncla(anclaText)
    try {
      const resp = await callAI(`Eres un coach de inglés para un hispanohablante nivel ${state?.level || 'B1'}. RESPONDE EN ESPAÑOL excepto ejemplos. El usuario escribió: "${anclaText}"\n\nResponde con esta estructura:\n**Lo que hiciste bien:** [1-2 observaciones positivas específicas]\n**Una mejora para hoy:** [error más importante, muestra su versión → versión natural]\n\nAl final agrega exactamente:\nVOCAB_JSON:[{"word":"w1","def":"def en español","example":"ejemplo en inglés"},{"word":"w2","def":"def","example":"ejemplo"},{"word":"w3","def":"def","example":"ejemplo"}]`)
      const match = resp.match(/VOCAB_JSON:(\[.*?\])/s)
      let words = []
      let display = resp
      if (match) { try { words = JSON.parse(match[1]); display = resp.replace(/VOCAB_JSON:.*$/s, '').trim() } catch (e) { } }
      setAnclaResp(display)
      setVocabWords(words)
      setSessionVocab(words)
      markDone('ancla')
      save({ vocab: [...(state?.vocab || []), ...words] })
      await genReto(anclaText)
      setTimeout(() => setOpenMod('vocab'), 500)
    } catch (e) { alert('Error: ' + e.message) }
    setAnclaLoading(false)
  }

  async function genReto(text) {
    try {
      const resp = await callAI(`Eres un coach de inglés. RESPONDE EN ESPAÑOL excepto ejemplos. Texto del aprendiz nivel ${state?.level || 'B1'}: "${text}"\n\nIdentifica el patrón más importante a practicar:\n**Patrón:** [explicación breve]\n**Ejemplo correcto:** [versión mejorada de algo que escribió]\n**Tu reto:** [oración para completar o reescribir]\nMáximo 70 palabras.`)
      setRetoPattern(resp)
      markDone('reto')
    } catch (e) { }
  }

  async function submitVocab() {
    if (!vocabPractice.trim()) return
    setVocabLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL. El aprendiz practicó vocabulario (${sessionVocab.map(w => w.word).join(', ')}) escribiendo: "${vocabPractice}". Feedback breve (2-3 oraciones): ¿usó bien la palabra? ¿mejora natural? Sé específico y motivador.`)
      setVocabResp(resp)
      markDone('vocab')
      addLearned(`Vocabulario: ${sessionVocab.map(w => w.word).join(', ')}`)
      setTimeout(() => setOpenMod('reto'), 500)
    } catch (e) { }
    setVocabLoading(false)
  }

  async function submitReto() {
    if (!retoInput.trim()) return
    setRetoLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL excepto ejemplos. Patrón practicado: "${retoPattern}". El aprendiz escribió: "${retoInput}". Corrección y ánimo en 2-3 oraciones. Muestra versión mejorada si es necesario.`)
      setRetoResp(resp)
      markDone('retoComplete')
      addLearned('Gramática: patrón del día practicado')
      setTimeout(() => setOpenMod('review'), 500)
    } catch (e) { }
    setRetoLoading(false)
  }

  async function genCierre() {
    setCierreLoading(true)
    try {
      const resp = await callAI(`Eres coach de inglés. RESPONDE EN ESPAÑOL. Resumen de cierre de sesión. Aprendiz escribió sobre: "${sessionAncla.substring(0, 150)}". Vocabulario: ${sessionVocab.map(w => w.word).join(', ') || 'general'}. Nivel: ${state?.level || 'B1'}. Escribe 2-3 oraciones concretas: qué practicó hoy + foco específico para mañana. Nada genérico.`)
      setCierreText(resp)
      markDone('cierre')
      addLearned(resp.substring(0, 90) + '...')
      save({ sessions: [...(state?.sessions || []), { date: new Date().toISOString() }], streak: (state?.streak || 0) + 1 })
    } catch (e) { }
    setCierreLoading(false)
  }

  const reviewCards = (state?.vocab || []).slice(-6).slice(0, 3)
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches' })()
  const dateStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  if (screen === 'loading' || !state) return null

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { background:#F7F6F2; font-family:'Plus Jakarta Sans',sans-serif; font-weight:300; }
    @keyframes pulse { 0%,80%,100%{opacity:.2;transform:scale(.7)} 40%{opacity:1;transform:scale(1)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .fade-up { animation: fadeUp 0.45s ease both; }
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#D3D1C7;border-radius:2px}
  `

  // ── ONBOARDING ──
  if (screen === 'onboarding') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 460 }} className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
            <div style={{ width: 36, height: 36, background: '#2D5BE3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700 }}>F</div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', color: '#1A1A1A', letterSpacing: '-0.02em' }}>FlowEnglish</span>
          </div>

          {obStep === 1 && <div className="fade-up">
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.6rem,4vw,2rem)', lineHeight: 1.2, marginBottom: '0.6rem', letterSpacing: '-0.02em', fontWeight: 400 }}>¿Cuántas veces has intentado aprender inglés?</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.8rem', lineHeight: 1.6 }}>Sin juicio. Solo queremos entenderte.</p>
            {[['primera', 'Es mi primera vez'], ['par', 'Un par de veces'], ['muchas', 'Varias — nunca me ha funcionado']].map(([val, label]) => (
              <button key={val} onClick={() => { setObChoice(val); setTimeout(() => setObStep(2), 250) }}
                style={{ display: 'block', width: '100%', background: obChoice === val ? '#EBF0FD' : '#FFFFFF', border: `1.5px solid ${obChoice === val ? '#2D5BE3' : '#E8E6E0'}`, borderRadius: 14, padding: '1rem 1.25rem', cursor: 'pointer', fontSize: '0.95rem', color: obChoice === val ? '#2D5BE3' : '#1A1A1A', textAlign: 'left', marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 400, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>}

          {obStep === 2 && <div className="fade-up">
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', lineHeight: 1.7, fontSize: '0.95rem', color: '#6B6966' }}>
              <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{empathy[obChoice].split('.')[0]}.</span>{' '}
              {empathy[obChoice].split('.').slice(1).join('.')}
            </div>
            <button onClick={() => setObStep(3)} style={{ width: '100%', background: '#2D5BE3', color: '#fff', border: 'none', borderRadius: 14, padding: '1rem', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Muéstrame cómo funciona →
            </button>
          </div>}

          {obStep === 3 && <div className="fade-up">
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,3.5vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.6rem', letterSpacing: '-0.02em', fontWeight: 400 }}>Tu primera sesión — ahora mismo</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.5rem', lineHeight: 1.6 }}>Cuéntame algo que pasó hoy, en inglés. Como puedas. No hay errores aquí.</p>
            <TA value={obText} onChange={e => setObText(e.target.value)} placeholder="Today I..." rows={4} />
            <button onClick={submitOb} disabled={obLoading || obText.length < 10}
              style={{ width: '100%', background: obLoading || obText.length < 10 ? '#B0C4F5' : '#2D5BE3', color: '#fff', border: 'none', borderRadius: 14, padding: '1rem', fontSize: '0.95rem', fontWeight: 500, cursor: obLoading || obText.length < 10 ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {obLoading ? <><Dots /> Analizando...</> : 'Analizar mi inglés →'}
            </button>
          </div>}

          {obStep === 4 && <div className="fade-up">
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,3.5vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.6rem', letterSpacing: '-0.02em', fontWeight: 400 }}>Tu primer aprendizaje</h2>
            <p style={{ fontSize: '0.9rem', color: '#6B6966', marginBottom: '1.2rem' }}>Basado en lo que escribiste:</p>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #2D5BE3', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 0 0 3px #EBF0FD', fontSize: '0.92rem', lineHeight: 1.75, color: '#1A1A1A' }} dangerouslySetInnerHTML={{ __html: fmt(obLearning) }} />
            <button onClick={() => { save({ onboarded: true }); setScreen('app') }} style={{ width: '100%', background: '#2D5BE3', color: '#fff', border: 'none', borderRadius: 14, padding: '1rem', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Entrar a mi app →
            </button>
          </div>}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '2rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: i === obStep ? 20 : 6, height: 6, borderRadius: 99, background: i === obStep ? '#2D5BE3' : '#D3D1C7', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>
    </>
  )

  // ── MAIN APP ──
  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F7F6F2' }}>

        <header style={{ background: 'rgba(247,246,242,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8E6E0', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, background: '#2D5BE3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>F</div>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#1A1A1A' }}>FlowEnglish</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 99, padding: '4px 12px', fontSize: '0.8rem', color: '#6B6966', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <span style={{ color: '#0A9B6E', fontSize: 9 }}>●</span> {state.streak || 0} días
              </div>
              <div style={{ background: '#EBF0FD', border: '1px solid #B0C4F5', borderRadius: 99, padding: '4px 12px', fontSize: '0.8rem', color: '#2D5BE3', fontWeight: 500 }}>{state.level || 'B1'}</div>
            </div>
          </div>
        </header>

        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E6E0' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', display: 'flex' }}>
            {[['session', 'Sesión de hoy'], ['progress', 'Mi progreso']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? '#2D5BE3' : 'transparent'}`, color: tab === id ? '#2D5BE3' : '#6B6966', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.88rem', fontWeight: tab === id ? 500 : 300, padding: '0.85rem 1rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'session' && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.4rem,3vw,1.8rem)', letterSpacing: '-0.02em', fontWeight: 400, lineHeight: 1.2, color: '#1A1A1A' }}>{greeting}</h2>
                <p style={{ fontSize: '0.82rem', color: '#6B6966', marginTop: 4 }}>{dateStr}</p>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 14, padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minWidth: 100, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#6B6966', marginBottom: 6 }}>Progreso de hoy</div>
                <ProgressBar value={doneCount} total={5} />
                <div style={{ fontSize: '0.72rem', color: '#2D5BE3', marginTop: 5, fontWeight: 500 }}>{doneCount} de 5 módulos</div>
              </div>
            </div>

            <ModuleCard icon="◈" title="Ancla del día" mins="2 min · Empieza aquí" borderColor="#6B3FA0" bgColor="#F2EDFA" status={done.ancla ? 'done' : 'active'} open={openMod === 'ancla'} onToggle={() => setOpenMod(openMod === 'ancla' ? null : 'ancla')}>
              <p style={{ fontSize: '0.88rem', color: '#6B6966', lineHeight: 1.6, padding: '0.8rem 0 0.5rem' }}>{anclaPrompts[new Date().getDay() % anclaPrompts.length]}</p>
              <TA value={anclaText} onChange={e => setAnclaText(e.target.value)} placeholder="Escribe en inglés como puedas..." disabled={done.ancla} />
              {!done.ancla && <Btn onClick={submitAncla} disabled={anclaLoading || anclaText.length < 15}>{anclaLoading ? <><Dots /> Analizando...</> : 'Analizar →'}</Btn>}
              {anclaResp && <AIBox label="Análisis" color="#6B3FA0" content={anclaResp} />}
            </ModuleCard>

            <ModuleCard icon="◆" title="Vocabulario vivo" mins="5 min" borderColor="#0A9B6E" bgColor="#E6F7F2" status={done.vocab ? 'done' : done.ancla ? 'pending' : 'locked'} locked={!done.ancla} open={openMod === 'vocab'} onToggle={() => setOpenMod(openMod === 'vocab' ? null : 'vocab')}>
              {vocabWords.length > 0 ? <>
                <p style={{ fontSize: '0.82rem', color: '#6B6966', padding: '0.8rem 0 0.6rem' }}>Palabras extraídas de tu texto de hoy:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {vocabWords.map((w, i) => (
                    <div key={i} style={{ background: '#E6F7F2', border: '1px solid rgba(10,155,110,0.2)', borderRadius: 10, padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0A7A57', marginBottom: 2 }}>{w.word}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B6966', lineHeight: 1.5 }}>{w.def}</div>
                      <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#1A1A1A', marginTop: 4, opacity: 0.7 }}>"{w.example}"</div>
                    </div>
                  ))}
                </div>
                {!done.vocab && <>
                  <TA value={vocabPractice} onChange={e => setVocabPractice(e.target.value)} placeholder="Usa una de estas palabras en una oración propia..." rows={2} />
                  <Btn onClick={submitVocab} disabled={vocabLoading || !vocabPractice.trim()}>{vocabLoading ? <><Dots /> Revisando...</> : 'Enviar →'}</Btn>
                </>}
                {vocabResp && <AIBox label="Feedback" color="#0A9B6E" content={vocabResp} />}
              </> : <p style={{ fontSize: '0.85rem', color: '#B0AEA8', padding: '0.8rem 0' }}>El vocabulario aparece automáticamente después del Ancla del día.</p>}
            </ModuleCard>

            <ModuleCard icon="◉" title="Mini reto" mins="5 min" borderColor="#B85C00" bgColor="#FDF3E7" status={done.retoComplete ? 'done' : done.ancla ? 'pending' : 'locked'} locked={!done.ancla} open={openMod === 'reto'} onToggle={() => setOpenMod(openMod === 'reto' ? null : 'reto')}>
              {retoPattern ? <>
                <AIBox label="Patrón del día" color="#B85C00" content={retoPattern} />
                {!done.retoComplete && <>
                  <TA value={retoInput} onChange={e => setRetoInput(e.target.value)} placeholder="Practica el patrón aquí..." rows={3} />
                  <Btn onClick={submitReto} disabled={retoLoading || !retoInput.trim()}>{retoLoading ? <><Dots /> Verificando...</> : 'Verificar →'}</Btn>
                </>}
                {retoResp && <AIBox label="Corrección" color="#2D5BE3" content={retoResp} />}
              </> : <p style={{ fontSize: '0.85rem', color: '#B0AEA8', padding: '0.8rem 0' }}>El reto aparece automáticamente después del Ancla del día.</p>}
            </ModuleCard>

            <ModuleCard icon="◇" title="Revisión rápida" mins="3 min" borderColor="#C23B22" bgColor="#FDEEE9" status={done.review ? 'done' : 'pending'} open={openMod === 'review'} onToggle={() => setOpenMod(openMod === 'review' ? null : 'review')}>
              {reviewCards.length === 0
                ? <p style={{ fontSize: '0.85rem', color: '#B0AEA8', padding: '0.8rem 0' }}>Aún no tienes tarjetas. Completa más sesiones para acumular vocabulario.</p>
                : <>
                  <p style={{ fontSize: '0.82rem', color: '#6B6966', padding: '0.8rem 0 0.6rem' }}>Toca cada tarjeta para ver la definición:</p>
                  {reviewCards.map((w, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
                        style={{ background: flipped[i] ? '#FDEEE9' : '#F7F6F2', border: `1.5px solid ${flipped[i] ? '#C23B22' : '#E8E6E0'}`, borderRadius: 12, padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '1.05rem', fontFamily: "'Fraunces',serif", fontWeight: 400 }}>{w.word}</div>
                        {flipped[i] && <div style={{ fontSize: '0.82rem', color: '#6B6966', lineHeight: 1.5, marginTop: 8 }}>{w.def}<br /><em style={{ fontSize: '0.78rem' }}>"{w.example}"</em></div>}
                        {!flipped[i] && <div style={{ fontSize: '0.72rem', color: '#B0AEA8', marginTop: 4 }}>Toca para ver</div>}
                      </div>
                      {flipped[i] && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          {[['Lo tenía ✓', '#0A9B6E'], ['Repasar ↺', '#C23B22']].map(([label, color]) => (
                            <button key={label} onClick={() => { setFlipped(p => ({ ...p, [i]: false })); markDone('review') }}
                              style={{ flex: 1, padding: '0.55rem', borderRadius: 10, border: `1.5px solid ${color}`, background: 'transparent', color, fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>}
            </ModuleCard>

            <ModuleCard icon="◎" title="Cierre del día" mins="2 min" borderColor="#0A9B6E" bgColor="#E6F7F2" status={done.cierre ? 'done' : 'pending'} open={openMod === 'cierre'} onToggle={() => setOpenMod(openMod === 'cierre' ? null : 'cierre')}>
              {cierreText
                ? <AIBox label="Resumen del día" color="#0A9B6E" content={cierreText} />
                : <>
                  <p style={{ fontSize: '0.88rem', color: '#6B6966', padding: '0.8rem 0 0.6rem', lineHeight: 1.6 }}>Genera tu resumen personalizado — qué aprendiste hoy y en qué enfocarte mañana.</p>
                  <Btn onClick={genCierre} disabled={cierreLoading} full>{cierreLoading ? <><Dots /> Generando...</> : 'Generar mi resumen →'}</Btn>
                </>}
            </ModuleCard>
          </div>
        )}

        {tab === 'progress' && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem' }} className="fade-up">
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', letterSpacing: '-0.02em', fontWeight: 400, marginBottom: '1.5rem', color: '#1A1A1A' }}>Mi progreso</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.5rem' }}>
              {[['Sesiones', state.sessions?.length || 0, 'completadas', '#2D5BE3'], ['Vocabulario', state.vocab?.length || 0, 'palabras', '#0A9B6E'], ['Racha', state.streak || 0, 'días', '#B85C00']].map(([label, val, sub, color]) => (
                <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 14, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B6966', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: '1.6rem', fontFamily: "'Fraunces',serif", fontWeight: 400, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B6966', marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: '#E8E6E0', margin: '0 0 1.2rem' }} />
            <div style={{ fontSize: '0.85rem', color: '#6B6966', marginBottom: '0.8rem', fontWeight: 500 }}>Lo que has aprendido</div>
            {(!state.learned || state.learned.length === 0)
              ? <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#B0AEA8', fontSize: '0.9rem', lineHeight: 1.6 }}>Aún no hay registros.<br />Completa tu primera sesión.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {state.learned.slice(0, 10).map((l, i) => (
                  <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E8E6E0', borderRadius: 10, padding: '0.9rem 1rem', display: 'flex', alignItems: 'flex-start', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A9B6E', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: '0.87rem', lineHeight: 1.5, color: '#1A1A1A' }}>{l.text}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B6966', marginTop: 3 }}>{l.date}</div>
                    </div>
                  </div>
                ))}
              </div>}
          </div>
        )}
      </div>
    </>
  )
}