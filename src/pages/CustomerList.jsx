import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers } from '../api/agent'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCustomers().then(res => setCustomers(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Customers ({customers.length})</h4>
        <div className="d-flex gap-2">
          <Link to="/customers/new" className="btn btn-primary btn-sm">+ New Customer</Link>
          <Link to="/customers/add-loan" className="btn btn-outline-secondary btn-sm">Add Loan</Link>
        </div>
      </div>

      <input
        type="search"
        className="form-control mb-3"
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>National ID</th>
              <th>Credit</th>
              <th>Loans</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted">No customers found.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td className="fw-bold">{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.national_id}</td>
                  <td>{c.credit_score}</td>
                  <td>{c.total_loans ?? '—'}</td>
                  <td>
                    {c.blacklisted
                      ? <span className="badge bg-danger">Blacklisted</span>
                      : c.has_active_loan
                        ? <span className="badge bg-success">Active Loan</span>
                        : <span className="badge bg-secondary">No Active Loan</span>
                    }
                  </td>
                  <td>
                    <Link to={`/customers/${c.id}/history`} className="btn btn-outline-primary btn-sm me-1">History</Link>
                    {!c.blacklisted && !c.has_active_loan && (
                      <Link to={`/customers/${c.id}/qualification`} className="btn btn-outline-success btn-sm">New Loan</Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
