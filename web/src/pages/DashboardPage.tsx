import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Certificate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, RefreshCw, FileText, Shield, Smartphone, PenTool, Search } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.certificates.getUserCertificates();
      setCertificates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-cyan w-10 h-10 rounded-xl flex items-center justify-center">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white tracking-wide">Command Center</h1>
                <p className="text-xs text-gray-400">
                  Authorized: <span className="text-cyan">{user?.email}</span>
                  {user?.role === 'admin' && <span className="ml-2 bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] border border-primary/30 uppercase">TOP SECRET</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium transition border border-primary/20"
                >
                  <Shield size={16} /> Admin Panel
                </Link>
              )}
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Home size={16} /> Home
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-medium transition border border-red-500/20"
              >
                <LogOut size={16} /> <span className="hidden md:inline">Terminate Session</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-2">Operation Logs</h2>
            <p className="text-gray-400">Secure record of all data destruction operations.</p>
          </div>
          <button
            onClick={loadCertificates}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-white/10 hover:border-cyan/30 group"
          >
            <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 flex items-center gap-3">
            <Shield className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats Grid (Optional but nice) */}
        {!loading && !error && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 blur-[40px] rounded-full -mr-10 -mt-10"></div>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Wipes</p>
              <p className="text-4xl font-heading font-bold text-white">{certificates.length}</p>
            </div>
          </div>
        )}

        {/* Data Grid */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent shadow-[0_0_15px_rgba(0,209,255,0.5)]"></div>
              <p className="text-cyan mt-4 font-mono text-sm animate-pulse">DECRYPTING_LOGS...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && certificates.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="text-gray-500 w-10 h-10" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No operations found</p>
              <p className="text-gray-600 text-sm">Initiate a wipe via the mobile app to generate certificates.</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && certificates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Verification ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Protocol</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Shield className="text-gray-600 group-hover:text-cyan transition-colors w-4 h-4" />
                          <code className="text-sm font-mono text-cyan bg-cyan/10 px-2 py-1 rounded border border-cyan/20">
                            {cert.wipeId}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Smartphone size={16} className="text-gray-500" />
                          {cert.deviceModel}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded text-xs font-medium border border-primary/20 uppercase">
                          <PenTool size={12} />
                          {cert.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                        {new Date(cert.timestamp).toLocaleDateString()} <span className="text-gray-600">{new Date(cert.timestamp).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/verify?wipeId=${cert.wipeId}`}
                          className="inline-flex items-center gap-1.5 text-cyan hover:text-white transition-colors text-sm font-medium hover:underline decoration-cyan underline-offset-4"
                        >
                          <Search size={14} /> Verify
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
