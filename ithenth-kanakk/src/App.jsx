import { useEffect, useMemo, useRef, useState } from 'react'
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

const shuffleDigits = (value) => {
  const [whole, fraction] = String(value).split('.')
  const sign = whole.startsWith('-') ? '-' : ''
  const digits = whole.replace('-', '').split('')
  for (let index = digits.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[digits[index], digits[swapIndex]] = [digits[swapIndex], digits[index]]
  }
  if (digits.length > 1 && digits[0] === '0') {
    const nonZeroIndex = digits.findIndex((digit) => digit !== '0')
    ;[digits[0], digits[nonZeroIndex]] = [digits[nonZeroIndex], digits[0]]
  }
  return `${sign}${digits.join('')}${fraction ? `.${fraction}` : ''}`
}

const getCurrentTime = () => new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date())

function App() {
  const [input, setInput] = useState('')
  const [display, setDisplay] = useState('0')
  const [history, setHistory] = useState('ഒന്ന് വേഗം ടൈപ്പ് ആക്കെടോ ')
  const [level, setLevel] = useState(1)
  const [message, setMessage] = useState(moods[1])
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [justCalculated, setJustCalculated] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [worseCount, setWorseCount] = useState(0)
  const [numberMap, setNumberMap] = useState({})
  const [tutorialOrder, setTutorialOrder] = useState([0, 1, 2])

  const generateShuffledNumberMap = () => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    const shuffled = [...digits]
    // Shuffle digit labels until at least some numbers swap places
    do {
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
    } while (shuffled.every((d, i) => d === digits[i]))

    const map = {}
    digits.forEach((digit, idx) => {
      map[digit] = shuffled[idx]
    })
    return map
  }
  const [showExplainPopup, setShowExplainPopup] = useState(false)
  const [confidence, setConfidence] = useState('98.7')
  const [faceReacting, setFaceReacting] = useState(false)
  const [showFaceAchievement, setShowFaceAchievement] = useState(false)
  const [showDivisionAchievement, setShowDivisionAchievement] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [showDarkPopup, setShowDarkPopup] = useState(false)
  const [darkPopupStep, setDarkPopupStep] = useState(0)
  const [verifyPopupStep, setVerifyPopupStep] = useState(null)
  const [showTooFastPopup, setShowTooFastPopup] = useState(false)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const rapidClicks = useRef([])
  const [currentTime, setCurrentTime] = useState(getCurrentTime)
  const [clickedKey, setClickedKey] = useState(null)

  const darkPopupText = [
    'ഉറപ്പാണോ മിത്രമേ?',
    'ഒന്ന്കൂടി ആലോചിച്ചിട്ട് പോരെ ?',
    'അങ്ങനിപ്പം ഒണ്ടാക്കണ്ട. വേണേൽ കണ്ണടച് ഇരുട്ടാക്ക് ',
  ]
  const darkPopupButtons = ['ഉവ്വ്', 'ആയ്കോട്ടെ ', 'എന്റെ അറിവില്ലായ്മ ക്ഷെമിക്കണം']
  const achievements = [
    { id: 'face', title: 'Clicked the face', description: 'You interacted with decorative anatomy.' },
    { id: 'zero', title: 'Divided by zero', description: 'You challenged mathematics and lost politely.' },
    { id: 'speed', title: 'Moderately impatient', description: 'The calculator asked you to slow down.' },
    { id: 'worse', title: 'Made it worse', description: 'You saw the problem and increased it.' },
  ]

  const unlockAchievement = (achievementId) => {
    setUnlockedAchievements((current) => current.includes(achievementId) ? current : [...current, achievementId])
  }

  useEffect(() => {
    if (!showTutorial) return undefined
    const shuffle = window.setInterval(() => {
      setTutorialOrder((current) => [current[1], current[2], current[0]])
    }, 1700)
    return () => window.clearInterval(shuffle)
  }, [showTutorial])

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentTime(getCurrentTime()), 60000)
    return () => window.clearInterval(clock)
  }, [])

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
    return `probably ${display} · ${confidence}% confident${' · statistically suspicious'.repeat(worseCount)}`
  }, [display, level, worseCount, confidence])

  const screenValue = input && !justCalculated ? input : transformed

  const calculate = (nextInput = input) => {
    const expression = nextInput.replace('×', '*').replace('÷', '/').replace('−', '-').replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
    try {
      if (!/^[\d+*/().\-\s]+$/.test(expression)) throw new Error('nope')
      if (/\/\s*0(?:\s*(?:[+*/().-]|$))/.test(expression)) {
        unlockAchievement('zero')
        setDisplay('∞?')
        setHistory(nextInput)
        setInput('∞?')
        setJustCalculated(true)
        setMessage('പൂജ്യത്തെ കൊണ്ട് divide ചെയ്യാൻ ശ്രമിച്ചു. ധൈര്യം ഉണ്ട്, logic ഇല്ല.')
        setShowDivisionAchievement(true)
        window.setTimeout(() => setShowDivisionAchievement(false), 6000)
        return
      }
      const result = Function(`"use strict"; return (${expression})`)()
      if (!Number.isFinite(result)) throw new Error('nope')
      const correctResult = Number(result.toFixed(6))
      const isWrongAnswer = Math.random() < 0.9
      const shownResult = isWrongAnswer
        ? Number((correctResult + (correctResult === 0 ? 7 : Math.max(1, Math.round(Math.abs(correctResult) * 0.23)))).toFixed(6))
        : correctResult
      const isShiftedLevelThreeAnswer = level === 3 && Math.random() < 0.45 && String(shownResult).replace(/\D/g, '').length > 1
      const visibleResult = isShiftedLevelThreeAnswer ? shuffleDigits(shownResult) : String(shownResult)
      setDisplay(visibleResult)
      setHistory(nextInput)
      setInput(visibleResult)
      setJustCalculated(true)
      if (level === 1) setMessage(isWrongAnswer
        ? 'probably correct'
        : 'ഇത്തവണ ശരിയായി. ഇത് ഒരു അപകടം മാത്രമായിരുന്നു.')
      if (level === 2) setMessage(isWrongAnswer
        ? 'doubt ndel swayam cheyyuka'
        : 'ഉത്തരം ശരിയാണ്. ഇത്രയും verification കഴിഞ്ഞിട്ട് തെറ്റാൻ പാടില്ലായിരുന്നു.')
      if (level === 3) {
        setConfidence(isWrongAnswer ? (38 + Math.random() * 18).toFixed(1) : '98.7')
        setMessage(isWrongAnswer
          ? 'ഉത്തരം തെറ്റായിരിക്കാം. വേണേൽ സ്വയം കണക്ക് കൂട്ടുക!'
          : isShiftedLevelThreeAnswer
            ? ``
            : 'ഇത്തവണ ശരിയായി. ഇത് ആവർത്തിക്കുമെന്ന് വാഗ്ദാനം ചെയ്യുന്നില്ല.')
      }
    } catch {
      setDisplay('hmm?')
      setHistory(nextInput)
      setMessage('ഇത് കണക്ക് അല്ല. പക്ഷേ ആത്മവിശ്വാസം അഭിനന്ദനാർഹമാണ്.')
    }
  }

  const press = (value) => {
    if (/^\d$/.test(value)) {
      setClickedKey(value)
      window.setTimeout(() => setClickedKey(null), 180)
      try {
        const audioContext = new window.AudioContext()
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        oscillator.type = 'triangle'
        oscillator.frequency.value = 180 + Number(value) * 32
        gain.gain.setValueAtTime(0.045, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08)
        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.08)
      } catch {
        // Audio is optional; the visual reaction still works.
      }
    }
    const now = Date.now()
    rapidClicks.current = [...rapidClicks.current.filter((clickTime) => now - clickTime < 2500), now]
    if (rapidClicks.current.length >= 4) {
      unlockAchievement('speed')
      setShowTooFastPopup(true)
      rapidClicks.current = []
      setMessage('വേഗം കുറയ്ക്കൂ. ഈ calculator പോലും ഇത്രയും serious അല്ല.')
    }
    if (value === 'C') {
      setInput('')
      setDisplay('0')
      setHistory('fresh start')
      setPrediction(null)
      setJustCalculated(false)
      setWorseCount(0)
      setNumberMap({})
      return
    }
    if (value === '⌫') {
      setInput((current) => current.slice(0, -1))
      setJustCalculated(false)
      if (prediction && input.length <= prediction.base.length + prediction.value.length) {
        setPrediction(null)
        setMessage('മുന്നറിയിപ്പ് നീക്കം ചെയ്തു. ഇതിന് ഇത്രയും സമയം വേണ്ടിയിരുന്നില്ല.')
      }
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
    const next = startsNew || input === '0' ? value : `${input}${value}`
    setInput(next)
    setJustCalculated(false)
    if (next.match(/[+\-×÷]$/)) {
      if (level === 3) {
        const valueGuess = String(Math.floor(Math.random() * 89) + 11)
        const predictionConfidence = (97 + Math.random() * 2.9).toFixed(1)
        setConfidence(predictionConfidence)
        setPrediction({ value: valueGuess, base: next, confidence: predictionConfidence })
        setInput(`${next}${valueGuess}`)
        setMessage('നിങ്ങളുടെ അടുത്ത നമ്പർ ഞാൻ സ്വയം ചേർത്തു. ദയവായി അതിൽ നിരാശപ്പെടുക.')
      } else {
        setMessage(level === 2 ? '' : '')
      }
    }
  }

  const makeWorse = () => {
    unlockAchievement('worse')
    const nextCount = worseCount + 1
    setWorseCount(nextCount)
    setNumberMap(generateShuffledNumberMap())
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

  const explainSteps = () => {
    setShowExplainPopup(true)
  }

  const reactToFace = () => {
    unlockAchievement('face')
    setFaceReacting(true)
    setShowFaceAchievement(true)
    window.setTimeout(() => setFaceReacting(false), 2400)
    window.setTimeout(() => setShowFaceAchievement(false), 6000)
  }

  const openDarkMode = () => {
    setDarkPopupStep(0)
    setShowDarkPopup(true)
  }

  const openSettings = () => {
    setShowSettingsPopup(true)
  }

  const advanceDarkPopup = () => {
    if (darkPopupStep === darkPopupText.length - 1) {
      setShowDarkPopup(false)
      return
    }
    setDarkPopupStep((current) => current + 1)
  }

  const openVerifyPopup = () => {
    setVerifyPopupStep(0)
  }

  const buyPenAndPaper = () => {
    window.open('https://www.amazon.in/s?k=pen+and+paper', '_blank', 'noopener,noreferrer')
    setVerifyPopupStep(1)
  }

  return (
    <main className="app-shell">
      {showFaceAchievement && (
        <div className="achievement-toast" role="status">
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--piece': index }} />)}
          </div>
          <span className="achievement-kicker">ACHIEVEMENT UNLOCKED</span>
          <strong>വേലേം കൂലീം ഇല്ലാത്തവൻ</strong>
          <p>Congrats! You wasted valuable 5s of your life clicking on an emoji face instead of doing some REAL കണക്ക് </p>
        </div>
      )}
      {showDivisionAchievement && (
        <div className="achievement-toast division-achievement" role="status">
          <img src="/memes-dark/4.png" alt="Division by zero reaction meme" />
          <span className="achievement-kicker">ACHIEVEMENT UNLOCKED</span>
          <strong>Divided by zero</strong>
          <p>പൂജ്യം പോലും ഇത് കണ്ടിട്ട് മാറിനിന്നു. നിങ്ങൾക്ക് ഇനി pen-and-paper പോലും സഹായിക്കില്ല.</p>
        </div>
      )}
      {showAchievements && (
        <div className="dark-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="achievements-title">
          <section className="dark-popup achievements-popup">
            <button className="popup-close" type="button" aria-label="Close achievements" onClick={() => setShowAchievements(false)}>×</button>
            <div className="dark-popup-kicker">THE THINGS YOU HAVE DONE</div>
            <h2 id="achievements-title">Achievements</h2>
            <p className="achievements-intro">A collection of consequences. Some are yours. Some are waiting.</p>
            <div className="achievement-list">
              {achievements.map((achievement) => {
                const unlocked = unlockedAchievements.includes(achievement.id)
                return <article className={unlocked ? 'achievement-item unlocked' : 'achievement-item'} key={achievement.id}>
                  <span className="achievement-status">{unlocked ? '✓' : '?'}</span>
                  <div><strong>{unlocked ? achievement.title : '???'}</strong><p>{unlocked ? achievement.description : 'Not unlocked. Probably for the best.'}</p></div>
                </article>
              })}
            </div>
            <button type="button" className="dark-popup-next" onClick={() => setShowAchievements(false)}>Return to unfinished business <span>↩</span></button>
          </section>
        </div>
      )}
      {showDarkPopup && (
        <div className="dark-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="dark-popup-title">
          <section className="dark-popup">
            <div className="dark-popup-kicker">അന്ധകാരത്തിലേക്ക് ഒരു യാത്ര</div>
            <div className={`meme-slot meme-stage-${darkPopupStep + 1}`} aria-label={`Dark mode meme ${darkPopupStep + 1}`}>
              <img src={`/memes-dark/${darkPopupStep + 1}.png`} alt={`Dark mode reaction meme ${darkPopupStep + 1}`} />
            </div>
            <p id="dark-popup-title" className={darkPopupStep === 2 ? 'dark-popup-no' : ''}>{darkPopupText[darkPopupStep]}</p>
            <button type="button" className="dark-popup-next" onClick={advanceDarkPopup}>{darkPopupButtons[darkPopupStep]} <span>↗</span></button>
          </section>
        </div>
      )}
      {verifyPopupStep !== null && (
        <div className="dark-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="verify-popup-title">
          <section className="dark-popup verify-popup">
            <div className="dark-popup-kicker">VERIFICATION DEPARTMENT</div>
            <div className="verify-popup-icon" aria-hidden="true">✎</div>
            <p id="verify-popup-title">
              {verifyPopupStep === 0
                ? 'You asked to verify again. The calculator has decided that you need pen and paper.'
                : 'Excellent. You bought stationery to verify a calculator result. The calculator remains emotionally unavailable.'}
            </p>
            {verifyPopupStep === 0 ? (
              <button type="button" className="dark-popup-next" onClick={buyPenAndPaper}>Buy pen and paper <span>↗</span></button>
            ) : (
              <button type="button" className="dark-popup-next" onClick={() => setVerifyPopupStep(null)}>Return to wasting time <span>↩</span></button>
            )}
          </section>
        </div>
      )}
      {showExplainPopup && (
        <div className="dark-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="explain-popup-title">
          <section className="dark-popup explain-popup">
            <div className="dark-popup-kicker">EXPLANATION DEPARTMENT</div>
            <div className="explain-popup-image"><img src="/memes-misc/saukaryilla.png" alt="സൗകര്യമില്ല" /></div>
            <p id="explain-popup-title">സൗകര്യമില്ല </p>
            <button type="button" className="dark-popup-next" onClick={() => setShowExplainPopup(false)}>Return to not knowing <span>↩</span></button>
          </section>
        </div>
      )}
      {showTooFastPopup && (
        <div className="dark-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="too-fast-title">
          <section className="dark-popup too-fast-popup">
            <div className="dark-popup-kicker">UNNECESSARY INTERRUPTION</div>
            <div className="too-fast-icon" aria-hidden="true">!</div>
            <p id="too-fast-title">Please slow down. This is not a useful app.</p>
            <small>You clicked 4 times in 2.5 seconds. Nothing became more productive.</small>
            <button type="button" className="dark-popup-next" onClick={() => setShowTooFastPopup(false)}>I will waste time slower <span>↗</span></button>
          </section>
        </div>
      )}
      {showSettingsPopup && (
        <div className="dark-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-popup-title">
          <section className="dark-popup settings-popup">
            <div className="dark-popup-kicker">SETTINGS, PROBABLY</div>
            <div className="settings-dial" aria-hidden="true">⚙</div>
            <h2 id="settings-popup-title">Important അല്ലാത്ത settings</h2>
            <div className="fake-settings">
              <span>Calculation seriousness</span><b>0%</b>
              <span>Useful features</span><b>Not found</b>
              <span>User patience</span><b>decreasing</b>
            </div>
            <p>Everything is already configured to waste your time. Changing this would be too useful.</p>
            <button type="button" className="dark-popup-next" onClick={() => setShowSettingsPopup(false)}>Leave it useless <span>↩</span></button>
          </section>
        </div>
      )}
      {showTutorial && (
        <div className="tutorial-backdrop" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
          <section className="tutorial-card">
            <div className="tutorial-kicker">WELCOME TO THE LEAST USEFUL CALCULATOR</div>
            <div className="tutorial-icon">?</div>
            <h2 id="tutorial-title">ഇതെന്ത് കണക്ക്?</h2>
            <p className="tutorial-lead">A calculator that knows the answer, but would prefer to make you work for it.</p>
            <div className="tutorial-grid">
              <article style={{ order: tutorialOrder[0] }}><b>01 · അനാവശ്യം</b><p>It calculates correctly, then disguises the answer as an unnecessarily complicated equivalent equation.</p></article>
              <article style={{ order: tutorialOrder[1] }}><b>02 · അമിതം</b><p>It adds conversions, repeated verification, fake processing, and several steps nobody requested.</p></article>
              <article style={{ order: tutorialOrder[2] }}><b>03 · അസംബന്ധം</b><p>After an operator, it confidently autofills your next number. It is usually wrong. Please reject it personally.</p></article>
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
        <div className="header-actions">
          <button className="icon-button dark-mode-button" type="button" aria-label="Dark mode" onClick={openDarkMode}><span aria-hidden="true">☾</span><b>Dark mode</b></button>
          <button className="icon-button achievements-button" type="button" aria-label="Achievements" onClick={() => setShowAchievements(true)}><span aria-hidden="true">🏆</span><b>Achievements</b></button>
          <button className="icon-button" type="button" aria-label="Settings" onClick={openSettings}><span aria-hidden="true">⚙</span><b>Settings</b></button>
        </div>
      </header>

      <section className="dashboard">
        <aside className="left-rail">
          <div className="meters">
            <p className="section-label">USELESSNESS LEVELS</p>
            {levelCopy.map((item, index) => (
              <button className={`meter meter-${item.color}`} key={item.label} onClick={() => { setLevel(index + 1); setWorseCount(0); setNumberMap({}); setPrediction(null); setMessage(`Level ${index + 1}: ${item.label}. A bold choice.`) }}>
                <span className="meter-top"><b>{item.label}</b><small>{item.english}</small></span>
                <span className="meter-track"><i style={{ width: `${item.value}%` }} /></span>
                <strong>{item.value}%</strong>
              </button>
            ))}
          </div>
          <div className="mascot-wrap">
            {faceReacting && <div className="face-speech">മുഖത്ത് ക്ലിക്ക് ചെയ്തോ?<br />അതും കണക്കിന്റെ ഭാഗമല്ലായിരുന്നു.</div>}
            <button className={`mascot ${faceReacting ? 'face-reacting' : ''}`} type="button" aria-label="React with calculator face" onClick={reactToFace}><span>◉</span><span>◉</span><b>⌁</b></button>
          </div>
        </aside>

        <section className="calculator-wrap">
          <div className={`calculator worse-${Math.min(3, worseCount)}`}>
            <div className="calc-top"><span className="tiny-light" /> IDK-6767 <span>{currentTime}</span></div>
            <div className={`screen ${loading ? 'screen-loading' : ''}`}>
              <span className="screen-history">{history}{history === 'ഒന്ന് വേഗം ടൈപ്പ് ആക്കെടോ ' ? '' : ' ='}</span>
              <strong>{loading ? '...' : screenValue}</strong>
              <small className="screen-commentary">{message}</small>
            </div>
            {prediction && <div className="prediction">I predicted: <b>{prediction.value}</b> <span>{prediction.confidence}% confident · delete it yourself</span></div>}
            <div className="keypad">
              {['C', '⌫', '+/-', '%', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '+', '='].map((key) => {
                const isNumber = /^\d$/.test(key)
                const displayKey = isNumber && numberMap[key] ? numberMap[key] : key

                return (
                  <button
                    key={key}
                    className={`key ${clickedKey === displayKey ? 'key-clicked' : ''} ${['÷', '×', '−', '+', '='].includes(key) ? 'operator' : ''} ${key === 'C' || key === '⌫' || key === '+/-' || key === '%' ? 'utility' : ''} ${key === '=' ? 'equals' : ''}`}
                    onClick={() => press(displayKey)}
                  >
                    {displayKey}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="right-rail">
          <div className="level-badge">LEVEL {level}<span>{levelCopy[level - 1].label} · {level === 1 ? 'equivalent-ish' : level === 2 ? 'needlessly elaborate' : 'actively ridiculous'}</span></div>
          <div className="action-stack">
            <button onClick={explainSteps}>Explain steps <span>↗</span></button>
            <button onClick={openVerifyPopup}>Verify again <span>↻</span></button>
            <button onClick={() => fakeAction('Why? Excellent question. No answer.')}>Why? <span>?</span></button>
            <button onClick={() => { setLevel(3); setMessage('Predictive mode activated. Your keystrokes are being judged.') }}>Predict my next number <span>⌁</span></button>
          </div>
          <button className="worse-button" onClick={makeWorse}>MAKE IT WORSE <span>↗</span></button>
          <p className="fine-print">*confidence is a feeling, not a measurement</p>
        </aside>
      </section>
      <footer className="app-footer">
        <div className="footer-commentary"><span className="quote-mark">“</span><p>ഉത്തരം ശരിയാണ്. കാരണം ഞാൻ പറഞ്ഞത് ശരിയാണ്.</p></div>
        <div className="footer-meta">copyright ഇല്ല. വേണേൽ copy അടിച്ചോ! <span>•</span> Built with questionable math, by <a href='https://instagram.com/_rohan.kishore/'>Rohan Kishore</a> <span>•</span> no useful features found</div>
      </footer>
    </main>
  )
}

export default App
