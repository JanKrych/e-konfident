import { useState } from 'react'
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

  /*
  const departmentsLegacy = [
    { id: 'police', name: 'Policja', icon: 'policja.png', color: '#0066FF' },
    { id: 'city-guard', name: 'Straż Miejska', icon: 'strazmiejska.png', color: '#00D4FF' },
    { id: 'border-guard', name: 'Straż Graniczna', icon: 'strazgraniczna.png', color: '#00B8D4' },
    { id: 'kas', name: 'Krajowa Administracja Skarbowa', icon: 'kas.png', color: '#0099CC' },
    { id: 'infotech', name: 'Infotech School', icon: 'infotech.png', color: '#00C4B4' }
  ]
  */

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleReportChange = (e) => {
    setReportData({ ...reportData, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    // Sprawdź czy wymagane pola są wypełnione
    if (!reportData.title || !reportData.description || !reportData.address) {
      alert('Proszę wypełnić wszystkie wymagane pola: Tytuł, Opis i Adres zgłoszenia')
      return
    }
    // Tu będzie logika wysyłania zgłoszenia
    setIsSubmitted(true)
  }

  const isFormValid = reportData.title && reportData.description && reportData.address

  const handleNewReport = () => {
    setIsSubmitted(false)
    setSelectedDepartment(null)
    setIsAnonymous(false)
    setFormData({ name: '', phone: '', email: '' })
    setReportData({ title: '', description: '', address: '', reportedPerson: '' })
  }

  if (isSubmitted) {
    const selectedDept = departments.find(d => d.id === selectedDepartment)

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
                placeholder="Krótki tytuł zgłoszenia"
                required
              />
            </div>
            <div className="glass-input">
              <label htmlFor="description">Opis zgłoszenia <span className="required-tag">*</span></label>
              <textarea
                id="description"
                name="description"
                value={reportData.description}
                onChange={handleReportChange}
                placeholder="Opisz szczegółowo sytuację..."
                rows="5"
                required
              />
            </div>
            <div className="glass-input">
              <label htmlFor="address">Adres zdarzenia <span className="required-tag">*</span></label>
              <input
                type="text"
                id="address"
                name="address"
                value={reportData.address}
                onChange={handleReportChange}
                placeholder="np. ul. Marszałkowska 1, Warszawa"
                required
              />
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
                />
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
                />
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <button
            className={`submit-button ${!isFormValid ? 'disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            <span className="submit-icon">🚀</span>
            <span>Wyślij zgłoszenie</span>
          </button>
        </section>
      </main>
    </div>
  )
}

export default App
