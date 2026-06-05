import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCustomerHistory } from '../api/agent'

export default function CustomerHistory() {
  const { customerId } = useParams()
  const [searchParams] = useSearchParams()
  const loanId = searchParams.get('loan')
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLoanId, setSelectedLoanId] = useState(loanId || null)

  const load = (lid) => {
    setLoading(true)
    getCustomerHistory(customerId, lid)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(selectedLoanId) }, [customerId, selectedLoanId])

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
  if (!data) return null

  const { customer, loan, loans, history } = data

  return (
    <div className="container py-3" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">{customer.name}</h4>
          <small className="text-muted">{customer.phone}</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>Back</button>
      </div>

      {/* Loan selector */}
      {loans.length > 1 && (
        <div className="mb-3">
          <select
            className="form-select"
            value={selectedLoanId || ''}
            onChange={(e) => setSelectedLoanId(e.target.value || null)}
          >
            <option value="">Latest Loan</option>
            {loans.map(l => (
              <option key={l.id} value={l.id}>
                Loan #{l.id} — E{parseFloat(l.principal_amount).toFixed(2)} ({l.status}) — {l.start_date}
              </option>
            ))}
          </select>
        </div>
      )}

      {loan && (
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="text-muted small">Principal</div>
                <div className="fw-bold">E{parseFloat(loan.principal_amount).toFixed(2)}</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Total Due</div>
                <div className="fw-bold">E{parseFloat(loan.total_due).toFixed(2)}</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Remaining</div>
                <div className="fw-bold text-danger">E{parseFloat(loan.remaining_balance).toFixed(2)}</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Daily</div>
                <div className="fw-bold">E{parseFloat(loan.daily_payment).toFixed(2)}</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Status</div>
                <span className={`badge bg-${loan.status === 'completed' ? 'success' : 'primary'}`}>{loan.status}</span>
              </div>
              <div className="col-4">
                <div className="text-muted small">Days Paid</div>
                <div className="fw-bold">{loan.days_paid}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment history timeline */}
      <div className="card shadow-sm">
        <div className="card-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
          <h6 className="mb-3">Payment History</h6>
          {history.length === 0 ? (
            <p className="text-muted">No history yet.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {history.map((item, i) => (
                <li key={i} className={`list-group-item px-0 py-1 d-flex gap-2 align-items-start border-0`}>
                  <span className={`badge mt-1 ${
                    item.type === 'paid' ? 'bg-success' :
                    item.type === 'missed' ? 'bg-danger' :
                    'bg-primary'
                  }`} style={{ minWidth: 70 }}>
                    {item.type}
                  </span>
                  <div>
                    <div className="small text-muted">{item.date}</div>
                    <div className="small">{item.label}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
