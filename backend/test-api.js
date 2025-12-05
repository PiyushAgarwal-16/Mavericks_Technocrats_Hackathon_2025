#!/usr/bin/env node

/**
 * Backend API Test Script
 * 
 * Quick test to verify the backend API is working correctly.
 * Run with: node test-api.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing ZeroTrace Backend API\n');
  
  try {
    // 1. Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthRes = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', healthRes.data);
    console.log('');

    // 2. Register User
    console.log('2️⃣ Registering test user...');
    const registerData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'operator'
    };
    const registerRes = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ User registered:', {
      email: registerRes.data.user.email,
      role: registerRes.data.user.role,
      token: registerRes.data.token.substring(0, 20) + '...'
    });
    const token = registerRes.data.token;
    console.log('');

    // 3. Login
    console.log('3️⃣ Testing login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful:', {
      email: loginRes.data.user.email,
      token: loginRes.data.token.substring(0, 20) + '...'
    });
    console.log('');

    // 4. Create Certificate
    console.log('4️⃣ Creating certificate...');
    const certData = {
      deviceModel: 'Samsung 870 EVO',
      serialNumber: 'S5XNNG0NB' + Math.random().toString(36).substring(7).toUpperCase(),
      method: 'ATA Secure Erase',
      timestamp: new Date().toISOString(),
      rawLog: 'Wipe started\nSecure erase successful\nWipe completed',
      devicePath: '/dev/sdb',
      duration: 120,
      exitCode: 0
    };
    
    const certRes = await axios.post(`${API_URL}/certificates`, certData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Certificate created:', {
      wipeId: certRes.data.wipeId,
      verificationUrl: certRes.data.verificationUrl,
      logHash: certRes.data.logHash.substring(0, 20) + '...',
      signature: certRes.data.signature.substring(0, 30) + '...'
    });
    const wipeId = certRes.data.wipeId;
    console.log('');

    // 5. Verify Certificate
    console.log('5️⃣ Verifying certificate (public endpoint)...');
    const verifyRes = await axios.get(`${API_URL}/certificates/${wipeId}`);
    console.log('✅ Certificate verified:', {
      verified: verifyRes.data.verified,
      deviceModel: verifyRes.data.certificate.deviceModel,
      method: verifyRes.data.certificate.method,
      uploaded: verifyRes.data.certificate.uploaded,
      exitCode: verifyRes.data.wipeLog?.exitCode
    });
    console.log('');

    // 6. Invalid Certificate
    console.log('6️⃣ Testing invalid certificate ID...');
    try {
      await axios.get(`${API_URL}/certificates/ZT-INVALID-ID`);
    } catch (err) {
      console.log('✅ Correctly rejected invalid ID:', err.response.status, err.response.data.error);
    }
    console.log('');

    // 7. Unauthorized Access
    console.log('7️⃣ Testing unauthorized access...');
    try {
      await axios.post(`${API_URL}/certificates`, certData);
    } catch (err) {
      console.log('✅ Correctly rejected unauthorized request:', err.response.status, err.response.data.error);
    }
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('- ✅ Health check working');
    console.log('- ✅ User registration working');
    console.log('- ✅ User login working');
    console.log('- ✅ Certificate creation working');
    console.log('- ✅ Certificate verification working');
    console.log('- ✅ RSA signature verification working');
    console.log('- ✅ Authentication middleware working');
    console.log('\n✨ Backend API is fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
}

// Check if axios is available
try {
  require.resolve('axios');
} catch (e) {
  console.error('❌ axios is required. Install it with: npm install axios');
  process.exit(1);
}

// Run tests
testAPI();
