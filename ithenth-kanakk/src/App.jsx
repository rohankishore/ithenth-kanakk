import { useMemo, useState } from 'react'
import './App.css'

const moods = [
  'ഇന്ന് കണക്ക് ചെയ്യാൻ ഒരു മോശം ദിവസമാണ്.',
  'ഉത്തരം ശരിയാണ്. കാരണം ഞാൻ പറഞ്ഞത് ശരിയാണ്.',
  'നിങ്ങൾക്ക് ഇത്രയും ക്ഷമയുണ്ടെന്ന് കരുതിയില്ല.',
  'കണക്ക്? അല്ല, ഇത് ഒരു അനുഭവമാണ്.',
]

const steps = [
  'ആദ്യം, സംഖ്യകളെ നോക്കി ഒരു നീണ്ട ശ്വാസം എടുത്തു.',
  'ഇനി ഈ കണക്കിനെ കൂടുതൽ ഔദ്യോഗികമാക്കുന്നു...',
  'ദശാംശങ്ങളെ താൽക്കാലികമായി മറ്റൊരു രാജ്യത്തേക്ക് അയച്ചു.',
  'പരിശോധിച്ചു. വീണ്ടും പരിശോധിച്ചു. എന്തിനെന്ന് അറിയില്ല.',
]

const levelCopy = [
  { label: 'സാധാരണം', english: 'normal', value: 23, color: 'mint' },
  { label: 'കുഴപ്പം', english: 'confusion', value: 61, color: 'yellow' },
  { label: 'വെറുതെ', english: 'for no reason', value: 96, color: 'pink' },
]

function App() {
  const [input, setInput] = useState('25 ÷ 4')
  const [display, setDisplay] = useState('6.25')
  const [history, setHistory] = useState('25 ÷ 4')
  const [level, setLevel] = useState(1)
  const [message, setMessage] = useState(moods[1])
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)

  const transformed = useMemo(() => {
    if (display === '6.25') return level > 1 ? '√(39.0625) × 10⁰' : '6.25'
    return level > 1 ? `(${display} + 0) × 1⁰` : display
  }, [display, level])

  const calculate = (nextInput = input) => {
    const expression = nextInput.replace('×', '*').replace('÷', '/')
    try {
      const result = Function(`"use strict"; return (${expression})`)()
      if (!Number.isFinite(result)) throw new Error('nope')
      setDisplay(String(Number(result.toFixed(6))))
      setHistory(nextInput)
      setMessage(moods[Math.floor(Math.random() * moods.length)])
    } catch {
      setDisplay('hmm?')
      setMessage('ഇത് കണക്ക് അല്ല. പക്ഷേ ആത്മവിശ്വാസം അഭിനന്ദനാർഹമാണ്.')
    }
  }

  const press = (value) => {
    if (value === 'C') {
      setInput('')
      setDisplay('0')
      setHistory('fresh start')
      return
    }
    if (value === '=') {
      calculate()
      return
    }
    const next = input === '25 ÷ 4' || input === '0' ? value : `${input}${value}`
    setInput(next)
    if (next.match(/[+\-×÷]$/)) {
      setPrediction(String(Math.floor(Math.random() * 89) + 11))
      setMessage('എനിക്ക് നിങ്ങളുടെ അടുത്ത നമ്പർ അറിയാം. ഏകദേശം.')
    }
  }

  const makeWorse = () => {
    setLevel((current) => Math.min(3, current + 1))
    setMessage('അഭിനന്ദനങ്ങൾ. ഇത് ഇപ്പോൾ ആവശ്യത്തിലധികം സങ്കീർണ്ണമാണ്.')
  }

  const fakeAction = (text) => {
    setLoading(true)
    setMessage(text)
    window.setTimeout(() => setLoading(false), 850)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">?</span>
          <div>
            <p className="eyebrow">A calculator for people who</p>
            <h1>ഇതെന്ത് കണക്ക്?</h1>
          </div>
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
              <button className={`meter meter-${item.color}`} key={item.label} onClick={() => { setLevel(index + 1); setMessage(`Level ${index + 1}: ${item.label}. A bold choice.`) }}>
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
              <strong>{loading ? '...' : transformed}</strong>
              {level > 1 && <small>{steps[level - 2]}</small>}
            </div>
            {prediction && <button className="prediction" onClick={() => { setPrediction(null); setMessage('അയ്യോ. പ്രവചനം തെറ്റി. 98% confidence എവിടെ പോയി?') }}>I predict: <b>{prediction}</b> <span>tap to reject</span></button>}
            <div className="keypad">
              {['C', '+/-', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map((key) => (
                <button key={key} className={`key ${['÷', '×', '−', '+', '='].includes(key) ? 'operator' : ''} ${key === 'C' || key === '+/-' || key === '%' ? 'utility' : ''}`} onClick={() => press(key)}>{key}</button>
              ))}
            </div>
            <div className="calc-footer"><span>☘ സാധാരണം</span><span>🎮 കുഴപ്പം</span><span>🧠 വെറുതെ</span></div>
          </div>
        </section>

        <aside className="right-rail">
          <div className="level-badge">LEVEL {level}<span>{level === 1 ? 'normal-ish' : level === 2 ? 'needlessly complex' : 'absolutely pointless'}</span></div>
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
