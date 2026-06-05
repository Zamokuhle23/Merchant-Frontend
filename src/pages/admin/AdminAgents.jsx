import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminAgents, generateInvite } from '../../api/admin'

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteUrl, setInviteUrl] = useState('')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    getAdminAgents().then(res => setAgents(res.data)).finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    try {
      const { data } = await generateInvite()
      setInviteUrl(data.url)
    } catch {
      setAlert({ type: 'danger', msg: 'Failed to generate invite.' })
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Agents ({agents.length})</h4>
        <button className="btn btn-primary btn-sm" onClick={handleGenerate}>Generate Invite Link</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {inviteUrl && (
        <div className="alert alert-info">
          <strong>Invite URL (valid 2 hours):</strong>
          <br />
          <a href={inviteUrl} target="_blank" rel="noopener noreferrer">{inviteUrl}</a>
          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => { navigator.clipboard.writeText(inviteUrl) }}>
            Copy
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr><th>Username</th><th>Email</th><th>Cash in Hand</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id}>
                <td className="fw-bold">{a.username}</td>
                <td>{a.email}</td>
                <td>E{parseFloat(a.amount_in_hand).toFixed(2)}</td>
                <td>
                  <span className={`badge bg-${a.is_active ? 'success' : 'danger'}`}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/agents/${a.id}`} className="btn btn-outline-primary btn-sm me-1">View</Link>
                  <Link to={`/admin/agents/${a.id}/give-money`} className="btn btn-outline-success btn-sm">Give Money</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
