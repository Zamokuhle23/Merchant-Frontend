import { useState } from 'react'
import { calcLoan } from '../api/agent'

export default function LoanCalculator() {
  const [mode, setMode] = useState('forward')
  const [form, setForm] = useState({ amount: '', daily_payment: '', interest: 20, days: 20 })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleCalc = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    try {
      const { data } = await calcLoan({ mode, ...form })
      setResult(data)
    } catch {
      setError('Invalid input.')
    }
  }

  return (
    <div className="container py-3" style={{ maxWidth: 500 }}>
      <h4 className="mb-4">Loan Calculator</h4>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="btn-group w-100 mb-3">
            <button
              className={`btn ${mode === 'forward' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => { setMode('forward'); setResult(null) }}
            >Amount → Daily</button>
            <button
              className={`btn ${mode === 'reverse' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => { setMode('reverse'); setResult(null) }}
            >Daily → Amount</button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleCalc}>
            {mode === 'forward' ? (
              <div className="mb-3">
                <label className="form-label">Loan Amount (E)</label>
                <input type="number" className="form-control" min="1" step="0.01"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
            ) : (
              <div className="mb-3">
                <label className="form-label">Daily Payment (E)</label>
                <input type="number" className="form-control" min="0.01" step="0.01"
                  value={form.daily_payment} onChange={e => setForm({ ...form, daily_payment: e.target.value })} required />
              </div>
            )}
            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label">Interest (%)</label>
                <select className="form-select" value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}>
                  <option value={20}>20%</option>
                  <option value={25}>25%</option>
                </select>
              </div>
              <div className="col-6 mb-3">
                <label className="form-label">Duration (days)</label>
                <select className="form-select" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })}>
                  <option value={20}>20 days</option>
                  <option value={25}>25 days</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary w-100">Calculate</button>
          </form>

          {result && (
            <div className="alert alert-success mt-3">
              <table className="table table-sm mb-0">
                <tbody>
                  {mode === 'forward' ? (
                    <>
                      <tr><td>Loan Amount</td><td className="fw-bold">E{parseFloat(result.amount).toFixed(2)}</td></tr>
                      <tr><td>Total Due</td><td className="fw-bold">E{result.total_due}</td></tr>
                      <tr><td>Daily Payment</td><td className="fw-bold text-primary">E{result.daily_payment}</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td>Daily Payment</td><td className="fw-bold">E{result.daily_payment}</td></tr>
                      <tr><td>Total Due</td><td className="fw-bold">E{result.total_due}</td></tr>
                      <tr><td>Loan Amount</td><td className="fw-bold text-primary">E{result.amount}</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
