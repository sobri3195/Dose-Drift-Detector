import { useState } from 'react'

const defaultPayload = {
  patient_id: 'RT-HN-001',
  fraction_site: 'H&N',
  daily_metrics: [
    { day: 1, target_volume_change_pct: 1.5, setup_error_mm: 1.8, weight_loss_pct: 0.2 },
    { day: 2, target_volume_change_pct: 2.3, setup_error_mm: 2.1, weight_loss_pct: 0.5 },
    { day: 3, target_volume_change_pct: 3.2, setup_error_mm: 2.6, weight_loss_pct: 0.8 }
  ]
}

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('home')

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultPayload)
      })

      if (!response.ok) {
        throw new Error('Gagal memproses data dose drift')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Dose-Drift Detector</h1>
        <p className="subtitle">
          Deteksi pergeseran dosis harian berbasis AI pada CBCT untuk trigger adaptive replanning.
        </p>
      </header>

      <section className={`panel ${activeTab === 'home' ? 'active' : ''}`} id="home">
        <h2>Ringkasan</h2>
        <p className="panel-text">
          Gunakan modul ini untuk memantau perubahan anatomi dan setup error harian sebelum
          memutuskan adaptive replanning.
        </p>
      </section>

      <section className={`panel ${activeTab === 'analysis' ? 'active' : ''}`} id="analysis">
        <h2>Analisis</h2>
        <button onClick={runAnalysis} disabled={loading}>
          {loading ? 'Menganalisis...' : 'Jalankan Analisis AI'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className={`panel ${activeTab === 'results' ? 'active' : ''}`} id="results">
        <h2>Hasil</h2>
        {result ? (
          <section className="card">
            <h3>Hasil Prediksi ({result.patient_id})</h3>
            <ul>
              <li>Estimasi penurunan D95 target: {result.estimated_d95_drop_pct}%</li>
              <li>Estimasi risiko overdosis OAR: {result.estimated_oar_overdose_risk_pct}%</li>
              <li>
                Trigger replanning:{' '}
                <strong>{result.trigger_replanning ? 'YA (perlu evaluasi cepat)' : 'TIDAK'}</strong>
              </li>
            </ul>
            <p>{result.summary}</p>
          </section>
        ) : (
          <p className="panel-text">Belum ada hasil. Jalankan analisis terlebih dahulu.</p>
        )}
      </section>

      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <button
          className={activeTab === 'home' ? 'is-active' : ''}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button
          className={activeTab === 'analysis' ? 'is-active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          Analisis
        </button>
        <button
          className={activeTab === 'results' ? 'is-active' : ''}
          onClick={() => setActiveTab('results')}
        >
          Hasil
        </button>
      </nav>
    </main>
  )
}
