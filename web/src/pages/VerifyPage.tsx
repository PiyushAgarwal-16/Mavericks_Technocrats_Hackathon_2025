import React, { useState, useEffect } from 'react';
import { api, VerificationResult } from '../services/api';
import { Search, CheckCircle, XCircle, FileText, Smartphone, HardDrive, Calendar, Key, AlertTriangle, ArrowLeft, Loader2, User } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id') || '';
  
  const [wipeId, setWipeId] = useState(idFromUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-verify if ID is in URL
  useEffect(() => {
    if (idFromUrl && !loading && !result && !error) {
      // Trigger verification automatically
      handleVerify(new Event('submit') as any);
    }
  }, [idFromUrl]);

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
      console.log('🔍 Validating certificate ID:', wipeId.trim());
      
      // First, validate the certificate ID
      const validation = await api.certificates.validate(wipeId.trim());
      
      console.log('📋 Validation result:', validation);
      
      if (!validation.valid) {
        // Invalid format - likely fake
        setError(
          '❌ Invalid Certificate ID Format\n\n' +
          'The ID you entered doesn\'t match the expected format.\n' +
          'This appears to be a fake or incorrectly entered certificate ID.\n\n' +
          '✅ Valid format: ZT-[TIMESTAMP]-[RANDOM]\n' +
          '📝 Example: ZT-1733389800000-ABCD1234567890\n\n' +
          '⚠️ Reason: ' + (validation.reason || 'Invalid format')
        );
        return;
      }
      
      if (!validation.exists) {
        // Valid format but not uploaded yet
        setError(
          '⏳ Certificate Pending Upload\n\n' +
          'The certificate ID format is valid, but the wipe record hasn\'t been uploaded to our servers yet.\n\n' +
          '🔍 This could mean:\n' +
          '• The device that performed the wipe is offline\n' +
          '• The certificate was generated in offline mode\n' +
          '• Upload is still in progress\n\n' +
          '💡 What to do:\n' +
          '• Ensure the device has internet connection\n' +
          '• Wait a few moments and try again\n' +
          '• Check the PDF certificate for local verification\n\n' +
          'If this certificate was just generated, please allow time for the upload to complete.'
        );
        return;
      }
      
      // Certificate exists, now verify it
      const data = await api.certificates.verify(wipeId.trim());
      setResult(data);
    } catch (err: any) {
      // Handle other errors
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network')) {
        setError(
          '🌐 Network Connection Error\n\n' +
          'Unable to reach verification server.\n' +
          'Please check your internet connection and try again.'
        );
      } else {
        setError(
          '❌ Verification Failed\n\n' +
          (err.response?.data?.error || err.message || 'An unexpected error occurred. Please try again.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid = result?.verified && result?.certificate;

  return (
    <div className="min-h-screen bg-dark text-white font-sans relative overflow-x-hidden p-4 md:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-cyan/10 blur-[150px] rounded-full -z-10"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Back
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Verify Certificate
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Cryptographic verification of data destruction. Enter your unique Wipe ID below.
          </p>
        </div>

        {/* Verify Form */}
        <div className="glass-panel p-2 rounded-2xl mb-12 max-w-2xl mx-auto">
          <form onSubmit={handleVerify} className="relative flex items-center">
            <Search className="absolute left-4 text-gray-500 w-6 h-6" />
            <input
              type="text"
              value={wipeId}
              onChange={(e) => setWipeId(e.target.value)}
              placeholder="Paste Wipe ID (e.g. ZT-1234567890-ABC123)"
              className="w-full bg-transparent border-none text-white px-14 py-4 focus:ring-0 placeholder:text-gray-600 text-lg font-mono tracking-wide"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan hover:opacity-90 transition-opacity text-white font-bold disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'verify_hash'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="text-red-400 w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-bold text-lg">Verification Failed</h3>
              <p className="text-red-400/80 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="glass-panel rounded-3xl p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-500">

            {/* Validity Badge */}
            <div className="flex flex-col items-center mb-12">
              {isValid ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-green-400 tracking-wider">CERTIFICATE VALID</h2>
                  <p className="text-green-400/60 mt-2 font-mono uppercase text-sm">Signature Verified • Integrity Confirmed</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-red-500 tracking-wider">CERTIFICATE INVALID</h2>
                  <p className="text-red-500/60 mt-2 font-mono uppercase text-sm">Signature Mismatch • Integrity Compromised</p>
                </div>
              )}
            </div>

            {/* Certificate Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* Meta Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-heading mb-4 text-cyan flex items-center gap-2">
                  <FileText size={20} /> Session Metadata
                </h3>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Wipe ID</label>
                  <p className="font-mono text-white break-all">{result.certificate.wipeId}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Date & Time</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <p className="text-white">{new Date(result.certificate.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Audit Authority</label>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <p className="text-white">
                      {result.user?.email || 'Unknown Issuer'}
                      {result.user?.role === 'admin' && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">Admin</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-heading mb-4 text-primary flex items-center gap-2">
                  <HardDrive size={20} /> Technical Data
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Device Model</label>
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} className="text-gray-400" />
                      <p className="text-white truncate" title={result.certificate.deviceModel}>{result.certificate.deviceModel}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Wipe Method</label>
                    <p className="font-mono text-cyan">{result.certificate.method}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Cryptographic Hash (SHA-256)</label>
                  <div className="flex items-start gap-2">
                    <Key size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="font-mono text-xs text-gray-300 break-all leading-relaxed">
                      {result.certificate.logHash}
                    </p>
                  </div>
                </div>

                {/* Verification Checks */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Digital Signature</span>
                    <span className={`text-sm font-bold ${result.signatureValid ? 'text-green-400' : 'text-red-400'}`}>
                      {result.signatureValid ? 'VERIFIED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Log Integrity</span>
                    <span className={`text-sm font-bold ${result.logHashMatches ? 'text-green-400' : 'text-red-400'}`}>
                      {result.logHashMatches ? 'MATCHED' : 'EVALUATION FAILED'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Wipe Log Details (Collapsible or visible) */}
            {result.wipeLog && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-lg font-bold font-heading mb-4 text-gray-300">Execution Log</h3>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-gray-400 border border-white/5 overflow-x-auto">
                  <p><span className="text-cyan">$ target_device:</span> {result.wipeLog.devicePath}</p>
                  <p><span className="text-cyan">$ operation_duration:</span> {result.wipeLog.duration}s</p>
                  <p><span className="text-cyan">$ exit_code:</span> {result.wipeLog.exitCode}</p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
