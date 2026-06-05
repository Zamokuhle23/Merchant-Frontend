import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard, approveTransaction, dismissNotification } from '../../api/admin'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  const load = () => getAdminDashboard().then(res => setData(res.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleApprove = async (req, action) => {
    try {
      await approveTransaction(req.id, { action, actual_received_amount: req.requested_amount })
      setAlert({ type: 'success', msg: `Transaction ${action}d.` })
      load()
    } catch {
      setAlert({ type: 'danger', msg: 'Action failed.' })
    }
  }

  const handleDismiss = async (id) => {
    await dismissNotification(id)
    setData(d => ({ ...d, notifications: d.notifications.filter(n => n.id !== id) }))
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  const { stats, loan_settings, pending_requests, notifications } = data

  return (
    <div className="container py-3">
      {alert && <div className={`alert alert-${alert.type} alert-dismissible`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)} /></div>}

      {notifications.map(n => (
        <div key={n.id} className="alert alert-warning alert-dismissible">
          {n.message}
          <button className="btn-close" onClick={() => handleDismiss(n.id)} />
        </div>
      ))}

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Customers', value: stats.total_customers },
          { label: 'Total Loans', value: stats.total_loans },
          { label: 'Active Loans', value: stats.active_loans },
          { label: 'Company Balance', value: `E${parseFloat(stats.company_balance).toFixed(2)}` },
        ].map(s => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small">{s.label}</div>
                <div className="fw-bold fs-5">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loan Settings */}
      {loan_settings && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Loan Settings</h5>
            <div className="row g-2 text-center">
              <div className="col-3"><div className="text-muted small">Interest</div><div className="fw-bold">{loan_settings.interest_percent}%</div></div>
              <div className="col-3"><div className="text-muted small">Duration</div><div className="fw-bold">{loan_settings.duration_days}d</div></div>
              <div className="col-3"><div className="text-muted small">Min Loan</div><div className="fw-bold">E{loan_settings.min_loan_amount}</div></div>
              <div className="col-3"><div className="text-muted small">Max Loan</div><div className="fw-bold">E{loan_settings.max_loan_amount}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Pending requests */}
      {pending_requests.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Pending Requests ({pending_requests.length})</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr><th>Agent</th><th>Type</th><th>Amount</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pending_requests.map(req => (
                    <tr key={req.id}>
                      <td>{req.agent_name}</td>
                      <td><span className="badge bg-secondary">{req.transaction_type}</span></td>
                      <td>E{parseFloat(req.requested_amount).toFixed(2)}</td>
                      <td>
                        <button className="btn btn-success btn-sm me-1" onClick={() => handleApprove(req, 'approve')}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleApprove(req, 'reject')}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="row g-2">
        <div className="col-6 col-md-3"><Link to="/admin/customers" className="btn btn-outline-primary w-100">Customers</Link></div>
        <div className="col-6 col-md-3"><Link to="/admin/agents" className="btn btn-outline-primary w-100">Agents</Link></div>
        <div className="col-6 col-md-3"><Link to="/admin/finance" className="btn btn-outline-primary w-100">Finance</Link></div>
        <div className="col-6 col-md-3"><Link to="/admin/agents/invite" className="btn btn-outline-secondary w-100">Invite Agent</Link></div>
      </div>
    </div>
  )
}
