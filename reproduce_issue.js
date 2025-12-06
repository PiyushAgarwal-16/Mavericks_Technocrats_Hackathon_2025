
const formatRegex = /^ZT-\d{10,15}-[A-F0-9]+$/i;

function check(id) {
    const valid = formatRegex.test(id);
    console.log(`ID: ${id} | Valid: ${valid}`);
}

const now = Date.now();
console.log(`Current Timestamp: ${now} (Length: ${now.toString().length})`);

// Mimic Flutter logic
// Dart: final timestamp = DateTime.now().millisecondsSinceEpoch;
// Dart: final random = DateTime.now().microsecondsSinceEpoch.toRadixString(16).toUpperCase();

const timestamp = now;
// JS doesn't have microseconds precision easily, but we can simulate the length/value
// Dart microseconds is roughly timestamp * 1000
const microseconds = timestamp * 1000;
const randomHex = microseconds.toString(16).toUpperCase();

const generatedId = `ZT-${timestamp}-${randomHex}`;
check(generatedId);

// Test edge cases
check(`ZT-1733470000000-AB123`); // Standard
check(`ZT-173347000000-AB123`);  // 12 digits (Older date?) - Should Fail
check(`ZT-17334700000000-AB123`); // 14 digits - Should Fail
check(`ZT-${timestamp}-`); // Empty hex - Should Fail
check(`zt-${timestamp}-${randomHex}`); // Lowercase prefix - Should Pass
check(`ZT-${timestamp}-${randomHex.toLowerCase()}`); // Lowercase hex - Should Pass
