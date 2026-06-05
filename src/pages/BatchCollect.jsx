import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBatchCollect, submitBatchPayment } from '../api/agent'
import { useAuth } from '../context/AuthContext'

const STORE_KEY = (agentId) => `mf_collect_${agentId}_${new Date().toISOString().slice(0, 10)}`

function badge(loan) {
  if (loan.days_remaining <= 0) return '<span class="badge bg-danger">Overdue</span>'
  if (loan.days_remaining <= 5) return `<span class="badge bg-warning text-dark">${loan.days_remaining}d left</span>`
  return `<span class="badge bg-secondary">${loan.days_remaining}d left</span>`
}

export default function BatchCollect() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const storeKey = STORE_KEY(user?.agent_id)

  const [allLoans, setAllLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selOrder, setSelOrder] = useState([])
  const [amounts, setAmounts] = useState({})
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    getBatchCollect().then(res => {
      const loans = res.data
      setAllLoans(loans)
      const defaultAmts = {}
      loans.forEach(l => { defaultAmts[l.id] = l.daily_payment })
      setAmounts(defaultAmts)
      try {
        const saved = JSON.parse(localStorage.getItem(storeKey))
        if (saved?.selOrder?.length) {
          const validIds = new Set(loans.map(l => l.id))
          const sel = saved.selOrder.filter(id => validIds.has(id))
          setSelOrder(sel)
          setAmounts(a => ({ ...a, ...saved.amounts }))
          setRestored(true)
        }
      } catch {}
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify({ selOrder, amounts }))
  }, [selOrder, amounts])

  const isSelected = (id) => selOrder.includes(id)

  const selectLoan = (id) => {
    if (!isSelected(id)) setSelOrder(prev => [...prev, id])
  }

  const deselectLoan = (id) => {
    setSelOrder(prev => prev.filter(x => x !== id))
  }

  const toggleLoan = (id) => {
    isSelected(id) ? deselectLoan(id) : selectLoan(id)
  }

  const getTotal = () =>
    selOrder.reduce((s, id) => {
      const v = parseFloat(amounts[id])
      return s + (isNaN(v) ? 0 : v)
    }, 0)

  const handleAmountChange = (id, val) => {
    setAmounts(a => ({ ...a, [id]: val }))
  }

  const handleAmountBlur = (id, val) => {
    const v = parseFloat(val)
    if (!isNaN(v) && v > 0 && !isSelected(id)) selectLoan(id)
  }

  const matches = (l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.customer_name.toLowerCase().includes(q) || l.customer_phone.includes(q)
  }

  const selLoans = selOrder.map(id => allLoans.find(l => l.id === id)).filter(Boolean).filter(matches)
  const remLoans = allLoans.filter(l => !isSelected(l.id)).filter(matches)

  const handleSubmit = async () => {
    if (!selOrder.length) return
    const bad = selOrder.find(id => { const v = parseFloat(amounts[id]); return isNaN(v) || v <= 0 })
    if (bad) { setResult({ type: 'danger', msg: 'One or more amounts are invalid.' }); return }

    setSubmitting(true)
    try {
      const payload = selOrder.map(id => ({ loan_id: id, amount: parseFloat(amounts[id]).toFixed(2) }))
      const { data } = await submitBatchPayment(payload)
      const ok = data.results.filter(r => r.status === 'ok')
      const skipped = data.results.filter(r => r.status === 'skipped')
      const errors = data.results.filter(r => r.status === 'error')
      const okIds = new Set(ok.map(r => r.loan_id))
      setSelOrder(prev => prev.filter(id => !okIds.has(id)))
      let msg = ''
      if (ok.length) msg += `${ok.length} payment(s) recorded — ${data.total_amount} SZL. `
      if (skipped.length) msg += `${skipped.length} skipped (cooldown). `
      if (errors.length) msg += `${errors.length} failed.`
      setResult({ type: ok.length ? 'success' : 'warning', msg })
      if (selOrder.filter(id => !okIds.has(id)).length === 0) {
        setTimeout(() => navigate('/dashboard'), 1800)
      }
    } catch {
      setResult({ type: 'danger', msg: 'Network error. Selections saved locally.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3" style={{ paddingBottom: 90 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Batch Collection</h4>
          <small className="text-muted">{new Date().toDateString()}</small>
        </div>
      </div>

      {restored && (
        <div className="alert alert-info alert-dismissible">
          Previous selections restored.
          <button className="btn-close" onClick={() => setRestored(false)} />
        </div>
      )}

      {result && (
        <div className={`alert alert-${result.type} alert-dismissible`}>
          {result.msg}
          <button className="btn-close" onClick={() => setResult(null)} />
        </div>
      )}

      {allLoans.length === 0 ? (
        <div className="text-center py-5 text-muted">No loans due today.</div>
      ) : (
        <>
          <div className="mb-3">
            <input
              type="search"
              className="form-control"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {selLoans.length > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold text-success">Selected — {selLoans.length} loan(s)</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelOrder([])}>Deselect All</button>
              </div>
              {selLoans.map(loan => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  selected
                  amount={amounts[loan.id] ?? loan.daily_payment}
                  onToggle={() => deselectLoan(loan.id)}
                  onAmountChange={(v) => handleAmountChange(loan.id, v)}
                  onAmountBlur={(v) => handleAmountBlur(loan.id, v)}
                />
              ))}
            </div>
          )}

          {remLoans.length > 0 && (
            <div>
              <h6 className="mb-2 fw-bold text-muted">Due Today — {remLoans.length} loan(s)</h6>
              {remLoans.map(loan => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  selected={false}
                  amount={amounts[loan.id] ?? loan.daily_payment}
                  onToggle={() => selectLoan(loan.id)}
                  onAmountChange={(v) => handleAmountChange(loan.id, v)}
                  onAmountBlur={(v) => handleAmountBlur(loan.id, v)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selOrder.length > 0 && (
        <div className="fixed-bottom bg-white border-top shadow-sm px-3 py-2">
          <div className="container d-flex justify-content-between align-items-center">
            <div>
              <strong>{selOrder.length} payment{selOrder.length !== 1 ? 's' : ''}</strong>
              <div className="text-muted small">Total: {getTotal().toFixed(2)} SZL</div>
            </div>
            <button className="btn btn-success btn-lg px-4" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit All'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function LoanCard({ loan, selected, amount, onToggle, onAmountChange, onAmountBlur }) {
  const daysRemaining = loan.days_remaining
  const badgeCls = daysRemaining <= 0 ? 'bg-danger' : daysRemaining <= 5 ? 'bg-warning text-dark' : 'bg-secondary'
  const badgeText = daysRemaining <= 0 ? 'Overdue' : `${daysRemaining}d left`

  return (
    <div className={`card mb-2 border ${selected ? 'border-success' : 'border-light'}`}>
      <div className="card-body py-2 px-3">
        <div className="d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            <input
              className="form-check-input loan-chk"
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              style={{ width: 22, height: 22, cursor: 'pointer' }}
            />
          </div>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="fw-bold">{loan.customer_name}</div>
            <div className="text-muted small">
              {loan.customer_phone} &nbsp;
              <span className={`badge ${badgeCls}`}>{badgeText}</span>
            </div>
          </div>
          <div className="flex-shrink-0" style={{ width: 96 }}>
            <input
              type="number"
              className="form-control form-control-sm text-center"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              onBlur={(e) => onAmountBlur(e.target.value)}
            />
            <div className="text-muted text-center" style={{ fontSize: '0.68rem' }}>SZL</div>
          </div>
        </div>
      </div>
    </div>
  )
}
