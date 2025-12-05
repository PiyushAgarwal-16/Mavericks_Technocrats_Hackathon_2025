import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Certificate } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user?.email}
                {user?.role === 'admin' && (
                  <span className="ml-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                    ADMIN
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Certificates
            </h2>
            <button
              onClick={loadCertificates}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading certificates...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Certificates List */}
          {!loading && !error && certificates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No certificates found
              </p>
              <p className="text-gray-500">
                Certificates you create will appear here
              </p>
            </div>
          )}

          {!loading && !error && certificates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Wipe ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Device Model
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {cert.wipeId}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {cert.deviceModel}
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
                        <Link
                          to={`/verify?wipeId=${cert.wipeId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
          {!loading && !error && certificates.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Total Certificates: <span className="font-semibold">{certificates.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
