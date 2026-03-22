'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flowenglish_v7'
const CARDS_KEY = 'flowenglish_cards_v1'

const PACKS = {
    sesiones: { id: 'sesiones', name: 'Mis palabras', desc: 'Vocabulario de tus sesiones', icon: '⭐' },
    top1000: {
        id: 'top1000', name: 'Top 1000 palabras', desc: 'Las más usadas en inglés real', icon: '📊',
        cards: [
            { word: 'able', def: 'capaz de hacer algo', example: 'I am able to speak English.' },
            { word: 'accept', def: 'aceptar', example: 'I accept your apology.' },
            { word: 'actually', def: 'en realidad, realmente', example: 'I actually enjoyed the meeting.' },
            { word: 'affect', def: 'afectar, influir', example: 'Stress can affect your health.' },
            { word: 'afford', def: 'permitirse económicamente', example: 'I cannot afford that right now.' },
            { word: 'agree', def: 'estar de acuerdo', example: 'I completely agree with you.' },
            { word: 'allow', def: 'permitir, dejar', example: 'My boss does not allow late arrivals.' },
            { word: 'already', def: 'ya', example: 'I have already sent the email.' },
            { word: 'although', def: 'aunque, a pesar de', example: 'Although it was hard, I finished it.' },
            { word: 'among', def: 'entre varios', example: 'This is common among young people.' },
            { word: 'announce', def: 'anunciar', example: 'They announced the new policy today.' },
            { word: 'appear', def: 'aparecer, parecer', example: 'He appears to be very confident.' },
            { word: 'apply', def: 'aplicar, postular', example: 'I want to apply for this position.' },
            { word: 'approach', def: 'enfoque, acercarse', example: 'We need a different approach.' },
            { word: 'arrange', def: 'organizar, arreglar', example: 'Can you arrange a meeting?' },
            { word: 'assume', def: 'asumir, suponer', example: 'I assumed you knew already.' },
            { word: 'attend', def: 'asistir a', example: 'Will you attend the conference?' },
            { word: 'available', def: 'disponible', example: 'I am available on Thursday.' },
            { word: 'avoid', def: 'evitar', example: 'Try to avoid negative people.' },
            { word: 'aware', def: 'consciente, al tanto', example: 'I was not aware of the problem.' },
            { word: 'become', def: 'volverse, convertirse en', example: 'I want to become fluent in English.' },
            { word: 'believe', def: 'creer', example: 'I believe in your potential.' },
            { word: 'benefit', def: 'beneficio', example: 'What is the benefit of this plan?' },
            { word: 'beyond', def: 'más allá de', example: 'This is beyond my expectations.' },
            { word: 'bring', def: 'traer', example: 'Please bring your laptop tomorrow.' },
            { word: 'build', def: 'construir, crear', example: 'We are building something great.' },
            { word: 'career', def: 'carrera profesional', example: 'I want to grow my career.' },
            { word: 'cause', def: 'causar, razón', example: 'What caused this problem?' },
            { word: 'certain', def: 'cierto, seguro', example: 'I am certain this will work.' },
            { word: 'challenge', def: 'desafío, reto', example: 'This project is a big challenge.' },
            { word: 'check', def: 'revisar, verificar', example: 'Please check your email.' },
            { word: 'choose', def: 'elegir', example: 'You need to choose one option.' },
            { word: 'clear', def: 'claro', example: 'Let me make this clear.' },
            { word: 'commit', def: 'comprometerse', example: 'I commit to finishing this today.' },
            { word: 'common', def: 'común', example: 'This is a common mistake.' },
            { word: 'communicate', def: 'comunicar', example: 'We need to communicate better.' },
            { word: 'complete', def: 'completar, completo', example: 'I need to complete this report.' },
            { word: 'concern', def: 'preocupación', example: 'I have a concern about the plan.' },
            { word: 'confident', def: 'seguro de sí mismo', example: 'She speaks very confidently.' },
            { word: 'confirm', def: 'confirmar', example: 'Please confirm your attendance.' },
            { word: 'consider', def: 'considerar', example: 'Please consider my proposal.' },
            { word: 'continue', def: 'continuar', example: 'Let\'s continue the discussion.' },
            { word: 'create', def: 'crear', example: 'We need to create a better plan.' },
            { word: 'current', def: 'actual', example: 'What is your current role?' },
            { word: 'decide', def: 'decidir', example: 'We need to decide by Friday.' },
            { word: 'delay', def: 'retraso, retrasar', example: 'The meeting has a 30-minute delay.' },
            { word: 'deliver', def: 'entregar, cumplir', example: 'We always deliver on time.' },
            { word: 'describe', def: 'describir', example: 'Can you describe the problem?' },
            { word: 'develop', def: 'desarrollar', example: 'I want to develop new skills.' },
            { word: 'discuss', def: 'hablar sobre, discutir', example: 'Let\'s discuss this tomorrow.' },
            { word: 'doubt', def: 'duda, dudar', example: 'I doubt this will work.' },
            { word: 'effort', def: 'esfuerzo', example: 'Thank you for your effort.' },
            { word: 'encourage', def: 'animar, motivar', example: 'She always encourages her team.' },
            { word: 'especially', def: 'especialmente', example: 'I enjoy traveling, especially to Europe.' },
            { word: 'eventually', def: 'finalmente', example: 'Eventually, things will get better.' },
            { word: 'exactly', def: 'exactamente', example: 'That is exactly what I meant.' },
            { word: 'expect', def: 'esperar, anticipar', example: 'I did not expect that reaction.' },
            { word: 'experience', def: 'experiencia', example: 'I have five years of experience.' },
            { word: 'explain', def: 'explicar', example: 'Can you explain that again?' },
            { word: 'fail', def: 'fallar, fracasar', example: 'Don\'t be afraid to fail.' },
            { word: 'familiar', def: 'familiar, conocido', example: 'I am familiar with this process.' },
            { word: 'focus', def: 'enfocarse, foco', example: 'Let\'s focus on the main issue.' },
            { word: 'follow', def: 'seguir', example: 'Please follow the instructions.' },
            { word: 'forward', def: 'adelante, reenviar', example: 'I look forward to hearing from you.' },
            { word: 'goal', def: 'objetivo, meta', example: 'My goal is to improve my English.' },
            { word: 'grow', def: 'crecer', example: 'The company is growing fast.' },
            { word: 'handle', def: 'manejar, lidiar con', example: 'She handled the situation very well.' },
            { word: 'happen', def: 'ocurrir, pasar', example: 'What happened in the meeting?' },
            { word: 'impact', def: 'impacto, impactar', example: 'This will impact our results.' },
            { word: 'improve', def: 'mejorar', example: 'I want to improve my speaking skills.' },
            { word: 'include', def: 'incluir', example: 'Please include me in the email.' },
            { word: 'increase', def: 'aumentar, incremento', example: 'Sales increased by 20%.' },
            { word: 'inform', def: 'informar', example: 'Please inform me of any changes.' },
            { word: 'involve', def: 'involucrar, implicar', example: 'This involves the whole team.' },
            { word: 'issue', def: 'problema, asunto', example: 'There is an issue with the system.' },
            { word: 'join', def: 'unirse, conectar', example: 'Would you like to join our team?' },
            { word: 'keep', def: 'mantener, guardar', example: 'Keep me updated, please.' },
            { word: 'lack', def: 'falta de, carecer de', example: 'I lack experience in this area.' },
            { word: 'launch', def: 'lanzar', example: 'We will launch the product next month.' },
            { word: 'lead', def: 'liderar, guiar', example: 'She leads the marketing team.' },
            { word: 'learn', def: 'aprender', example: 'I learn something new every day.' },
            { word: 'manage', def: 'manejar, gestionar', example: 'Can you manage the project?' },
            { word: 'measure', def: 'medir, medida', example: 'We need to measure our progress.' },
            { word: 'meet', def: 'reunirse, conocer', example: 'Let\'s meet on Monday morning.' },
            { word: 'mention', def: 'mencionar', example: 'She mentioned your name.' },
            { word: 'miss', def: 'extrañar, perder', example: 'I missed the meeting.' },
            { word: 'move', def: 'moverse, mover', example: 'Let\'s move to the next point.' },
            { word: 'necessary', def: 'necesario', example: 'Is this step necessary?' },
            { word: 'offer', def: 'ofrecer, oferta', example: 'I want to offer you a better deal.' },
            { word: 'opportunity', def: 'oportunidad', example: 'This is a great opportunity for growth.' },
            { word: 'organize', def: 'organizar', example: 'Can you organize the documents?' },
            { word: 'outcome', def: 'resultado, consecuencia', example: 'What was the outcome of the meeting?' },
            { word: 'overcome', def: 'superar', example: 'We overcame many challenges.' },
            { word: 'participate', def: 'participar', example: 'Everyone must participate.' },
            { word: 'perform', def: 'desempeñarse, actuar', example: 'The team performed very well.' },
            { word: 'plan', def: 'planificar, plan', example: 'We need to plan this carefully.' },
            { word: 'present', def: 'presentar, presente', example: 'I will present the results tomorrow.' },
            { word: 'priority', def: 'prioridad', example: 'This is our top priority right now.' },
            { word: 'process', def: 'proceso, procesar', example: 'What is the approval process?' },
            { word: 'provide', def: 'proveer, dar', example: 'Please provide more details.' },
            { word: 'reach', def: 'alcanzar, llegar a', example: 'We need to reach our targets.' },
            { word: 'reduce', def: 'reducir', example: 'We need to reduce costs.' },
            { word: 'require', def: 'requerir, necesitar', example: 'This job requires experience.' },
            { word: 'resolve', def: 'resolver', example: 'We resolved the issue quickly.' },
            { word: 'respond', def: 'responder', example: 'Please respond as soon as possible.' },
            { word: 'result', def: 'resultado', example: 'What were the results?' },
            { word: 'review', def: 'revisar, reseña', example: 'Let\'s review the plan together.' },
            { word: 'role', def: 'rol, papel', example: 'What is your role in this project?' },
            { word: 'schedule', def: 'agenda, programar', example: 'Let me check my schedule.' },
            { word: 'share', def: 'compartir', example: 'Please share your thoughts.' },
            { word: 'situation', def: 'situación', example: 'The situation is under control.' },
            { word: 'skill', def: 'habilidad', example: 'Communication is a key skill.' },
            { word: 'solve', def: 'resolver, solucionar', example: 'We need to solve this quickly.' },
            { word: 'strategy', def: 'estrategia', example: 'What is our strategy for Q4?' },
            { word: 'succeed', def: 'tener éxito', example: 'I know you will succeed.' },
            { word: 'suggest', def: 'sugerir', example: 'I suggest a different approach.' },
            { word: 'support', def: 'apoyar, soporte', example: 'Thank you for your support.' },
            { word: 'target', def: 'objetivo, meta', example: 'Did we reach our target?' },
            { word: 'team', def: 'equipo', example: 'Our team works very well together.' },
            { word: 'though', def: 'aunque, sin embargo', example: 'It was hard, though rewarding.' },
            { word: 'throughout', def: 'a lo largo de', example: 'Throughout the year, we improved.' },
            { word: 'track', def: 'seguir, rastrear', example: 'We need to track our progress.' },
            { word: 'understand', def: 'entender, comprender', example: 'I don\'t understand the problem.' },
            { word: 'update', def: 'actualizar, actualización', example: 'Please update me on the status.' },
            { word: 'use', def: 'usar, utilizar', example: 'How do you use this feature?' },
            { word: 'valuable', def: 'valioso', example: 'This feedback is very valuable.' },
            { word: 'various', def: 'varios, diverso', example: 'We have various options.' },
            { word: 'view', def: 'ver, punto de vista', example: 'What is your view on this?' },
            { word: 'whether', def: 'si (condicional)', example: 'I am not sure whether to accept.' },
            { word: 'willing', def: 'dispuesto a', example: 'I am willing to learn.' },
            { word: 'within', def: 'dentro de', example: 'Please reply within 24 hours.' },
            { word: 'work', def: 'trabajar, funcionar', example: 'Does this solution work for you?' },
        ]
    },
    phrasal: {
        id: 'phrasal', name: 'Phrasal verbs esenciales', desc: 'Los más usados en trabajo y vida real', icon: '🔗',
        cards: [
            { word: 'bring up', def: 'mencionar un tema', example: 'She brought up an interesting point.' },
            { word: 'call off', def: 'cancelar algo', example: 'They called off the meeting.' },
            { word: 'carry on', def: 'continuar, seguir adelante', example: 'Carry on with the plan.' },
            { word: 'come up with', def: 'idear, ocurrírsele algo', example: 'I came up with a better solution.' },
            { word: 'cut down on', def: 'reducir, disminuir', example: 'I need to cut down on coffee.' },
            { word: 'deal with', def: 'lidiar con, manejar', example: 'How do you deal with stress?' },
            { word: 'end up', def: 'terminar haciendo algo', example: 'We ended up working late.' },
            { word: 'fall behind', def: 'atrasarse, quedarse atrás', example: 'I fell behind with my tasks.' },
            { word: 'figure out', def: 'entender, resolver', example: 'I need to figure out this problem.' },
            { word: 'get along', def: 'llevarse bien', example: 'I get along well with my team.' },
            { word: 'get back to', def: 'volver a contactar', example: 'I will get back to you tomorrow.' },
            { word: 'give up', def: 'rendirse, abandonar', example: 'Don\'t give up on your goals.' },
            { word: 'go ahead', def: 'proceder, adelante', example: 'Go ahead with the plan.' },
            { word: 'go over', def: 'revisar, repasar', example: 'Let\'s go over the details again.' },
            { word: 'hand in', def: 'entregar un trabajo', example: 'Please hand in the report by Friday.' },
            { word: 'hold on', def: 'esperar un momento', example: 'Hold on, let me check.' },
            { word: 'keep up with', def: 'mantenerse al día con algo', example: 'It\'s hard to keep up with all the changes.' },
            { word: 'lay off', def: 'despedir empleados', example: 'The company laid off 20 workers.' },
            { word: 'let down', def: 'decepcionar a alguien', example: 'I don\'t want to let you down.' },
            { word: 'look forward to', def: 'tener ganas de algo futuro', example: 'I look forward to meeting you.' },
            { word: 'look into', def: 'investigar, explorar', example: 'I will look into this issue.' },
            { word: 'move on', def: 'seguir adelante', example: 'Let\'s move on to the next topic.' },
            { word: 'pick up', def: 'recoger; aprender algo rápido', example: 'I picked up some Spanish on my trip.' },
            { word: 'point out', def: 'señalar, destacar', example: 'She pointed out a key mistake.' },
            { word: 'put off', def: 'posponer, aplazar', example: 'Don\'t put off important tasks.' },
            { word: 'run into', def: 'encontrarse con alguien', example: 'I ran into my old boss yesterday.' },
            { word: 'run out of', def: 'quedarse sin algo', example: 'We ran out of time.' },
            { word: 'set up', def: 'organizar, configurar', example: 'Can you set up a meeting for Monday?' },
            { word: 'show up', def: 'aparecer, presentarse', example: 'He didn\'t show up to the interview.' },
            { word: 'sort out', def: 'resolver, organizar', example: 'We need to sort out this issue.' },
            { word: 'stand out', def: 'destacarse', example: 'Her work always stands out.' },
            { word: 'take over', def: 'hacerse cargo', example: 'She took over the project.' },
            { word: 'think over', def: 'reflexionar sobre algo', example: 'Let me think it over and get back to you.' },
            { word: 'turn down', def: 'rechazar una oferta', example: 'I turned down the job offer.' },
            { word: 'work out', def: 'funcionar; hacer ejercicio', example: 'I hope this plan works out.' },
            { word: 'wrap up', def: 'concluir, terminar', example: 'Let\'s wrap up this meeting.' },
        ]
    }
}

function getDueCards(allCards) {
    const now = Date.now()
    return allCards.filter(c => !c.nextReview || c.nextReview <= now)
}

function scheduleCard(card, rating) {
    const intervals = [0, 1, 3, 7, 14]
    const reps = (card.reps || 0) + 1
    const interval = rating === 0 ? 0 : intervals[Math.min(reps, intervals.length - 1)]
    return { ...card, reps, lastRating: rating, nextReview: Date.now() + interval * 86400000, lastReview: Date.now() }
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; }
  body { background:#F2F5F0; font-family:'Plus Jakarta Sans',sans-serif; font-weight:300; color:#1A1F1A; -webkit-font-smoothing:antialiased; }
  :root {
    --green:#1D6B4E; --green-light:#E8F5EE; --green-border:#C8E6D4;
    --bg:#F2F5F0; --surface:#FFFFFF; --surface2:#F7FAF7;
    --border:#E4EAE4; --border2:#C8D8C8; --text:#1A1F1A; --muted:#5A6B5A; --muted2:#9AAA9A;
    --amber:#B85C00; --amber-light:#FDF3E7; --coral:#B83A22; --coral-light:#FDEEE9;
    --shadow-sm:0 1px 3px rgba(0,0,0,0.06); --shadow-md:0 2px 8px rgba(0,0,0,0.09);
    --r:14px; --r-sm:10px;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes flipCard { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .pop-in { animation: popIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  .flip-card { animation: flipCard 0.25s cubic-bezier(0.16,1,0.3,1) both; }
  .pressable { transition: transform 0.12s, opacity 0.12s; cursor:pointer; }
  .pressable:hover { opacity:0.92; }
  .pressable:active { transform:scale(0.97); }
  .card-tap { transition: border-color 0.15s, box-shadow 0.15s; cursor:pointer; }
  .card-tap:hover { border-color:var(--border2) !important; box-shadow:var(--shadow-md) !important; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
`

function Btn({ onClick, disabled, children, fullWidth, variant }) {
    const v = variant || 'primary'
    const styles = {
        primary: { bg: disabled ? '#9ABFB0' : 'var(--green)', color: '#fff', border: 'none', shadow: '0 2px 8px rgba(29,107,78,0.2)' },
        ghost: { bg: 'transparent', color: 'var(--muted)', border: '1.5px solid var(--border2)', shadow: 'none' },
        outline: { bg: 'transparent', color: 'var(--green)', border: '1.5px solid var(--green)', shadow: 'none' },
        good: { bg: 'var(--green-light)', color: 'var(--green)', border: '2px solid var(--green)', shadow: 'none' },
        hard: { bg: 'var(--amber-light)', color: 'var(--amber)', border: '2px solid var(--amber)', shadow: 'none' },
        again: { bg: 'var(--coral-light)', color: 'var(--coral)', border: '2px solid var(--coral)', shadow: 'none' },
    }
    const st = styles[v] || styles.primary
    return (
        <button onClick={onClick} disabled={disabled} className="pressable"
            style={{ background: st.bg, color: st.color, border: st.border, borderRadius: 'var(--r)', padding: '0.85rem 1.4rem', fontSize: '0.92rem', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: st.shadow, opacity: disabled ? 0.6 : 1 }}>
            {children}
        </button>
    )
}

export default function Tarjetas() {
    const [cardData, setCardData] = useState({})
    const [view, setView] = useState('home')
    const [activePack, setActivePack] = useState(null)
    const [studyQueue, setStudyQueue] = useState([])
    const [studyIdx, setStudyIdx] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [sessionStats, setSessionStats] = useState({ good: 0, hard: 0, again: 0 })
    const [sessionDone, setSessionDone] = useState(false)
    const [myVocab, setMyVocab] = useState([])

    useEffect(() => {
        const saved = localStorage.getItem(CARDS_KEY)
        if (saved) setCardData(JSON.parse(saved))
        const appState = localStorage.getItem(STORAGE_KEY)
        if (appState) {
            try { setMyVocab(JSON.parse(appState).vocab || []) } catch (e) { }
        }
    }, [])

    function saveCardData(updated) {
        setCardData(updated)
        localStorage.setItem(CARDS_KEY, JSON.stringify(updated))
    }

    function getPackCards(packId) {
        if (packId === 'sesiones') {
            return myVocab.map((w, i) => ({ id: `ses_${i}`, word: w.word, def: w.def || w.definition || '', example: w.example || '', pack: 'sesiones' }))
        }
        return (PACKS[packId]?.cards || []).map((c, i) => ({ id: `${packId}_${i}`, ...c, pack: packId }))
    }

    function getCardSRS(cardId) { return cardData[cardId] || { reps: 0, nextReview: 0 } }

    function getDueCount(packId) {
        const packCards = getPackCards(packId)
        return getDueCards(packCards.map(c => ({ ...c, ...getCardSRS(c.id) }))).length
    }

    function getTotalLearned(packId) {
        return getPackCards(packId).filter(c => (cardData[c.id]?.reps || 0) > 0).length
    }

    function startStudy(packId) {
        const packCards = getPackCards(packId)
        if (packCards.length === 0) return
        const withSRS = packCards.map(c => ({ ...c, ...getCardSRS(c.id) }))
        const due = getDueCards(withSRS)
        const source = due.length > 0 ? due : withSRS
        const queue = [...source].sort(() => Math.random() - 0.5).slice(0, 20)
        setStudyQueue(queue); setStudyIdx(0); setFlipped(false)
        setSessionStats({ good: 0, hard: 0, again: 0 }); setSessionDone(false)
        setActivePack(packId); setView('study')
    }

    function rate(rating) {
        const card = studyQueue[studyIdx]
        const updated = scheduleCard({ ...card, ...getCardSRS(card.id) }, rating)
        saveCardData({ ...cardData, [card.id]: updated })
        const key = rating === 2 ? 'good' : rating === 1 ? 'hard' : 'again'
        setSessionStats(p => ({ ...p, [key]: p[key] + 1 }))
        if (studyIdx >= studyQueue.length - 1) { setSessionDone(true) }
        else { setStudyIdx(p => p + 1); setFlipped(false) }
    }

    const totalDue = ['sesiones', 'top1000', 'phrasal'].reduce((acc, id) => acc + getDueCount(id), 0)
    const card = studyQueue[studyIdx]

    // ── HOME ──
    if (view === 'home') return (
        <>
            <style>{CSS}</style>
            <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
                <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54 }}>
                    <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: '0.88rem', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>← Inicio</a>
                    <span style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>Mis tarjetas</span>
                    <div style={{ width: 60 }} />
                </header>

                <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <div style={{ background: 'var(--green)', borderRadius: 20, padding: '1.6rem', color: '#fff' }}>
                        <div style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: 4, fontWeight: 500 }}>Sistema de repaso inteligente</div>
                        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Tu Anki personal</h2>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.55, marginBottom: '1.2rem' }}>Las tarjetas aparecen cuando estás a punto de olvidarlas.</p>
                        {totalDue > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 500 }}>
                                ⏰ {totalDue} tarjetas para repasar hoy
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {[
                            ['📚', Object.keys(cardData).length, 'vistas'],
                            ['✓', Object.values(cardData).filter(c => (c.reps || 0) >= 3).length, 'dominadas'],
                            ['⏰', totalDue, 'para hoy'],
                        ].map(([icon, val, label]) => (
                            <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '0.9rem', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.4rem', fontWeight: 400, color: 'var(--green)', lineHeight: 1 }}>{val}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Paquetes</div>

                    {/* Mis palabras */}
                    {myVocab.length > 0 ? (
                        <div onClick={() => startStudy('sesiones')} className="card-tap"
                            style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ background: 'var(--green-light)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⭐</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>Mis palabras</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{myVocab.length} palabras de tus sesiones</div>
                                </div>
                                {getDueCount('sesiones') > 0 && <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: 'var(--green)', padding: '3px 10px', borderRadius: 99 }}>{getDueCount('sesiones')} hoy</div>}
                            </div>
                            <div style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ background: 'var(--border)', borderRadius: 99, height: 4, flex: 1, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.round(getTotalLearned('sesiones') / Math.max(myVocab.length, 1) * 100)}%`, height: '100%', background: 'var(--green)', borderRadius: 99 }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{getTotalLearned('sesiones')}/{myVocab.length}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px dashed var(--border2)', padding: '1.2rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>⭐</div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Aquí aparecerán las palabras de tus sesiones.<br />Completa una sesión primero.</div>
                        </div>
                    )}

                    {/* Top 1000 y Phrasal */}
                    {['top1000', 'phrasal'].map(packId => {
                        const pack = PACKS[packId]
                        const total = pack.cards.length
                        const learned = getTotalLearned(packId)
                        const due = getDueCount(packId)
                        return (
                            <div key={packId} onClick={() => startStudy(packId)} className="card-tap"
                                style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{pack.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{pack.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{pack.desc} · {total} tarjetas</div>
                                    </div>
                                    {due > 0 && <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: 'var(--green)', padding: '3px 10px', borderRadius: 99 }}>{due} hoy</div>}
                                </div>
                                <div style={{ padding: '0 1.2rem 0.75rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ background: 'var(--border)', borderRadius: 99, height: 4, flex: 1, overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.round(learned / total * 100)}%`, height: '100%', background: 'var(--green)', borderRadius: 99 }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{learned}/{total}</span>
                                </div>
                            </div>
                        )
                    })}

                    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '1rem 1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>¿Cómo funciona el repaso?</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                            Cada tarjeta tiene un intervalo inteligente. Si la sabes bien, vuelve en 7 días. Si es difícil, en 1 día. Si la olvidas, mañana. Así nunca pierdes lo que aprendes.
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    // ── STUDY ──
    if (view === 'study') return (
        <>
            <style>{CSS}</style>
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 14, height: 54, flexShrink: 0 }}>
                    <button onClick={() => setView('home')} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '6px 8px', borderRadius: 'var(--r-sm)', lineHeight: 1 }}>←</button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PACKS[activePack]?.name}</div>
                        <div style={{ background: 'var(--border)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${studyQueue.length > 0 ? Math.round((studyIdx / studyQueue.length) * 100) : 0}%`, height: '100%', background: 'var(--green)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                        </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>{Math.min(studyIdx + 1, studyQueue.length)}/{studyQueue.length}</span>
                </div>

                {sessionDone ? (
                    <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-light)', border: '2.5px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🎉</div>
                        <div>
                            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.7rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>Sesión completada</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>Repasaste {studyQueue.length} tarjetas</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
                            {[['✓ Bien', sessionStats.good, 'var(--green)', 'var(--green-light)'], ['~ Difícil', sessionStats.hard, 'var(--amber)', 'var(--amber-light)'], ['↺ Otra vez', sessionStats.again, 'var(--coral)', 'var(--coral-light)']].map(([label, val, color, bg]) => (
                                <div key={label} style={{ background: bg, borderRadius: 'var(--r)', padding: '0.9rem', textAlign: 'center', border: `1px solid ${color}30` }}>
                                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
                                    <div style={{ fontSize: '0.72rem', color, fontWeight: 600 }}>{label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                            <Btn onClick={() => startStudy(activePack)} fullWidth>Seguir estudiando →</Btn>
                            <Btn onClick={() => setView('home')} fullWidth variant="ghost">Volver a paquetes</Btn>
                        </div>
                    </div>
                ) : card ? (
                    <div className="fade-up" style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Dots progress */}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {studyQueue.map((_, i) => (
                                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < studyIdx ? 'var(--green)' : i === studyIdx ? 'var(--green)' : 'var(--border)', opacity: i === studyIdx ? 1 : i < studyIdx ? 0.5 : 0.25, transition: 'all 0.3s' }} />
                            ))}
                        </div>

                        {/* Card */}
                        <div
                            style={{ background: 'var(--surface)', borderRadius: 20, border: `2px solid ${flipped ? 'var(--green)' : 'var(--border2)'}`, padding: '2rem 1.5rem', textAlign: 'center', cursor: flipped ? 'default' : 'pointer', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, boxShadow: flipped ? '0 0 0 4px rgba(29,107,78,0.08)' : 'var(--shadow-md)', transition: 'border-color 0.3s, box-shadow 0.3s', flex: 1 }}
                            onClick={() => !flipped && setFlipped(true)}
                        >
                            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.5rem,5vw,2.1rem)', fontWeight: 400, color: flipped ? 'var(--green)' : 'var(--text)', letterSpacing: '-0.02em', transition: 'color 0.3s' }}>
                                {card.word}
                            </div>
                            {flipped ? (
                                <div className="flip-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                                    <div style={{ width: 40, height: 1, background: 'var(--border2)' }} />
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.7, maxWidth: 380 }}>{card.def}</div>
                                    {card.example && (
                                        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '0.8rem 1rem', fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 380, width: '100%' }}>
                                            "{card.example}"
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.82rem', color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>👆</span> Toca para ver la definición
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        {flipped ? (
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginBottom: 10, fontWeight: 500 }}>¿Qué tan bien la recordaste?</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                                    <Btn onClick={() => rate(0)} variant="again" fullWidth>↺ Otra vez</Btn>
                                    <Btn onClick={() => rate(1)} variant="hard" fullWidth>~ Difícil</Btn>
                                    <Btn onClick={() => rate(2)} variant="good" fullWidth>✓ Bien</Btn>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginTop: 6 }}>
                                    {['Mañana', 'En 1 día', 'En 3 días'].map(t => (
                                        <div key={t} style={{ fontSize: '0.68rem', color: 'var(--muted2)', textAlign: 'center' }}>{t}</div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Btn onClick={() => setFlipped(true)} fullWidth>Ver definición →</Btn>
                        )}
                    </div>
                ) : null}
            </div>
        </>
    )

    return null
}