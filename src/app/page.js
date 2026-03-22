'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v1'

const empathyMessages = {
  primera: '<strong>Bienvenido.</strong> Vas a empezar diferente a como lo hacen todos. Sin lecciones genéricas, sin gramática aburrida. Aprendes desde lo que vives tú cada día.',
  par: '<strong>Tiene sentido.</strong> Las apps más populares están diseñadas para mantenerte enganchado — no para que realmente aprendas. Esta funciona al revés: tu vida real es el contenido.',
  muchas: '<strong>Eso no es falta de disciplina.</strong> Es que las apps no estaban diseñadas para alguien como tú. Esta sí. Tu inglés de hoy es el punto de partida — no un problema a corregir.',
}

const anclaPrompts = [
  '¿Cuál fue el momento más complicado de tu día hoy?',
  '¿Qué fue lo más interesante que hiciste o viste hoy?',
  '¿Tuviste que explicarle algo a alguien hoy? ¿Qué fue?',
  '¿Qué harás mañana? Cuéntame tus planes.',
  '¿Hubo algo que te preocupó o estresó hoy?',
  '¿Qué aprendiste hoy — en el trabajo, en la vida, o en algo que leíste?',
  '¿Con quién hablaste hoy y de qué?',
]

function formatAI(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

async function callAI(prompt, system = '') {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error de servidor')
  return data.text
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#c8a96e', display: 'inline-block',
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  )
}

export default function Home() {
  const [state, setState] = useState(null)
  const [screen, setScreen] = useState('loading')
  const [obStep, setObStep] = useState(1)
  const [obChoice, setObChoice] = useState('')
  const [obFirstText, setObFirstText] = useState('')
  const [obFirstLearning, setObFirstLearning] = useState('')
  const [obLoading, setObLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('session')
  const [anclaText, setAnclaText] = useState('')
  const [anclaResponse, setAnclaResponse] = useState('')
  const [anclaLoading, setAnclaLoading] = useState(false)
  const [anclaOpen, setAnclaOpen] = useState(true)
  const [vocabWords, setVocabWords] = useState([])
  const [vocabPractice, setVocabPractice] = useState('')
  const [vocabResponse, setVocabResponse] = useState('')
  const [vocabOpen, setVocabOpen] = useState(false)
  const [retoText, setRetoText] = useState('')
  const [retoInput, setRetoInput] = useState('')
  const [retoResponse, setRetoResponse] = useState('')
  const [retoOpen, setRetoOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [flippedCards, setFlippedCards] = useState({})
  const [cierreText, setCierreText] = useState('')
  const [cierreLoading, setCierreLoading] = useState(false)
  const [cierreOpen, setCierreOpen] = useState(false)
  const [moduleDone, setModuleDone] = useState({})
  const [currentAnclaText, setCurrentAnclaText] = useState('')
  const [currentVocab, setCurrentVocab] = useState([])
  const [currentRetoPattern, setCurrentRetoPattern] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const initial = {
      onboarded: false, sessions: [], vocab: [],
      learned: [], streak: 0, level: 'B1',
    }
    const s = saved ? { ...initial, ...JSON.parse(saved) } : initial
    setState(s)
    setScreen(s.onboarded ? 'app' : 'onboarding')
  }, [])

  function save(updates) {
    const next = { ...state, ...updates }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }

  function getGreeting() {
    const h = new Date().getHours()
    return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches'
  }

  function getDate() {
    return new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function getAnclaPrompt() {
    return anclaPrompts[new Date().getDay() % anclaPrompts.length]
  }

  async function submitObFirstText() {
    if (obFirstText.trim().length < 10) return
    setObLoading(true)
    try {
      const resp = await callAI(
        `You are an English learning coach for Spanish speakers. The user wrote their first English text during onboarding. Analyze it and provide ONE specific, encouraging insight. Format: Start with an observation about something they did well, then ONE concrete improvement suggestion with an example using their exact words. Keep it under 80 words. Be warm and specific. The text: "${obFirstText}"`
      )
      setObFirstLearning(resp)
      setObStep(4)
    } catch (e) {
      alert('Error al conectar con la IA: ' + e.message)
    }
    setObLoading(false)
  }

  function finishOnboarding() {
    save({ onboarded: true })
    setScreen('app')
  }

  async function submitAncla() {
    if (anclaText.trim().length < 15) return
    setAnclaLoading(true)
    setCurrentAnclaText(anclaText)

    const prompt = `You are an English coach for a ${state.level} Spanish speaker. They wrote: "${anclaText}"

Analyze this text and respond in Spanish (your explanation) + English (examples). Structure:

**Lo que hiciste bien:** [1-2 specific positive observations]

**Una mejora para hoy:** [Most impactful error or unnatural phrasing. Show their version vs natural version]

**Vocabulario sugerido:** Return EXACTLY this JSON at the end:
VOCAB_JSON:[{"word":"word1","definition":"brief def in Spanish","example":"example sentence"},{"word":"word2","definition":"brief def","example":"example"},{"word":"word3","definition":"brief def","example":"example"}]

Pick 3 words from their text or related to what they described.`

    try {
      const resp = await callAI(prompt)
      const vocabMatch = resp.match(/VOCAB_JSON:(\[.*?\])/s)
      let words = []
      let display = resp

      if (vocabMatch) {
        try { words = JSON.parse(vocabMatch[1]); display = resp.replace(/VOCAB_JSON:.*$/s, '').trim() }
        catch (e) {}
      }

      setAnclaResponse(display)
      setVocabWords(words)
      setCurrentVocab(words)
      setModuleDone(p => ({ ...p, ancla: true, vocab: words.length > 0 }))

      const newVocab = [...(state.vocab || []), ...words]
      save({ vocab: newVocab })

      await generateReto(anclaText)
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setAnclaLoading(false)
  }

  async function generateReto(text) {
    const prompt = `Based on this English text from a ${state.level} learner: "${text}"

Identify the ONE most important grammar pattern or natural expression they should practice.
In Spanish, explain:
1. What pattern/structure to practice (2-3 sentences max)
2. Give them ONE specific sentence to rewrite or complete

Format: Start with "**Patrón:** " then explanation. End with "**Tu reto:** " and the exercise. Max 60 words.`

    try {
      const resp = await callAI(prompt)
      setRetoText(resp)
      setCurrentRetoPattern(resp)
      setModuleDone(p => ({ ...p, reto: true }))
    } catch (e) {}
  }

  async function submitVocabPractice() {
    if (!vocabPractice.trim()) return
    const wordsStr = currentVocab.map(w => w.word).join(', ')
    try {
      const resp = await callAI(
        `The learner practiced vocabulary (${wordsStr}) by writing: "${vocabPractice}"
Give brief feedback in Spanish (2-3 sentences): was the word used correctly? Any natural improvement? Be encouraging.`
      )
      setVocabResponse(resp)
      addLearned('Vocabulario: ' + wordsStr)
    } catch (e) {}
  }

  async function submitReto() {
    if (!retoInput.trim()) return
    try {
      const resp = await callAI(
        `The learner is practicing this pattern: "${currentRetoPattern}"
They wrote: "${retoInput}"
Give correction and encouragement in Spanish (2-3 sentences). Show the improved version if needed.`
      )
      setRetoResponse(resp)
      setModuleDone(p => ({ ...p, retoComplete: true }))
      addLearned('Gramática: patrón del día practicado')
    } catch (e) {}
  }

  async function generateCierre() {
    setCierreLoading(true)
    const vocabStr = currentVocab.map(w => w.word).join(', ')
    const prompt = `Generate a brief closing summary in Spanish for an English learning session.
The learner wrote about: "${currentAnclaText.substring(0, 150)}"
They worked on vocabulary: ${vocabStr || 'general vocabulary'}
Level: ${state.level}

Write 2-3 sentences: what they practiced today + one specific focus for tomorrow. Be concrete and encouraging. No generic phrases.`

    try {
      const resp = await callAI(prompt)
      setCierreText(resp)
      setModuleDone(p => ({ ...p, cierre: true }))

      const today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
      const newLearned = [{ text: resp.substring(0, 100) + '...', date: today }, ...(state.learned || [])]
      const newSessions = [...(state.sessions || []), { date: new Date().toISOString() }]
      const newStreak = (state.streak || 0) + 1
      save({ learned: newLearned.slice(0, 30), sessions: newSessions, streak: newStreak })
    } catch (e) {}
    setCierreLoading(false)
  }

  function addLearned(text) {
    const today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    const existing = state.learned || []
    if (existing.find(l => l.text === text)) return
    save({ learned: [{ text, date: today }, ...existing].slice(0, 30) })
  }

  function flipCard(i) {
    setFlippedCards(p => ({ ...p, [i]: !p[i] }))
  }

  const reviewCards = (state?.vocab || []).slice(-6).slice(0, 3)

  if (screen === 'loading' || !state) return null

  const s = {
    wrap: { minHeight: '100vh', background: '#0e0e0f', color: '#f0ede8', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 },
    center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' },
    inner: { width: '100%', maxWidth: 440 },
    logo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#c8a96e', marginBottom: '3rem', letterSpacing: '-0.02em' },
    question: { fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.4rem,4vw,1.9rem)', lineHeight: 1.25, marginBottom: '0.75rem', letterSpacing: '-0.02em' },
    sub: { fontSize: '0.9rem', color: '#7a7875', marginBottom: '2rem', lineHeight: 1.6 },
    option: (sel) => ({ display: 'block', width: '100%', background: sel ? 'rgba(200,169,110,0.07)' : '#161618', border: `1px solid ${sel ? '#c8a96e' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '1rem 1.2rem', cursor: 'pointer', fontSize: '0.95rem', color: sel ? '#e8c98e' : '#f0ede8', textAlign: 'left', marginBottom: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 300, transition: 'all 0.2s' }),
    btnPrimary: (disabled) => ({ width: '100%', background: disabled ? 'rgba(200,169,110,0.4)' : '#c8a96e', color: '#0e0e0f', border: 'none', borderRadius: 14, padding: '0.9rem 1.5rem', fontSize: '0.95rem', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", marginTop: 8 }),
    msg: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.4rem', fontSize: '0.95rem', lineHeight: 1.7, color: '#7a7875', marginBottom: '1.5rem' },
    textarea: { width: '100%', background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem 1.2rem', fontSize: '0.95rem', color: '#f0ede8', fontFamily: "'DM Sans',sans-serif", fontWeight: 300, resize: 'none', lineHeight: 1.6, outline: 'none', marginBottom: '1rem' },
  }

  // ── ONBOARDING ──
  if (screen === 'onboarding') return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .ob-inner { animation: fadeUp 0.5s ease both; }
      `}</style>
      <div style={s.center}>
        <div style={s.inner} className="ob-inner">
          <div style={s.logo}>FlowEnglish</div>

          {obStep === 1 && (
            <>
              <h2 style={s.question}>¿Cuántas veces has intentado aprender inglés?</h2>
              <p style={s.sub}>Sin juicio. Solo queremos entenderte.</p>
              {[['primera', 'Es mi primera vez'], ['par', 'Un par de veces'], ['muchas', 'Varias — nunca me ha funcionado']].map(([val, label]) => (
                <button key={val} style={s.option(obChoice === val)} onClick={() => { setObChoice(val); setTimeout(() => setObStep(2), 300) }}>{label}</button>
              ))}
            </>
          )}

          {obStep === 2 && (
            <>
              <div style={s.msg} dangerouslySetInnerHTML={{ __html: empathyMessages[obChoice] }} />
              <button style={s.btnPrimary(false)} onClick={() => setObStep(3)}>Muéstrame cómo funciona →</button>
            </>
          )}

          {obStep === 3 && (
            <>
              <h2 style={s.question}>Tu primera sesión — ahora mismo</h2>
              <p style={s.sub}>Cuéntame algo que pasó hoy, en inglés. Como puedas. No hay errores aquí.</p>
              <textarea style={{ ...s.textarea, minHeight: 120 }} value={obFirstText} onChange={e => setObFirstText(e.target.value)} placeholder="Today I..." rows={4} />
              <button style={s.btnPrimary(obLoading || obFirstText.length < 10)} disabled={obLoading || obFirstText.length < 10} onClick={submitObFirstText}>
                {obLoading ? <LoadingDots /> : 'Analizar mi inglés →'}
              </button>
            </>
          )}

          {obStep === 4 && (
            <>
              <h2 style={s.question}>Tu primer aprendizaje</h2>
              <p style={s.sub}>Basado en lo que escribiste:</p>
              <div style={{ ...s.msg, color: '#f0ede8', fontStyle: 'normal' }} dangerouslySetInnerHTML={{ __html: formatAI(obFirstLearning) }} />
              <button style={s.btnPrimary(false)} onClick={finishOnboarding}>Entrar a mi app →</button>
            </>
          )}
        </div>
      </div>
    </>
  )

  // ── MAIN APP ──
  const modCard = (active) => ({ background: '#161618', border: `1px solid ${active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10, transition: 'border-color 0.2s' })
  const modHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.2rem', cursor: 'pointer', userSelect: 'none' }
  const modBody = { padding: '0 1.2rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }
  const modIcon = (bg, color) => ({ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: bg, color, flexShrink: 0 })
  const badge = (done, active) => ({ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 20, border: `1px solid ${done ? '#4db89a' : active ? '#c8a96e' : 'rgba(255,255,255,0.07)'}`, color: done ? '#4db89a' : active ? '#c8a96e' : '#7a7875', background: done ? 'rgba(77,184,154,0.08)' : active ? 'rgba(200,169,110,0.08)' : 'transparent' })
  const aiBox = { background: '#1e1e21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '1rem', marginTop: 10, fontSize: '0.88rem', lineHeight: 1.75 }
  const aiLabel = { fontSize: '0.72rem', color: '#7a7875', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }
  const aiDot = (color) => ({ width: 6, height: 6, borderRadius: '50%', background: color || '#8b7dd8' })
  const sessionTA = { width: '100%', background: '#1e1e21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.9rem 1rem', fontSize: '0.9rem', color: '#f0ede8', fontFamily: "'DM Sans',sans-serif", fontWeight: 300, resize: 'none', lineHeight: 1.6, outline: 'none', marginBottom: 8 }
  const btnMod = (disabled) => ({ background: disabled ? 'rgba(200,169,110,0.4)' : '#c8a96e', color: '#0e0e0f', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif" })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        body { background:#0e0e0f; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
        .tab-btn { background:none;border:none;color:#7a7875;font-family:'DM Sans',sans-serif;font-size:.85rem;padding:.8rem 1rem;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;font-weight:300; }
        .tab-btn.active { color:#c8a96e;border-bottom-color:#c8a96e;font-weight:400; }
        .tab-btn:hover { color:#f0ede8; }
        .ob-opt:hover { border-color:#c8a96e!important; color:#e8c98e!important; background:rgba(200,169,110,0.07)!important; }
        .btn-recall { flex:1;padding:.6rem;border-radius:8px;border:1px solid rgba(255,255,255,0.07);font-family:'DM Sans',sans-serif;font-size:.82rem;cursor:pointer;background:transparent;color:#7a7875;transition:all .2s; }
        .btn-recall.good:hover{border-color:#4db89a;color:#4db89a;background:rgba(77,184,154,0.08)}
        .btn-recall.hard:hover{border-color:#d87060;color:#d87060;background:rgba(216,112,96,0.08)}
      `}</style>
      <div style={{ minHeight: '100vh', background: '#0e0e0f', color: '#f0ede8', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: 'rgba(14,14,15,0.92)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.2rem', color: '#c8a96e', letterSpacing: '-0.02em' }}>FlowEnglish</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '4px 12px', fontSize: '0.8rem', color: '#7a7875' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4db89a' }} />
              {state.streak || 0} días
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1.5rem', overflowX: 'auto' }}>
          <button className={`tab-btn${activeTab === 'session' ? ' active' : ''}`} onClick={() => setActiveTab('session')}>Sesión de hoy</button>
          <button className={`tab-btn${activeTab === 'progress' ? ' active' : ''}`} onClick={() => setActiveTab('progress')}>Mi progreso</button>
        </nav>

        {/* SESSION */}
        {activeTab === 'session' && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ marginBottom: 8 }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(1.3rem,3vw,1.7rem)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{getGreeting()}</h2>
              <p style={{ fontSize: '0.8rem', color: '#7a7875', marginTop: 4 }}>{getDate()}</p>
            </div>

            {/* ANCLA */}
            <div style={modCard(anclaOpen)}>
              <div style={modHeader} onClick={() => setAnclaOpen(p => !p)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={modIcon('rgba(139,125,216,0.15)', '#8b7dd8')}>◈</div>
                  <div><div style={{ fontSize: '0.9rem', fontWeight: 400 }}>Ancla del día</div><div style={{ fontSize: '0.75rem', color: '#7a7875', marginTop: 1 }}>2 min · Empieza aquí</div></div>
                </div>
                <span style={badge(moduleDone.ancla, true)}>{moduleDone.ancla ? 'Listo' : 'Activo'}</span>
              </div>
              {anclaOpen && (
                <div style={modBody}>
                  <p style={{ fontSize: '0.9rem', color: '#7a7875', lineHeight: 1.6, padding: '0.8rem 0' }}>{getAnclaPrompt()}</p>
                  <textarea style={{ ...sessionTA, minHeight: 100 }} value={anclaText} onChange={e => setAnclaText(e.target.value)} placeholder="Escribe en inglés como puedas..." rows={4} />
                  <button style={btnMod(anclaLoading || anclaText.length < 15)} disabled={anclaLoading || anclaText.length < 15} onClick={submitAncla}>
                    {anclaLoading ? <LoadingDots /> : 'Analizar →'}
                  </button>
                  {anclaResponse && (
                    <div style={aiBox}>
                      <div style={aiLabel}><div style={aiDot()} />Análisis</div>
                      <div dangerouslySetInnerHTML={{ __html: formatAI(anclaResponse) }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* VOCABULARIO */}
            <div style={modCard(vocabOpen)}>
              <div style={modHeader} onClick={() => setVocabOpen(p => !p)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={modIcon('rgba(77,184,154,0.15)', '#4db89a')}>◆</div>
                  <div><div style={{ fontSize: '0.9rem', fontWeight: 400 }}>Vocabulario vivo</div><div style={{ fontSize: '0.75rem', color: '#7a7875', marginTop: 1 }}>5 min</div></div>
                </div>
                <span style={badge(moduleDone.vocab, false)}>{moduleDone.vocab ? 'Listo' : 'Pendiente'}</span>
              </div>
              {vocabOpen && (
                <div style={modBody}>
                  {vocabWords.length > 0 ? (
                    <>
                      <p style={{ fontSize: '0.9rem', color: '#7a7875', padding: '0.8rem 0 0.5rem' }}>Palabras de tu texto de hoy:</p>
                      {vocabWords.map((w, i) => (
                        <div key={i} style={{ background: '#0e0e0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.8rem 1rem', marginBottom: 8 }}>
                          <div style={{ fontSize: '1rem', color: '#c8a96e', marginBottom: 3 }}>{w.word}</div>
                          <div style={{ fontSize: '0.82rem', color: '#7a7875', lineHeight: 1.5 }}>{w.definition}</div>
                          <div style={{ fontSize: '0.82rem', color: '#f0ede8', marginTop: 4, fontStyle: 'italic', opacity: 0.7 }}>"{w.example}"</div>
                        </div>
                      ))}
                      <textarea style={{ ...sessionTA, minHeight: 60, marginTop: 8 }} value={vocabPractice} onChange={e => setVocabPractice(e.target.value)} placeholder="Usa una de las palabras en una oración propia..." rows={2} />
                      <button style={btnMod(!vocabPractice.trim())} disabled={!vocabPractice.trim()} onClick={submitVocabPractice}>Enviar oración →</button>
                      {vocabResponse && (
                        <div style={aiBox}>
                          <div style={aiLabel}><div style={aiDot('#4db89a')} />Feedback</div>
                          <div dangerouslySetInnerHTML={{ __html: formatAI(vocabResponse) }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '0.88rem', color: '#4a4845', padding: '1rem 0' }}>Completa el Ancla del día primero para desbloquear el vocabulario.</p>
                  )}
                </div>
              )}
            </div>

            {/* MINI RETO */}
            <div style={modCard(retoOpen)}>
              <div style={modHeader} onClick={() => setRetoOpen(p => !p)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={modIcon('rgba(200,169,110,0.15)', '#c8a96e')}>◉</div>
                  <div><div style={{ fontSize: '0.9rem', fontWeight: 400 }}>Mini reto</div><div style={{ fontSize: '0.75rem', color: '#7a7875', marginTop: 1 }}>5 min</div></div>
                </div>
                <span style={badge(moduleDone.retoComplete, false)}>{moduleDone.retoComplete ? 'Completo' : 'Pendiente'}</span>
              </div>
              {retoOpen && (
                <div style={modBody}>
                  {retoText ? (
                    <>
                      <div style={{ ...aiBox, marginTop: 0, marginBottom: 10 }}>
                        <div style={aiLabel}><div style={aiDot('#c8a96e')} />Patrón del día</div>
                        <div dangerouslySetInnerHTML={{ __html: formatAI(retoText) }} />
                      </div>
                      <textarea style={{ ...sessionTA, minHeight: 70 }} value={retoInput} onChange={e => setRetoInput(e.target.value)} placeholder="Practica el patrón aquí..." rows={3} />
                      <button style={btnMod(!retoInput.trim())} disabled={!retoInput.trim()} onClick={submitReto}>Verificar →</button>
                      {retoResponse && (
                        <div style={aiBox}>
                          <div style={aiLabel}><div style={aiDot()} />Corrección</div>
                          <div dangerouslySetInnerHTML={{ __html: formatAI(retoResponse) }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '0.88rem', color: '#4a4845', padding: '1rem 0' }}>Completa el Ancla del día primero para desbloquear tu reto personalizado.</p>
                  )}
                </div>
              )}
            </div>

            {/* REVISIÓN */}
            <div style={modCard(reviewOpen)}>
              <div style={modHeader} onClick={() => setReviewOpen(p => !p)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={modIcon('rgba(216,112,96,0.15)', '#d87060')}>◇</div>
                  <div><div style={{ fontSize: '0.9rem', fontWeight: 400 }}>Revisión rápida</div><div style={{ fontSize: '0.75rem', color: '#7a7875', marginTop: 1 }}>3 min</div></div>
                </div>
                <span style={badge(false, false)}>{reviewCards.length > 0 ? `${reviewCards.length} tarjetas` : 'Pendiente'}</span>
              </div>
              {reviewOpen && (
                <div style={modBody}>
                  {reviewCards.length === 0 ? (
                    <p style={{ fontSize: '0.88rem', color: '#4a4845', padding: '1rem 0' }}>Aún no tienes tarjetas. Completa más sesiones para acumular vocabulario.</p>
                  ) : (
                    reviewCards.map((w, i) => (
                      <div key={i}>
                        <div style={{ background: '#1e1e21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 6 }} onClick={() => flipCard(i)}>
                          <div style={{ fontSize: '1.1rem', fontFamily: "'DM Serif Display',serif" }}>{w.word}</div>
                          {flippedCards[i] && (
                            <div style={{ fontSize: '0.85rem', color: '#7a7875', marginTop: 8 }}>
                              {w.definition}<br /><em style={{ fontSize: '0.8rem' }}>"{w.example}"</em>
                            </div>
                          )}
                          {!flippedCards[i] && <div style={{ fontSize: '0.75rem', color: '#4a4845', marginTop: 6 }}>Toca para ver</div>}
                        </div>
                        {flippedCards[i] && (
                          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                            <button className="btn-recall good">Lo tenía →</button>
                            <button className="btn-recall hard">Repasar →</button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* CIERRE */}
            <div style={modCard(cierreOpen)}>
              <div style={modHeader} onClick={() => setCierreOpen(p => !p)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={modIcon('rgba(77,184,154,0.15)', '#4db89a')}>◎</div>
                  <div><div style={{ fontSize: '0.9rem', fontWeight: 400 }}>Cierre del día</div><div style={{ fontSize: '0.75rem', color: '#7a7875', marginTop: 1 }}>2 min</div></div>
                </div>
                <span style={badge(moduleDone.cierre, false)}>{moduleDone.cierre ? 'Completo' : 'Pendiente'}</span>
              </div>
              {cierreOpen && (
                <div style={modBody}>
                  {cierreText ? (
                    <div style={{ ...aiBox, marginTop: 0 }}>
                      <div style={aiLabel}><div style={aiDot('#4db89a')} />Resumen del día</div>
                      <div dangerouslySetInnerHTML={{ __html: formatAI(cierreText) }} />
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.88rem', color: '#7a7875', padding: '0.8rem 0' }}>Genera tu resumen personalizado de la sesión de hoy.</p>
                      <button style={btnMod(cierreLoading)} disabled={cierreLoading} onClick={generateCierre}>
                        {cierreLoading ? <LoadingDots /> : 'Generar mi resumen →'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {activeTab === 'progress' && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Mi progreso</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.5rem' }}>
              {[['Sesiones', state.sessions?.length || 0, 'completadas'], ['Vocabulario', state.vocab?.length || 0, 'palabras'], ['Racha', state.streak || 0, 'días seguidos']].map(([label, val, sub]) => (
                <div key={label} style={{ background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#7a7875', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: '1.4rem', fontFamily: "'DM Serif Display',serif" }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7a7875', marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 1rem' }} />
            <div style={{ fontSize: '0.85rem', color: '#7a7875', marginBottom: '0.8rem' }}>Lo que has aprendido</div>
            {(!state.learned || state.learned.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#4a4845', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Aún no hay registros.<br />Haz tu primera sesión completa.
              </div>
            ) : (
              state.learned.slice(0, 10).map((l, i) => (
                <div key={i} style={{ background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.9rem 1rem', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4db89a', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: '0.87rem', lineHeight: 1.5 }}>{l.text}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7a7875', marginTop: 2 }}>{l.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
