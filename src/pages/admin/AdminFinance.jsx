import { useEffect, useState } from 'react'
import { getAdminFinance, deposit, withdraw } from '../../api/admin'

export default function AdminFinance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [depForm, setDepForm] = useState({ amount: '', note: '' })
  const [witForm, setWitForm] = useState({ amount: '', note: '' })

  const load = () => getAdminFinance().then(res => setData(res.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleDeposit = async (e) => {
    e.preventDefault()
    try {
      await deposit(depForm.amount, depForm.note)
      setAlert({ type: 'success', msg: `Deposited E${depForm.amount}.` })
      setDepForm({ amount: '', note: '' })
      load()
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.error || 'Failed.' })
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    try {
      await withdraw(witForm.amount, witForm.note)
      setAlert({ type: 'success', msg: `Withdrew E${witForm.amount}.` })
      setWitForm({ amount: '', note: '' })
      load()
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.error || 'Failed.' })
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3">
      <h4 className="mb-4">Finance</h4>
      {alert && <div className={`alert alert-${alert.type} alert-dismissible`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)} /></div>}

      <div className="alert alert-primary text-center fs-5">
        Company Balance: <strong>E{parseFloat(data.balance).toFixed(2)}</strong>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-success">Deposit</h5>
              <form onSubmit={handleDeposit}>
                <div className="mb-2">
                  <input type="number" className="form-control" placeholder="Amount" min="0.01" step="0.01"
                    value={depForm.amount} onChange={e => setDepForm({ ...depForm, amount: e.target.value })} required />
                </div>
                <div className="mb-2">
                  <input type="text" className="form-control" placeholder="Note (optional)"
                    value={depForm.note} onChange={e => setDepForm({ ...depForm, note: e.target.value })} />
                </div>
                <button className="btn btn-success w-100">Deposit</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-danger">Withdraw</h5>
              <form onSubmit={handleWithdraw}>
                <div className="mb-2">
                  <input type="number" className="form-control" placeholder="Amount" min="0.01" step="0.01"
                    value={witForm.amount} onChange={e => setWitForm({ ...witForm, amount: e.target.value })} required />
                </div>
                <div className="mb-2">
                  <input type="text" className="form-control" placeholder="Note (optional)"
                    value={witForm.note} onChange={e => setWitForm({ ...witForm, note: e.target.value })} />
                </div>
                <button className="btn btn-danger w-100">Withdraw</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Recent Transactions</h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr><th>Date</th><th>Type</th><th>Amount</th><th>By</th><th>Note</th></tr>
              </thead>
              <tbody>
                {data.transactions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted">No transactions.</td></tr>
                ) : (
                  data.transactions.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${t.transaction_type === 'deposit' ? 'success' : 'danger'}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td>E{parseFloat(t.amount).toFixed(2)}</td>
                      <td>{t.admin_name}</td>
                      <td>{t.note || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
