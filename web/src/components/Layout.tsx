import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <span className="logo-icon">🔒</span>
              <span className="logo-text">ZeroTrace</span>
            </Link>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/verify" className="nav-link">Verify Certificate</Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 ZeroTrace. Secure device wipe certification.</p>
          <p className="footer-note">
            Built for Mavericks Technocrats Hackathon 2025
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
