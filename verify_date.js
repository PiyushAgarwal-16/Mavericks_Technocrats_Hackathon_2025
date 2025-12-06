
const microTimestamp = "2023-10-10T10:10:10.123456Z";
const date = new Date(microTimestamp);
const iso = date.toISOString();

console.log("Input: ", microTimestamp);
console.log("Date:  ", date.toString());
console.log("ISO:   ", iso);

if (iso === "2023-10-10T10:10:10.123Z") {
    console.log("✅ Truncation works as expected (3 decimal places)");
} else {
    console.log("❌ Unexpected format");
}
