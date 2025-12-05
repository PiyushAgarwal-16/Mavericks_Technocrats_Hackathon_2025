import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Certificate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Home, LogOut, CheckCircle, Search, Hash, BarChart3, Database, UploadCloud } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllCertificates();
  }, []);

  const loadAllCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.certificates.getAllCertificates();
      setCertificates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter((cert) => {
    const term = searchTerm.toLowerCase();
    return (
      cert.wipeId.toLowerCase().includes(term) ||
      cert.deviceModel.toLowerCase().includes(term) ||
      cert.method.toLowerCase().includes(term) ||
      (cert.serialNumber?.toLowerCase().includes(term) ?? false)
    );
  });

  // Statistics
  const stats = {
    total: certificates.length,
    uploaded: certificates.filter(c => c.uploaded).length,
    byMethod: certificates.reduce((acc, cert) => {
      acc[cert.method] = (acc[cert.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
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
              <div className="bg-primary/20 w-10 h-10 rounded-xl flex items-center justify-center border border-primary/30">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white tracking-wide">Admin Console</h1>
                <p className="text-xs text-gray-400">
                  System Administrator: <span className="text-primary">{user?.email}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-medium transition border border-white/10"
              >
                <BarChart3 size={16} /> Dashboard
              </Link>
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
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Database className="text-primary w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">GLOBAL</span>
            </div>
            <h3 className="text-3xl font-heading font-bold text-white mb-1">{stats.total}</h3>
            <p className="text-sm text-gray-400">Total Certificates</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <UploadCloud className="text-green-400 w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">SYNC</span>
            </div>
            <h3 className="text-3xl font-heading font-bold text-white mb-1">{stats.uploaded}</h3>
            <p className="text-sm text-gray-400">Cloud Synced</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan/10 rounded-xl">
                <Hash className="text-cyan w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">METHODS</span>
            </div>
            <div className="space-y-1">
              {Object.entries(stats.byMethod).map(([method, count]) => (
                <div key={method} className="flex justify-between text-xs text-gray-300 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                  <span className="uppercase">{method}</span>
                  <span className="font-mono text-cyan">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-heading font-bold text-white">Certificate Registry</h2>
              <p className="text-sm text-gray-400">Manage all system records.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search registry..."
                  className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none w-64 placeholder:text-gray-600"
                />
              </div>
              <button
                onClick={loadAllCertificates}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-[0_0_15px_rgba(123,44,191,0.3)] hover:shadow-[0_0_20px_rgba(123,44,191,0.5)]"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="text-primary mt-4 text-sm font-mono animate-pulse">ACCESSING_DATABASE...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3">
                <Shield className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filteredCertificates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Wipe ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Device Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-cyan bg-cyan/10 px-2 py-1 rounded border border-cyan/20 block max-w-[120px] truncate" title={cert.wipeId}>
                          {cert.wipeId}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{cert.deviceModel}</span>
                          <span className="text-xs text-gray-500 font-mono">{cert.serialNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border border-white/10 uppercase bg-white/5 text-gray-300">
                          {cert.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                        {new Date(cert.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {cert.uploaded ? (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">
                            <CheckCircle size={10} /> UPLOADED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/verify?wipeId=${cert.wipeId}`}
                          className="inline-flex items-center gap-1 text-primary hover:text-white transition-colors text-sm font-medium"
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
