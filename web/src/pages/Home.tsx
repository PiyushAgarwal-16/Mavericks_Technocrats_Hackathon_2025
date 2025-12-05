import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          Secure Device Wipe Certification
        </h1>
        <p className="hero-subtitle">
          Verify the authenticity of device wipe certificates with tamper-evident cryptographic signatures
        </p>
        <div className="hero-actions">
          <Link to="/verify" className="btn btn-primary btn-lg">
            Verify Certificate
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Cryptographic Security</h3>
            <p>All certificates are digitally signed using RSA/ECDSA to ensure authenticity and prevent tampering</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🗑️</div>
            <h3>Multiple Wipe Methods</h3>
            <p>Support for ATA Secure Erase, DoD 5220.22-M, and NIST SP 800-88 compliant wiping standards</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Instant Verification</h3>
            <p>Verify certificates in real-time through our public verification portal</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Cross-Platform</h3>
            <p>Generate certificates from Windows, Linux, or our mobile app</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Perform Device Wipe</h3>
            <p>Use our secure wipe scripts or app to completely erase your storage device</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Generate Certificate</h3>
            <p>A cryptographically signed certificate is automatically generated with device and wipe details</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Verify Anytime</h3>
            <p>Anyone can verify the certificate's authenticity using the unique certificate ID</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Ready to get started?</h2>
          <p>Verify a certificate or learn more about our secure device wipe solutions</p>
          <Link to="/verify" className="btn btn-primary btn-lg">
            Verify Certificate Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
