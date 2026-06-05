import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getLoanOffers, createLoanFromOffer } from '../api/agent'

export default function LoanOffer() {
  const { customerId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const amount = searchParams.get('amount') || 250

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getLoanOffers(customerId, amount)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load offers.'))
      .finally(() => setLoading(false))
  }, [customerId, amount])

  const handleAccept = async (offer) => {
    setSubmitting(true)
    try {
      await createLoanFromOffer(customerId, {
        amount,
        interest: offer.interest,
        days: offer.days,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create loan.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
  if (error) return <div className="container py-3"><div className="alert alert-danger">{error}</div></div>

  return (
    <div className="container py-3" style={{ maxWidth: 600 }}>
      <h4 className="mb-1">Loan Offers</h4>
      <p className="text-muted mb-3">Customer: <strong>{data.customer.name}</strong> — Amount: <strong>E{parseFloat(amount).toFixed(2)}</strong></p>
      <div className="row g-3">
        {data.offers.map(offer => (
          <div className="col-md-6" key={offer.interest}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{offer.interest}% Interest</h5>
                <table className="table table-sm mb-3">
                  <tbody>
                    <tr><td>Duration</td><td className="fw-bold">{offer.days} days</td></tr>
                    <tr><td>Total Due</td><td className="fw-bold">E{offer.total_due}</td></tr>
                    <tr><td>Daily Payment</td><td className="fw-bold text-primary">E{offer.daily_payment}</td></tr>
                  </tbody>
                </table>
                <button
                  className="btn btn-success w-100"
                  onClick={() => handleAccept(offer)}
                  disabled={submitting}
                >
                  {submitting ? 'Processing…' : 'Accept This Offer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-secondary mt-3" onClick={() => navigate(-1)}>Back</button>
    </div>
  )
}
