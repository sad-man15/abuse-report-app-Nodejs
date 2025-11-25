const { extractIpAddress } = require('./src/services/gmailService');

const testCases = [
    {
        text: "Abuse report for IP 192.168.1.1 involved in spam.",
        expected: "192.168.1.1"
    },
    {
        text: "Server at 10.0.0.55 is attacking us.",
        expected: "10.0.0.55"
    },
    {
        text: "No IP here.",
        expected: null
    }
];

console.log("Running Regex Tests...");
let passed = 0;
testCases.forEach((test, index) => {
    const result = extractIpAddress(test.text);
    if (result === test.expected) {
        console.log(`Test ${index + 1}: PASSED`);
        passed++;
    } else {
        console.log(`Test ${index + 1}: FAILED. Expected ${test.expected}, got ${result}`);
    }
});

if (passed === testCases.length) {
    console.log("All tests passed!");
} else {
    console.log("Some tests failed.");
}
