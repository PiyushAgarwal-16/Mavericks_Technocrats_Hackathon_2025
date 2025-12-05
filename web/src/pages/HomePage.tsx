import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ZeroTrace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Secure Device Wipe Certification System
          </p>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            ZeroTrace provides cryptographically signed certificates for device wipe operations,
            ensuring complete data destruction with verifiable proof of compliance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/verify"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg"
            >
              Verify Certificate
            </Link>
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition duration-200"
              >
                Sign In
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition duration-200"
              >
                My Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">RSA-SHA256 Signing</h3>
            <p className="text-gray-600">
              Certificates are cryptographically signed using RSA-SHA256 for tamper-proof verification.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Audit Trail</h3>
            <p className="text-gray-600">
              Complete logs with SHA256 hashing provide an immutable audit trail of all wipe operations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
            <p className="text-gray-600">
              Meet NIST SP 800-88 and other data sanitization standards with verifiable proof.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Execute Wipe</h4>
                <p className="text-gray-600">
                  Run our secure wipe scripts on Windows or Linux to permanently erase device data.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Generate Certificate</h4>
                <p className="text-gray-600">
                  Wipe logs are hashed (SHA256) and signed with RSA private key to create a certificate.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Verify Anytime</h4>
                <p className="text-gray-600">
                  Anyone can verify the certificate using the unique Wipe ID to ensure authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        {isAuthenticated && user && (
          <div className="max-w-2xl mx-auto mt-12 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <p className="text-gray-700">
              Welcome back, <span className="font-semibold">{user.email}</span>
              {user.role === 'admin' && (
                <span className="ml-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  ADMIN
                </span>
              )}
            </p>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
            >
              View your certificates →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
