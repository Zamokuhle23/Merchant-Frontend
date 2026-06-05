import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={user.is_staff ? '/admin/dashboard' : '/dashboard'}>
          MicroFinance
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            {!user.is_staff ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/customers">Customers</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/batch-collect">Batch Collect</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/loan-calculator">Calculator</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/admin/dashboard">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/customers">Customers</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/agents">Agents</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/finance">Finance</Link></li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                {user.username}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
