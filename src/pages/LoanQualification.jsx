import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLoanQualification } from '../api/agent'

export default function LoanQualification() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getLoanQualification(customerId)
      .then(res => {
        setData(res.data)
        setAmount(res.data.lower)
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load.'))
  }, [customerId])

  const handleContinue = () => {
    const v = parseFloat(amount)
    if (isNaN(v) || v < data.lower || v > data.upper) {
      setError(`Amount must be between ${data.lower} and ${data.upper}.`)
      return
    }
    navigate(`/customers/${customerId}/offer?amount=${v}`)
  }

  if (error) return <div className="container py-3"><div className="alert alert-danger">{error}</div></div>
  if (!data) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3" style={{ maxWidth: 520 }}>
      <h4 className="mb-3">Loan Qualification</h4>
      <div className="card shadow-sm">
        <div className="card-body">
          <p className="mb-1"><strong>Customer:</strong> {data.customer.name}</p>
          <p className="mb-3 text-muted">Phone: {data.customer.phone}</p>
          <div className="alert alert-info">
            Eligible for loans between <strong>E{data.lower}</strong> and <strong>E{data.upper}</strong>
          </div>
          <div className="mb-3">
            <label className="form-label">Loan Amount</label>
            <input
              type="number"
              className="form-control"
              min={data.lower}
              max={data.upper}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
            />
            {error && <div className="text-danger small mt-1">{error}</div>}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleContinue}>View Offers</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}
