import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCustomer } from '../api/agent'

export default function CreateCustomerLoan() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', national_id: '', location: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await createCustomer(form)
      navigate(`/customers/${data.id}/qualification`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create customer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-3" style={{ maxWidth: 600 }}>
      <h4 className="mb-4">New Customer</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full Name', required: true },
              { key: 'phone', label: 'Phone Number', required: true },
              { key: 'national_id', label: 'National ID', required: true },
              { key: 'location', label: 'Location', required: false },
            ].map(f => (
              <div className="mb-3" key={f.key}>
                <label className="form-label">{f.label}{f.required && <span className="text-danger"> *</span>}</label>
                <input
                  className="form-control"
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                />
              </div>
            ))}
            <div className="d-flex gap-2">
              <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Create & Continue'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/customers')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
