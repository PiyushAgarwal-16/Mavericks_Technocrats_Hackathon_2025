import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Certificate } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-purple-100 mt-1">
                Logged in as {user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
              >
                My Dashboard
              </Link>
              <Link
                to="/"
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Home
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-semibold mb-1">
              Total Certificates
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-semibold mb-1">
              Uploaded
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.uploaded}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-semibold mb-2">
              By Method
            </div>
            <div className="space-y-1">
              {Object.entries(stats.byMethod).map(([method, count]) => (
                <div key={method} className="flex justify-between text-sm">
                  <span className="text-gray-700 uppercase">{method}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Certificates
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search certificates..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={loadAllCertificates}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading certificates...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Certificates Table */}
          {!loading && !error && filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'No certificates match your search' : 'No certificates found'}
              </p>
            </div>
          )}

          {!loading && !error && filteredCertificates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Wipe ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Device Model
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Serial Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded block max-w-xs truncate">
                          {cert.wipeId}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {cert.deviceModel}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {cert.serialNumber || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium uppercase">
                          {cert.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(cert.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {cert.uploaded ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            UPLOADED
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/verify?wipeId=${cert.wipeId}`}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Verify →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && !error && filteredCertificates.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredCertificates.length}</span> of{' '}
                <span className="font-semibold">{certificates.length}</span> certificates
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
