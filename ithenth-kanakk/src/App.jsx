import { useMemo, useState } from 'react'
import './App.css'

const moods = [
  'ഇന്ന് കണക്ക് ചെയ്യാൻ ഒരു മോശം ദിവസമാണ്.',
  'ഉത്തരം ശരിയാണ്. കാരണം ഞാൻ പറഞ്ഞത് ശരിയാണ്.',
  'നിങ്ങൾക്ക് ഇത്രയും ക്ഷമയുണ്ടെന്ന് കരുതിയില്ല.',
  'കണക്ക്? അല്ല, ഇത് ഒരു അനുഭവമാണ്.',
]

const levelSteps = [
  [
    'ഉത്തരം കണ്ടെത്തി. ഉടൻ തന്നെ അതിനെ കൂടുതൽ ബുദ്ധിമുട്ടാക്കി.',
    '2 − 1 → √1 → 10⁰ → log₁₀(10)',
    'തുല്യമാണ്. കാണാൻ മാത്രം തുല്യമല്ലെന്ന് തോന്നുന്നു.',
  ],
  [
    'ഘട്ടം 1: സംഖ്യകളെ നോക്കി ഒരു നീണ്ട ശ്വാസം എടുത്തു.',
    'ഘട്ടം 2: യൂണിറ്റുകളെ താൽക്കാലികമായി മറ്റൊരു രാജ്യത്തേക്ക് അയച്ചു.',
    'ഘട്ടം 3: വീണ്ടും കണക്കാക്കി. വീണ്ടും പരിശോധിച്ചു. എന്തിനെന്ന് അറിയില്ല.',
    'ഘട്ടം 4: ഫലം ശരിയാണെന്ന് തെളിയിക്കാൻ ഫലത്തെ തന്നെ ചോദ്യം ചെയ്തു.',
  ],
  [
    'ഭാവി സ്കാൻ ചെയ്തു... നിങ്ങളുടെ വിരലുകൾ സംശയാസ്പദമാണ്.',
    '98.7% confidence ഉപയോഗിച്ച് ഒരു നമ്പർ വായുവിൽ നിന്ന് എടുത്തു.',
    'ആ നമ്പർ നിങ്ങളുടെ മനസ്സുമായി ചെറിയ തർക്കത്തിലാണ്.',
    'ഗണിതശാസ്ത്രം ഇപ്പോൾ ഉത്തരവാദിത്തം ഏറ്റെടുക്കുന്നില്ല.',
  ],
]

const levelCopy = [
  { label: 'അനാവശ്യം', english: 'unnecessary', value: 23, color: 'mint' },
  { label: 'അമിതം', english: 'excessive', value: 61, color: 'yellow' },
  { label: 'അസംബന്ധം', english: 'absurd', value: 96, color: 'pink' },
]

function App() {
  const [input, setInput] = useState('')
  const [display, setDisplay] = useState('0')
  const [history, setHistory] = useState('ഒന്ന് വേഗം ടൈപ്പ് ആക്കെടോ ')
  const [level, setLevel] = useState(1)
  const [message, setMessage] = useState(moods[1])
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [justCalculated, setJustCalculated] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [worseCount, setWorseCount] = useState(0)

  const transformed = useMemo(() => {
    if (display === '0' && history === 'ഒന്ന് വേഗം ടൈപ്പ് ആക്കെടോ ') return '0'
    if (level === 1) {
      const divisionParts = history.split('÷').map((part) => part.trim())
      const equivalent = history.includes('÷') && divisionParts.length === 2
        ? `${history} → ${divisionParts[0]} × (1 ÷ ${divisionParts[1]})`
        : `${history} → (${history}) + 0`
      return `${equivalent} → ${display}${' → equivalent'.repeat(worseCount)}`
    }
    if (level === 2) return `${display} → ${display} × 100 ÷ 100 → ${display} + 0${' → verified again'.repeat(worseCount)}`
    return `${display} → probably ${display} → definitely maybe ${display}${' → statistically suspicious'.repeat(worseCount)}`
  }, [display, level, worseCount])

  const screenValue = input && !justCalculated ? input : transformed

  const calculate = (nextInput = input) => {
    const expression = nextInput.replace('×', '*').replace('÷', '/').replace('−', '-').replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
    try {
      if (!/^[\d+*/().\-\s]+$/.test(expression)) throw new Error('nope')
      const result = Function(`"use strict"; return (${expression})`)()
      if (!Number.isFinite(result)) throw new Error('nope')
      setDisplay(String(Number(result.toFixed(6))))
      setHistory(nextInput)
      setInput(String(Number(result.toFixed(6))))
      setJustCalculated(true)
        if (level === 1) setMessage('കൃത്യമായ ഉത്തരം. പക്ഷേ നേരെ പറയുന്നത് മര്യാദയല്ല.')
        if (level === 2) setMessage('ഉത്തരം ശരിയാണ്. അതിലേക്ക് എത്താൻ നാലു ഘട്ടങ്ങൾ മാത്രം വേണ്ടിയിരുന്നു.')
        if (level === 3) setMessage('കണക്ക് പൂർത്തിയായി. വിശ്വസിക്കണമെന്ന് ഞാൻ പറയുന്നില്ല.')
    } catch {
      setDisplay('hmm?')
      setHistory(nextInput)
      setMessage('ഇത് കണക്ക് അല്ല. പക്ഷേ ആത്മവിശ്വാസം അഭിനന്ദനാർഹമാണ്.')
    }
  }

  const press = (value) => {
    if (value === 'C') {
      setInput('')
      setDisplay('0')
      setHistory('fresh start')
      setPrediction(null)
      setJustCalculated(false)
      setWorseCount(0)
      return
    }
    if (value === '+/-') {
      setInput((current) => current.startsWith('-') ? current.slice(1) : `-${current}`)
      setJustCalculated(false)
      return
    }
    if (value === '=') {
      calculate()
      return
    }
    const startsNew = justCalculated && !['+', '−', '×', '÷', '%'].includes(value)
    const replacingPrediction = prediction && !['+', '−', '×', '÷', '%'].includes(value)
    const next = replacingPrediction
      ? `${prediction.base}${value}`
      : startsNew || input === '0' ? value : `${input}${value}`
    setInput(next)
    setJustCalculated(false)
    if (replacingPrediction) {
      setPrediction(null)
      setMessage('പ്രവചനം തെറ്റിച്ചു. നല്ലത്. നിങ്ങൾ ഇപ്പോഴും നിയന്ത്രണത്തിലാണെന്ന് നടിക്കാം.')
    }
    if (next.match(/[+\-×÷]$/)) {
      if (level === 3) {
        const valueGuess = String(Math.floor(Math.random() * 89) + 11)
        setPrediction({ value: valueGuess, base: next, confidence: (97 + Math.random() * 2.9).toFixed(1) })
        setInput(`${next}${valueGuess}`)
        setMessage('നിങ്ങളുടെ അടുത്ത നമ്പർ ഞാൻ സ്വയം ചേർത്തു. ദയവായി അതിൽ നിരാശപ്പെടുക.')
      } else {
        setMessage(level === 2 ? 'അമിതമായ verification queue-ലേക്ക് ചേർത്തു.' : 'ഒരു operator കണ്ടു. ഇപ്പോൾ ഗണിതം ആരംഭിക്കാം.')
      }
    }
  }

  const makeWorse = () => {
    setWorseCount((current) => Math.min(3, current + 1))
    setMessage(level === 1
      ? 'തുല്യമായ മറ്റൊരു സമവാക്യം ചേർത്തു. ആവശ്യമായിരുന്നില്ല.'
      : level === 2
        ? 'രണ്ട് verification കൂടി ചേർത്തു. ഫലം മാറിയിട്ടില്ല. സമയം മാത്രം പോയി.'
        : 'അസംബന്ധത വർധിപ്പിച്ചു. ഇപ്പോൾ calculator നിങ്ങളെക്കുറിച്ച് അഭിപ്രായപ്പെടുന്നു.')
  }

  const fakeAction = (text) => {
    setLoading(true)
    setMessage(text)
    window.setTimeout(() => setLoading(false), 850)
  }

  return (
    <main className="app-shell">
      {showTutorial && (
        <div className="tutorial-backdrop" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
          <section className="tutorial-card">
            <div className="tutorial-kicker">WELCOME TO THE LEAST USEFUL CALCULATOR</div>
            <div className="tutorial-icon">?</div>
            <h2 id="tutorial-title">ഇതെന്ത് കണക്ക്?</h2>
            <p className="tutorial-lead">A calculator that knows the answer, but would prefer to make you work for it.</p>
            <div className="tutorial-grid">
              <article><b>01 · അനാവശ്യം</b><p>It calculates correctly, then disguises the answer as an unnecessarily complicated equivalent equation.</p></article>
              <article><b>02 · അമിതം</b><p>It adds conversions, repeated verification, fake processing, and several steps nobody requested.</p></article>
              <article><b>03 · അസംബന്ധം</b><p>After an operator, it confidently autofills your next number. It is usually wrong. Please reject it personally.</p></article>
            </div>
            <p className="tutorial-footnote">Nothing here will save you time. That is the point.</p>
            <button className="tutorial-button" type="button" onClick={() => setShowTutorial(false)}>I understand absolutely nothing <span>↗</span></button>
          </section>
        </div>
      )}
      <header className="topbar">
        <div className="brand-lockup">
          <img className="brand-logo" src="/logo.png" alt="ഇതെന്ത് കണക്ക്?" />
        </div>
        <div className="header-note"><span className="status-dot" /> 100% confident*</div>
        <button className="icon-button" type="button" onClick={() => fakeAction('Settings? There are no settings.')}>⚙</button>
      </header>

      <section className="dashboard">
        <aside className="left-rail">
          <div className="sticker">SAME<br />MATH.<br /><strong>MORE<br />DRAMA.</strong></div>
          <div className="meters">
            <p className="section-label">USELESSNESS LEVELS</p>
            {levelCopy.map((item, index) => (
              <button className={`meter meter-${item.color}`} key={item.label} onClick={() => { setLevel(index + 1); setWorseCount(0); setPrediction(null); setMessage(`Level ${index + 1}: ${item.label}. A bold choice.`) }}>
                <span className="meter-top"><b>{item.label}</b><small>{item.english}</small></span>
                <span className="meter-track"><i style={{ width: `${item.value}%` }} /></span>
                <strong>{item.value}%</strong>
              </button>
            ))}
          </div>
          <div className="mascot" aria-hidden="true"><span>◉</span><span>◉</span><b>⌁</b></div>
        </aside>

        <section className="calculator-wrap">
          <div className="speech-bubble">കണക്കു<br />വേണോ?</div>
          <div className="calculator">
            <div className="calc-top"><span className="tiny-light" /> ITK-3000 <span>9:41</span></div>
            <div className={`screen ${loading ? 'screen-loading' : ''}`}>
              <span className="screen-history">{history} =</span>
              <strong>{loading ? '...' : screenValue}</strong>
              {level > 1 && <small>{levelSteps[level - 1][Math.min(worseCount, levelSteps[level - 1].length - 1)]}</small>}
            </div>
              {prediction && <button className="prediction" onClick={() => { setPrediction(null); setInput(prediction.base); setMessage(`അയ്യോ. ${prediction.confidence}% confidence എവിടെ പോയി? പ്രവചനം തള്ളി.`) }}>I predict: <b>{prediction.value}</b> <span>{prediction.confidence}% confident · reject</span></button>}
            <div className="keypad">
              {['C', '+/-', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map((key) => (
                <button key={key} className={`key ${['÷', '×', '−', '+', '='].includes(key) ? 'operator' : ''} ${key === 'C' || key === '+/-' || key === '%' ? 'utility' : ''}`} onClick={() => press(key)}>{key}</button>
              ))}
            </div>
            <div className="calc-footer"><span>☘ അനാവശ്യം</span><span>🎮 അമിതം</span><span>🧠 അസംബന്ധം</span></div>
          </div>
        </section>

        <aside className="right-rail">
          <div className="level-badge">LEVEL {level}<span>{levelCopy[level - 1].label} · {level === 1 ? 'equivalent-ish' : level === 2 ? 'needlessly elaborate' : 'actively ridiculous'}</span></div>
          <div className="commentary"><span className="quote-mark">“</span><p>{message}</p></div>
          <div className="action-stack">
            <button onClick={() => fakeAction('It just felt right to me. Do it yourself on paper.')}>Explain steps <span>↗</span></button>
            <button onClick={() => fakeAction('Verified. Verification verified.')}>Verify again <span>↻</span></button>
            <button onClick={() => fakeAction('Why? Excellent question. No answer.')}>Why? <span>?</span></button>
            <button onClick={() => { setLevel(3); setMessage('Predictive mode activated. Your keystrokes are being judged.') }}>Predict my next number <span>⌁</span></button>
          </div>
          <button className="worse-button" onClick={makeWorse}>MAKE IT WORSE <span>↗</span></button>
          <p className="fine-print">*confidence is a feeling, not a measurement</p>
        </aside>
      </section>
      <footer>© 2026 ITK Industries <span>•</span> Built with questionable math <span>•</span> no useful features found</footer>
    </main>
  )
}

export default App
