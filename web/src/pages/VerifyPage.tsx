import React, { useState } from 'react';
import { api, VerificationResult } from '../services/api';

export const VerifyPage: React.FC = () => {
  const [wipeId, setWipeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wipeId.trim()) {
      setError('Please enter a Wipe ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.certificates.verify(wipeId.trim());
      setResult(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to verify certificate'
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid = result?.verified && result?.certificate;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Certificate
          </h1>
          <p className="text-gray-600 mb-8">
            Enter a Wipe ID to verify the authenticity of a wipe certificate
          </p>

          {/* Verify Form */}
          <form onSubmit={handleVerify} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={wipeId}
                onChange={(e) => setWipeId(e.target.value)}
                placeholder="Enter Wipe ID (e.g., ZT-1234567890-ABC123)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-red-800 font-semibold">Verification Failed</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div>
              {/* Validity Badge */}
              <div className="mb-6 text-center">
                {isValid ? (
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full border-2 border-green-300">
                    <span className="text-3xl mr-3">✅</span>
                    <span className="text-2xl font-bold">VALID</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center bg-red-100 text-red-800 px-6 py-3 rounded-full border-2 border-red-300">
                    <span className="text-3xl mr-3">❌</span>
                    <span className="text-2xl font-bold">INVALID</span>
                  </div>
                )}
              </div>

              {/* Certificate Details */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Certificate Details
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Wipe ID</label>
                    <p className="text-gray-900 font-mono bg-white p-2 rounded border">
                      {result.certificate.wipeId}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Device Model</label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {result.certificate.deviceModel}
                    </p>
                  </div>

                  {result.certificate.serialNumber && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Serial Number</label>
                      <p className="text-gray-900 font-mono bg-white p-2 rounded border">
                        {result.certificate.serialNumber}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Wipe Method</label>
                    <p className="text-gray-900 bg-white p-2 rounded border uppercase">
                      {result.certificate.method}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Timestamp</label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {new Date(result.certificate.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Log Hash (SHA256)</label>
                    <p className="text-gray-900 font-mono text-sm bg-white p-2 rounded border break-all">
                      {result.certificate.logHash}
                    </p>
                  </div>

                  {/* Verification Status */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Signature Valid</label>
                      <p className={`font-semibold ${result.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {result.verified ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Log Hash Matches</label>
                      <p className={`font-semibold ${result.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {result.verified ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  </div>

                  {/* Wipe Log Details */}
                  {result.wipeLog && (
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Wipe Log Details</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Device Path</label>
                          <p className="text-gray-900 font-mono bg-white p-2 rounded border">
                            {result.wipeLog.devicePath}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Duration</label>
                            <p className="text-gray-900 bg-white p-2 rounded border">
                              {result.wipeLog.duration} seconds
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Exit Code</label>
                            <p className={`font-semibold p-2 rounded border ${
                              result.wipeLog.exitCode === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                            }`}>
                              {result.wipeLog.exitCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  {result.user && (
                    <div className="pt-4 border-t">
                      <label className="text-sm font-semibold text-gray-600">Issued By</label>
                      <p className="text-gray-900 bg-white p-2 rounded border">
                        {result.user.email}
                        {result.user.role === 'admin' && (
                          <span className="ml-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                            ADMIN
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
