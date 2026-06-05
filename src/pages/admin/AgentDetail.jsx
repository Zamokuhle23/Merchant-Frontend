import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAgentDetail, giveAgentMoney, getAgentTransactions, getAgentPerformance } from '../../api/admin'

export default function AgentDetail() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [giveAmount, setGiveAmount] = useState('')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    Promise.all([
      getAgentDetail(agentId),
      getAgentTransactions(agentId),
      getAgentPerformance(agentId, 'month'),
    ]).then(([det, trans, perf]) => {
      setData(det.data)
      setTransactions(trans.data)
      setPerformance(perf.data)
    }).finally(() => setLoading(false))
  }, [agentId])

  const handleGiveMoney = async () => {
    if (!giveAmount) return
    try {
      await giveAgentMoney(agentId, giveAmount)
      setAlert({ type: 'success', msg: `E${giveAmount} given to agent.` })
      setGiveAmount('')
      const res = await getAgentDetail(agentId)
      setData(res.data)
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.error || 'Failed.' })
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
  if (!data) return null

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{data.agent.username}</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>Back</button>
      </div>

      {alert && <div className={`alert alert-${alert.type} alert-dismissible`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)} /></div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><div className="card text-center border-0 shadow-sm"><div className="card-body"><div className="text-muted small">Cash in Hand</div><div className="fw-bold">E{parseFloat(data.agent.amount_in_hand).toFixed(2)}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-center border-0 shadow-sm"><div className="card-body"><div className="text-muted small">Total Customers</div><div className="fw-bold">{data.stats.total_customers}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-center border-0 shadow-sm"><div className="card-body"><div className="text-muted small">Active Loans</div><div className="fw-bold">{data.stats.active_loans_count}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-center border-0 shadow-sm"><div className="card-body"><div className="text-muted small">Total Loans</div><div className="fw-bold">{data.stats.total_loans}</div></div></div></div>
      </div>

      {/* Give money */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Give Money to Agent</h5>
          <div className="input-group">
            <input type="number" className="form-control" placeholder="Amount (E)" min="0.01" step="0.01"
              value={giveAmount} onChange={e => setGiveAmount(e.target.value)} />
            <button className="btn btn-success" onClick={handleGiveMoney}>Give</button>
          </div>
        </div>
      </div>

      {/* Active loans */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Active Loans ({data.active_loans.length})</h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light"><tr><th>Customer</th><th>Amount</th><th>Daily</th><th>Remaining</th><th>Status</th></tr></thead>
              <tbody>
                {data.active_loans.length === 0
                  ? <tr><td colSpan={5} className="text-center text-muted">No active loans.</td></tr>
                  : data.active_loans.map(l => (
                    <tr key={l.id}>
                      <td>{l.customer_name}</td>
                      <td>E{parseFloat(l.principal_amount).toFixed(2)}</td>
                      <td>E{parseFloat(l.daily_payment).toFixed(2)}</td>
                      <td>E{parseFloat(l.remaining_balance).toFixed(2)}</td>
                      <td><span className={`badge bg-${l.payment_status_color === 'green' ? 'success' : l.payment_status_color === 'yellow' ? 'warning text-dark' : 'danger'}`}>{l.payment_status_color}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance */}
      {performance.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Performance (Last 30 days)</h5>
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light"><tr><th>Date</th><th>Collected</th><th>Due</th><th>%</th></tr></thead>
                <tbody>
                  {performance.map(p => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.loans_collected}</td>
                      <td>{p.total_due_loans}</td>
                      <td><span className={`badge bg-${p.collection_percentage >= 80 ? 'success' : p.collection_percentage >= 50 ? 'warning text-dark' : 'danger'}`}>{p.collection_percentage}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction log */}
      {transactions.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Transaction History</h5>
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light"><tr><th>Date</th><th>Type</th><th>Amount</th><th>Approved By</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.approved_at).toLocaleDateString()}</td>
                      <td><span className="badge bg-secondary">{t.transaction_type}</span></td>
                      <td>E{parseFloat(t.actual_amount).toFixed(2)}</td>
                      <td>{t.approved_by_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
