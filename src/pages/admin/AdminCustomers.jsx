import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminCustomers, adjustCredit, updateCustomer } from '../../api/admin'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    getAdminCustomers().then(res => setCustomers(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const handleBlacklist = async (c) => {
    const updated = await updateCustomer(c.id, { blacklisted: !c.blacklisted })
    setCustomers(cs => cs.map(x => x.id === c.id ? updated.data : x))
    setAlert({ type: 'success', msg: `${c.name} ${!c.blacklisted ? 'blacklisted' : 'unblacklisted'}.` })
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3">
      <h4 className="mb-3">All Customers ({customers.length})</h4>
      {alert && <div className={`alert alert-${alert.type} alert-dismissible`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)} /></div>}

      <input
        type="search"
        className="form-control mb-3"
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm">
          <thead className="table-light">
            <tr>
              <th>Name</th><th>Phone</th><th>Agent</th><th>Credit</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="fw-bold">{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.agent_name}</td>
                <td>{c.credit_score}</td>
                <td>
                  {c.blacklisted
                    ? <span className="badge bg-danger">Blacklisted</span>
                    : c.has_active_loan
                      ? <span className="badge bg-success">Active Loan</span>
                      : <span className="badge bg-secondary">Inactive</span>
                  }
                </td>
                <td>
                  <Link to={`/customers/${c.id}/history`} className="btn btn-outline-primary btn-sm me-1">History</Link>
                  <button
                    className={`btn btn-sm ${c.blacklisted ? 'btn-outline-success' : 'btn-outline-danger'}`}
                    onClick={() => handleBlacklist(c)}
                  >
                    {c.blacklisted ? 'Unblacklist' : 'Blacklist'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
