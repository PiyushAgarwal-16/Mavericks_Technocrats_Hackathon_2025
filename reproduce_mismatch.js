
// --- MINIMAL COPY OF SIGNING UTILS ---
function canonicalizeJSON(obj) {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(item => canonicalizeJSON(item)).join(',') + ']';
    }
    const sortedKeys = Object.keys(obj).sort();
    const pairs = sortedKeys.map(key => {
        const value = canonicalizeJSON(obj[key]);
        return `"${key}":${value}`;
    });
    return '{' + pairs.join(',') + '}';
}

// --- SIMULATION ---

// 1. Raw Input from App (Creation)
// Dart often produces 6 digits for microseconds like .123456Z
const rawTimestamp = '2025-12-06T12:10:02.123456Z';

// SIMULATE THE FIX: Normalize before payload creation
const dateObj = new Date(rawTimestamp);
const normalizedTimestamp = dateObj.toISOString();

const rawInput = {
    wipeId: 'ZT-1765003205410-F8D00FFA',
    userId: 'agent-001',
    deviceModel: 'SanDisk Cruzer Blade',
    serialNumber: '200422047007AC91004C',
    method: 'zero',
    timestamp: normalizedTimestamp, // USE NORMALIZED
    logHash: '8bf29216ad4d5e70db971e6f262219d1885b8ec7f0c697bc168f09675c761fb0',
};

// 2. Creation Payload
const creationPayload = {
    wipeId: rawInput.wipeId,
    userId: rawInput.userId,
    deviceModel: rawInput.deviceModel,
    serialNumber: rawInput.serialNumber || null,
    method: rawInput.method,
    timestamp: rawInput.timestamp,
    logHash: rawInput.logHash,
};

// 3. Mongoose Transformation (Simulation)
// Mongoose stores Date. verification calls .toISOString()
// JS Date constructor will truncation microseconds to milliseconds
const mongooseDate = new Date(rawInput.timestamp);
const verifiedTimestamp = mongooseDate.toISOString();

// 4. Verification Payload
const verificationPayload = {
    wipeId: rawInput.wipeId,
    userId: rawInput.userId,
    deviceModel: rawInput.deviceModel,
    serialNumber: rawInput.serialNumber || null,
    method: rawInput.method,
    timestamp: verifiedTimestamp,
    logHash: rawInput.logHash,
};

console.log('--- Canonicalization Check ---');
const canonInfo = canonicalizeJSON(creationPayload);
const canonVerify = canonicalizeJSON(verificationPayload);

console.log('Creation:    ', canonInfo);
console.log('Verification:', canonVerify);

if (canonInfo === canonVerify) {
    console.log('✅ Payloads MATCH');
} else {
    console.log('❌ Payloads DO NOT MATCH');
    console.log('Timestamp Input:', rawInput.timestamp);
    console.log('Timestamp Output:', verifiedTimestamp);
}
