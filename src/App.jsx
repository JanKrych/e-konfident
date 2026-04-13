import { useEffect, useState } from 'react'
import policjaImg from './assets/policja.png'
import strazMiejskaImg from './assets/strazmiejska.png'
import strazGranicznaImg from './assets/strazgraniczna.png'
import kasImg from './assets/kas.png'
import infotechImg from './assets/infotech.png'
import './App.css'

function App() {
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  // LIMIT DNIA (5 donosów, donejt ≥10 zł dodaje +5)
  const DAILY_LIMIT = 5
  const STORAGE_KEY = 'ek_limit_v1'
  const STATS_KEY = 'ek_stats_v1'
  const [limitState, setLimitState] = useState({ reportsMade: 0, bonusRemaining: 0, lastReportAt: null })
  const [stats, setStats] = useState({ total: 0, byDept: {} })
  const [nowTs, setNowTs] = useState(Date.now())

  const loadData = () => {
    try {
      // Limit
      const rawLimit = localStorage.getItem(STORAGE_KEY)
      if (rawLimit) {
        const parsed = JSON.parse(rawLimit)
        setLimitState({
          reportsMade: Number(parsed.reportsMade) || 0,
          bonusRemaining: Number(parsed.bonusRemaining) || 0,
          lastReportAt: parsed.lastReportAt ? Number(parsed.lastReportAt) : null
        })
      }

      // Statystyki
      const rawStats = localStorage.getItem(STATS_KEY)
      if (rawStats) {
        setStats(JSON.parse(rawStats))
      }
    } catch (_) {
      // ignore
    }
  }

  const saveLimit = (state) => {
    const toSave = {
      reportsMade: state.reportsMade,
      bonusRemaining: state.bonusRemaining,
      lastReportAt: state.lastReportAt
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }

  const saveStats = (newStats) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats))
    setStats(newStats)
  }

  const resetIfExpired = (ts = nowTs) => {
    if (!limitState.lastReportAt) return
    const expiresAt = limitState.lastReportAt + 24 * 60 * 60 * 1000
    if (ts >= expiresAt) {
      const reset = { reportsMade: 0, bonusRemaining: 0, lastReportAt: null }
      setLimitState(reset)
      saveLimit(reset)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    resetIfExpired(nowTs)
  }, [nowTs])

  const totalAllowed = DAILY_LIMIT + (limitState.bonusRemaining || 0)
  const remaining = Math.max(0, totalAllowed - (limitState.reportsMade || 0))
  const expiresInMs = limitState.lastReportAt ? (limitState.lastReportAt + 24 * 60 * 60 * 1000 - nowTs) : 0

  const formatDuration = (ms) => {
    if (ms <= 0) return '00:00:00'
    const totalSec = Math.floor(ms / 1000)
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    address: '',
    reportedPerson: ''
  })

  // NOWOŚĆ: Stan przechowujący błędy walidacji
  const [errors, setErrors] = useState({})

  const departments = [
    { id: 'police', name: 'Policja', icon: policjaImg, color: '#0066FF' },
    { id: 'city-guard', name: 'Straż Miejska', icon: strazMiejskaImg, color: '#00D4FF' },
    { id: 'border-guard', name: 'Straż Graniczna', icon: strazGranicznaImg, color: '#00B8D4' },
    { id: 'kas', name: 'Krajowa Administracja Skarbowa', icon: kasImg, color: '#0099CC' },
    { id: 'infotech', name: 'Infotech School', icon: infotechImg, color: '#00C4B4' }
  ]

  const departmentThemes = {
    police: { color: '#1E5BFF', rgb: '30, 91, 255' },
    'city-guard': { color: '#F2C200', rgb: '242, 194, 0' },
    'border-guard': { color: '#6B7F2A', rgb: '107, 127, 42' },
    kas: { color: '#003A79', rgb: '0, 58, 121' },
    infotech: { color: '#D52B2B', rgb: '213, 43, 43' }
  }

  const defaultTheme = { color: '#00D4FF', rgb: '0, 212, 255' }

  const getThemeVars = (deptId) => {
    const theme = deptId ? departmentThemes[deptId] : null
    const activeTheme = theme ?? defaultTheme
    return {
      '--theme-color': activeTheme.color,
      '--theme-rgb': activeTheme.rgb
    }
  }

  const getDeptVars = (deptId) => {
    const theme = departmentThemes[deptId] ?? defaultTheme
    return {
      '--dept-color': theme.color,
      '--dept-rgb': theme.rgb
    }
  }

  // NOWOŚĆ: Funkcja sprawdzająca poprawność pól
  const validateField = (name, value) => {
    let errorMsg = ''

    if (name === 'title' && value.length > 0 && value.length < 5) {
      errorMsg = 'Tytuł musi mieć co najmniej 5 znaków'
    }
    if (name === 'description' && value.length > 0 && value.length < 20) {
      errorMsg = 'Prosimy o dokładniejszy opis (min. 20 znaków)'
    }
    if (name === 'email' && value.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errorMsg = 'Podaj poprawny adres e-mail'
      }
    }
    if (name === 'phone' && value.length > 0) {
      const phoneRegex = /^[0-9+\-\s()]{9,}$/
      if (!phoneRegex.test(value)) {
        errorMsg = 'Podaj poprawny numer telefonu'
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
  }

  const handleReportChange = (e) => {
    const { name, value } = e.target
    setReportData({ ...reportData, [name]: value })
    validateField(name, value)
  }

  // Funkcja sprawdzająca czy pole zostało opuszczone puste (wymagane pola)
  const handleBlur = (e) => {
    const { name, value, required } = e.target
    if (required && !value.trim()) {
      setErrors(prev => ({ ...prev, [name]: 'To pole jest wymagane' }))
    }
  }

  const handleSubmit = () => {
    if (!selectedDepartment) {
      alert('Proszę wybrać departament przed wysłaniem zgłoszenia')
      return
    }

    if (!reportData.title || !reportData.description || !reportData.address) {
      alert('Proszę wypełnić wszystkie wymagane pola: Tytuł, Opis i Adres zgłoszenia')
      return
    }

    // Limit dzienny
    resetIfExpired(Date.now())
    const currentTotal = DAILY_LIMIT + (limitState.bonusRemaining || 0)
    const currentRemaining = Math.max(0, currentTotal - (limitState.reportsMade || 0))
    if (currentRemaining <= 0) {
      alert(`Limit donosów wyczerpany. Odczekaj: ${formatDuration(expiresInMs)} lub wpłać min. 10 zł, aby odblokować +5.`)
      return
    }

    const nextLimit = {
      reportsMade: (limitState.reportsMade || 0) + 1,
      bonusRemaining: limitState.bonusRemaining || 0,
      lastReportAt: Date.now()
    }
    setLimitState(nextLimit)
    saveLimit(nextLimit)

    // Aktualizacja statystyk
    const nextStats = {
      total: (stats.total || 0) + 1,
      byDept: {
        ...stats.byDept,
        [selectedDepartment]: (stats.byDept[selectedDepartment] || 0) + 1
      }
    }
    saveStats(nextStats)

    setIsSubmitted(true)
  }

  // Sprawdzamy, czy wszystkie wymagane pola są wypełnione ORAZ czy nie ma żadnych błędów
  const hasErrors = Object.values(errors).some(error => error !== '')
  const isFormValid = reportData.title && reportData.description && reportData.address && !hasErrors
  const canSubmit = isFormValid && remaining > 0

  const BADGE_LEVELS = [
    { name: 'Brąz', threshold: 5, icon: '🥉' },
    { name: 'Srebro', threshold: 10, icon: '🥈' },
    { name: 'Złoto', threshold: 25, icon: '🥇' },
    { name: 'Diament', threshold: 50, icon: '💎' },
    { name: 'Szmaragd', threshold: 100, icon: '✨' }
  ]

  const getBadgeForCount = (count) => {
    let best = null
    for (const lvl of BADGE_LEVELS) {
      if (count >= lvl.threshold) best = lvl
    }
    return best
  }

  const handleApplyForCard = () => {
    alert("Wniosek o Kartę Złotego Konfidenta został przyjęty! Twoja lojalność zostanie nagrodzona pocztą (pod warunkiem, że podałeś prawdziwy adres w jednym ze zgłoszeń).")
  }

  const handleNewReport = () => {
    setIsSubmitted(false)
    setReportData({
      title: '',
      description: '',
      address: '',
      reportedPerson: ''
    })
    setFormData({
      name: '',
      phone: '',
      email: ''
    })
    setSelectedDepartment(null)
    setErrors({})
  }

  const handleDonate = () => {
    const amount = showCustom ? Number(customAmount) : Number(selectedAmount)
    if (!amount || amount <= 0 || !selectedPayment) return
    if (amount < 10) {
      alert('Minimalna kwota, aby odblokować +5 donosów, to 10 zł.')
      return
    }
    // Dodaj +5 w bieżącym oknie 24h (reset wspólny z lastReportAt)
    const next = {
      reportsMade: limitState.reportsMade || 0,
      bonusRemaining: (limitState.bonusRemaining || 0) + 5,
      lastReportAt: limitState.lastReportAt || Date.now()
    }
    setLimitState(next)
    saveLimit(next)
    alert('Dziękujemy za wsparcie! Dodano +5 dodatkowych donosów na bieżące 24h.')
  }

  if (isSubmitted) {
    const selectedDept = departments.find(d => d.id === selectedDepartment)

    // ... Reszta ekranu sukcesu pozostaje bez zmian ...
    return (
        <div className="app-container" style={getThemeVars(selectedDepartment)}>
          <header className="app-header">
            <div className="logo-container">
              <div className="logo-icon">🔒</div>
              <h1 className="app-title">e-Konfident</h1>
            </div>
          </header>

          <main className="app-main">
            <div className="success-screen">
              <div className="success-icon">✅</div>
              <h2 className="success-title">Dziękujemy za zgłoszenie!</h2>
              <p className="success-message">
                Twoje zgłoszenie zostało pomyślnie przesłane. Zostanie ono rozpatrzone przez odpowiedni departament.
              </p>

              <div className="report-summary">
                <h3 className="summary-title">Podsumowanie zgłoszenia:</h3>

                {selectedDept && (
                    <div className="summary-item">
                      <span className="summary-label">Departament:</span>
                      <span className="summary-value summary-dept">
                    <img className="summary-icon" src={selectedDept.icon} alt={selectedDept.name} />
                        {selectedDept.name}
                  </span>
                    </div>
                )}

                <div className="summary-item">
                  <span className="summary-label">Tytuł:</span>
                  <span className="summary-value">{reportData.title}</span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Opis:</span>
                  <span className="summary-value">{reportData.description}</span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Adres:</span>
                  <span className="summary-value">{reportData.address}</span>
                </div>

                {reportData.reportedPerson && (
                    <div className="summary-item">
                      <span className="summary-label">Zgłaszana osoba:</span>
                      <span className="summary-value">{reportData.reportedPerson}</span>
                    </div>
                )}

                <div className="summary-item">
                  <span className="summary-label">Typ zgłoszenia:</span>
                  <span className="summary-value">{isAnonymous ? '🕵️ Anonimowe' : '👤 Z danymi kontaktowymi'}</span>
                </div>

                {!isAnonymous && (formData.name || formData.phone || formData.email) && (
                    <div className="contact-summary">
                      <div className="summary-label">Dane kontaktowe:</div>
                      {formData.name && <div className="summary-value">📝 {formData.name}</div>}
                      {formData.phone && <div className="summary-value">📞 {formData.phone}</div>}
                      {formData.email && <div className="summary-value">📧 {formData.email}</div>}
                    </div>
                )}
              </div>

              <button className="submit-button return-button" onClick={handleNewReport}>
                🔄 Nowe zgłoszenie
              </button>
            </div>
          </main>
        </div>
    )
  }

  return (
      <div className="app-container" style={getThemeVars(selectedDepartment)}>
        <header className="app-header">
          <div className="logo-container">
            <div className="logo-icon">🔒</div>
            <h1 className="app-title">e-Konfident</h1>
          </div>
        </header>

        <main className="app-main">
          {/* SEKCJA PROFILU I ODZNAK */}
          <section className="section stats-section">
            <h2 className="section-title">Twoje Osiągnięcia</h2>
            <div className="stats-container">
              <div className="total-stats-card">
                <div className="total-count">{stats.total || 0}</div>
                <div className="total-label">Łącznie donosów</div>
                {stats.total >= 1000 && <div className="master-badge">👑 MASTER 👑</div>}
                {stats.total >= 100 && (
                    <button className="gold-card-btn" onClick={handleApplyForCard}>
                      💳 Wniosek o Kartę Złotego Konfidenta
                    </button>
                )}
              </div>

              <div className="badges-grid">
                {departments.map(dept => {
                  const count = stats.byDept[dept.id] || 0
                  const badge = getBadgeForCount(count)
                  if (!badge) return null
                  return (
                      <div key={dept.id} className="badge-item" style={{ '--dept-color': departmentThemes[dept.id]?.color }}>
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <div className="badge-level">{badge.name}</div>
                          <div className="badge-dept">{dept.name}</div>
                          <div className="badge-count">{count} donosów</div>
                        </div>
                      </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Wybierz Departament</h2>
            <div className="department-grid">
              {departments.map((dept) => (
                  <button
                      key={dept.id}
                      className={`department-card ${selectedDepartment === dept.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDepartment(dept.id)}
                      style={getDeptVars(dept.id)}
                  >
                    <div className="department-icon">
                      <img className="department-icon-img" src={dept.icon} alt={dept.name} />
                    </div>
                    <span className="department-name">{dept.name}</span>
                  </button>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Szczegóły Zgłoszenia</h2>
            <div className="input-group">
              <div className="glass-input">
                <label htmlFor="title">Tytuł zgłoszenia <span className="required-tag">*</span></label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={reportData.title}
                    onChange={handleReportChange}
                    onBlur={handleBlur}
                    placeholder="Krótki tytuł zgłoszenia"
                    className={errors.title ? 'input-error' : ''}
                    required
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="glass-input">
                <label htmlFor="description">Opis zgłoszenia <span className="required-tag">*</span></label>
                <textarea
                    id="description"
                    name="description"
                    value={reportData.description}
                    onChange={handleReportChange}
                    onBlur={handleBlur}
                    placeholder="Opisz szczegółowo sytuację..."
                    rows="5"
                    className={errors.description ? 'input-error' : ''}
                    required
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="glass-input">
                <label htmlFor="address">Adres zdarzenia <span className="required-tag">*</span></label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={reportData.address}
                    onChange={handleReportChange}
                    onBlur={handleBlur}
                    placeholder="np. ul. Marszałkowska 1, Warszawa"
                    className={errors.address ? 'input-error' : ''}
                    required
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="glass-input">
                <label htmlFor="reportedPerson">Kogo zgłaszasz <span className="optional-tag">(opcjonalnie)</span></label>
                <input
                    type="text"
                    id="reportedPerson"
                    name="reportedPerson"
                    value={reportData.reportedPerson}
                    onChange={handleReportChange}
                    placeholder="Dane osoby zgłaszanej (jeśli znane)"
                />
              </div>
            </div>
          </section>

          <section className="section">
            <div className="anonymity-container">
              <div className="anonymity-label">
                <span className="label-text">Zgłoś anonimowo</span>
                <span className="label-subtitle">Twoja tożsamość pozostanie prywatna</span>
              </div>
              <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </section>

          {!isAnonymous && (
              <section className="section contact-section">
                <h2 className="section-title">Dane Kontaktowe <span className="optional-tag">(opcjonalnie)</span></h2>
                <div className="input-group">
                  <div className="glass-input">
                    <label htmlFor="name">Imię i nazwisko</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Wprowadź imię i nazwisko"
                    />
                  </div>
                  <div className="glass-input">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+48 000 000 000"
                        className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                  <div className="glass-input">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="twoj.email@przyklad.pl"
                        className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                </div>
              </section>
          )}

          <section className="section">
            <div className="limit-status">
              <div className="limit-row">
                <span className="limit-badge">Pozostało: {remaining} / {totalAllowed}</span>
                {remaining === 0 && (
                  <span className="limit-timer">Następny reset za: {formatDuration(expiresInMs)}</span>
                )}
              </div>
              {remaining === 0 && (
                <div className="limit-warning">Osiągnięto limit 5 donosów. Wpłać min. 10 zł, aby natychmiast odblokować +5 w tym oknie.</div>
              )}
            </div>
            <button
                className={`submit-button ${!canSubmit ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!canSubmit}
            >
              <span className="submit-icon">🚀</span>
              <span>Wyślij zgłoszenie</span>
            </button>
          </section>

          <section className="section donation-section">
            <h2 className="section-title">Wesprzyj e-Konfident 💙</h2>
            <div className="donation-card">
              <p className="donation-subtitle">Pomóż nam utrzymać platformę bezpieczną i bezpłatną dla wszystkich</p>

              <div className="donation-amounts">
                {[5, 10, 20, 50].map(amt => (
                    <button
                        key={amt}
                        className={`amount-btn ${selectedAmount === amt && !showCustom ? 'selected' : ''}`}
                        onClick={() => { setSelectedAmount(amt); setShowCustom(false); setCustomAmount(''); }}
                    >
                      {amt} zł
                    </button>
                ))}
                <button
                    className={`amount-btn ${showCustom ? 'selected' : ''}`}
                    onClick={() => { setShowCustom(true); setSelectedAmount(null); }}
                >
                  Inna kwota
                </button>
              </div>

              {showCustom && (
                  <div className="custom-amount-wrap">
                    <input
                        type="number"
                        className="custom-amount-input"
                        placeholder="Wpisz kwotę w zł"
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        min="1"
                    />
                  </div>
              )}

              <div className="payment-methods-grid">
                <button
                    className={`payment-method-btn apple-pay-btn ${selectedPayment === 'apple' ? 'payment-selected' : ''}`}
                    onClick={() => setSelectedPayment('apple')}
                >
                  <svg width="18" height="22" viewBox="0 0 814 1000" fill="currentColor">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-52.4-72.9-98.4-191.6-98.4-303.2 0-153.8 100.7-235.2 199.6-235.2 79.2 0 144.7 53.9 195.2 53.9 47.8 0 122.6-55.9 209.3-55.9zM545.2 30.8C572.2 3.4 591.8-21.8 591.8-48c0-4.5-.6-9-1.3-13.5-51.4 1.9-112.3 34.3-149.2 76.4-33.1 37.3-59.5 81.6-59.5 126.3 0 4.5.6 9 1.3 13.5 4.5.6 9.7 1.3 14.9 1.3 47.1 0 100.7-30.9 147.2-74.2z"/>
                  </svg>
                  <span>Apple Pay</span>
                </button>

                <button
                    className={`payment-method-btn google-pay-btn ${selectedPayment === 'google' ? 'payment-selected' : ''}`}
                    onClick={() => setSelectedPayment('google')}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google Pay</span>
                </button>

                <button
                    className={`payment-method-btn paypal-btn ${selectedPayment === 'paypal' ? 'payment-selected' : ''}`}
                    onClick={() => setSelectedPayment('paypal')}
                >
                  <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
                    <path d="M19.5 7C19.5 11.7 16.2 14 12 14H9L7.5 22H4.5L7 6H14C17 6 19.5 6.3 19.5 7z" fill="#009CDE"/>
                    <path d="M20.5 5C20.5 9.7 17.2 12 13 12H10L8.5 20H5.5L8 4H15C18 4 20.5 4.3 20.5 5z" fill="#003087"/>
                  </svg>
                  <span>PayPal</span>
                </button>

                <button
                    className={`payment-method-btn card-btn ${selectedPayment === 'card' ? 'payment-selected' : ''}`}
                    onClick={() => setSelectedPayment('card')}
                >
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="24" height="18" rx="3"/>
                    <line x1="1" y1="7" x2="25" y2="7"/>
                    <line x1="5" y1="13" x2="9" y2="13"/>
                    <line x1="13" y1="13" x2="16" y2="13"/>
                    <circle cx="20" cy="13" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  <span>Karta kredytowa</span>
                </button>

                <button
                    className={`payment-method-btn blik-btn ${selectedPayment === 'blik' ? 'payment-selected' : ''}`}
                    onClick={() => setSelectedPayment('blik')}
                >
                  <span className="blik-logo">BLIK</span>
                  <span>Kod 6-cyfrowy</span>
                </button>
              </div>

              <button
                  className={`donate-btn ${(selectedAmount || (showCustom && customAmount)) && selectedPayment ? '' : 'disabled'}`}
                  disabled={!(selectedAmount || (showCustom && customAmount)) || !selectedPayment}
                  onClick={handleDonate}
              >
                <span>Wpłać darowiznę</span>
                {(selectedAmount || (showCustom && customAmount)) && (
                    <span className="donate-amount-badge">
                      {selectedAmount || customAmount} zł
                    </span>
                )}
              </button>
            </div>
          </section>
        </main>
      </div>
  )
}

export default App