import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Verify.css'

interface CertificateData {
  verified: boolean
  certificate?: {
    certificateId: string
    deviceInfo: {
      serialNumber: string
      model: string
      capacity: string
      type: string
    }
    wipeDetails: {
      method: string
      passes: number
      standard: string
      duration: number
      timestamp: string
    }
    operator: {
      name: string
      organization?: string
      email?: string
    }
    signature: string
    createdAt: string
  }
  error?: string
}

function Verify() {
  const { certificateId: urlCertId } = useParams()
  const navigate = useNavigate()
  const [certificateId, setCertificateId] = useState(urlCertId || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CertificateData | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!certificateId.trim()) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await axios.get<CertificateData>(
        `/api/certificates/verify/${certificateId.trim()}`
      )
      setResult(response.data)
      navigate(`/verify/${certificateId.trim()}`, { replace: true })
    } catch (error: any) {
      setResult({
        verified: false,
        error: error.response?.data?.error || 'Certificate not found or invalid',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <div className="verify-page">
      <div className="verify-header">
        <h1>Verify Certificate</h1>
        <p>Enter a certificate ID to verify its authenticity</p>
      </div>

      <div className="card verify-form-card">
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="certificateId">Certificate ID</label>
            <input
              id="certificateId"
              type="text"
              className="input"
              placeholder="e.g., ZT-1234567890-ABCD1234"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !certificateId.trim()}>
            {loading ? (
              <>
                <span className="loading"></span>
                Verifying...
              </>
            ) : (
              'Verify Certificate'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="card result-card">
          {result.verified && result.certificate ? (
            <div className="result-success">
              <div className="result-header">
                <span className="result-icon success">✓</span>
                <div>
                  <h2>Certificate Verified</h2>
                  <p>This certificate is authentic and has not been tampered with</p>
                </div>
              </div>

              <div className="cert-details">
                <section className="cert-section">
                  <h3>Certificate Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Certificate ID</span>
                      <span className="detail-value"><code>{result.certificate.certificateId}</code></span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Issued</span>
                      <span className="detail-value">{formatDate(result.certificate.createdAt)}</span>
                    </div>
                  </div>
                </section>

                <section className="cert-section">
                  <h3>Device Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Model</span>
                      <span className="detail-value">{result.certificate.deviceInfo.model}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Serial Number</span>
                      <span className="detail-value"><code>{result.certificate.deviceInfo.serialNumber}</code></span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Capacity</span>
                      <span className="detail-value">{result.certificate.deviceInfo.capacity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">
                        <span className="badge badge-info">{result.certificate.deviceInfo.type}</span>
                      </span>
                    </div>
                  </div>
                </section>

                <section className="cert-section">
                  <h3>Wipe Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Method</span>
                      <span className="detail-value">{result.certificate.wipeDetails.method}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Standard</span>
                      <span className="detail-value">{result.certificate.wipeDetails.standard}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Passes</span>
                      <span className="detail-value">{result.certificate.wipeDetails.passes}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{formatDuration(result.certificate.wipeDetails.duration)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Completed</span>
                      <span className="detail-value">{formatDate(result.certificate.wipeDetails.timestamp)}</span>
                    </div>
                  </div>
                </section>

                <section className="cert-section">
                  <h3>Operator Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{result.certificate.operator.name}</span>
                    </div>
                    {result.certificate.operator.organization && (
                      <div className="detail-item">
                        <span className="detail-label">Organization</span>
                        <span className="detail-value">{result.certificate.operator.organization}</span>
                      </div>
                    )}
                    {result.certificate.operator.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{result.certificate.operator.email}</span>
                      </div>
                    )}
                  </div>
                </section>

                <section className="cert-section">
                  <h3>Digital Signature</h3>
                  <div className="signature-box">
                    <code>{result.certificate.signature}</code>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="result-error">
              <div className="result-header">
                <span className="result-icon error">✗</span>
                <div>
                  <h2>Certificate Not Found</h2>
                  <p>{result.error || 'The certificate ID you entered could not be verified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Verify
