import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>404</h1>
      <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ fontSize: '18px', color: 'var(--gray-600)', marginBottom: '32px' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  )
}

export default NotFound
