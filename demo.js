const { processAbuseReports } = require('./src/index');

// --- MOCKS ---

// Mock Database (In-Memory)
const dbStore = [];
const mockModel = {
    findOne: async ({ where }) => {
        if (where.email_id) {
            return dbStore.find(r => r.email_id === where.email_id);
        }
        if (where.server_ip) {
            // Return the latest open report for this IP
            return dbStore
                .filter(r => r.server_ip === where.server_ip && r.status === 'open')
                .sort((a, b) => b.created_at - a.created_at)[0];
        }
        return null;
    },
    create: async (data) => {
        const record = { ...data, created_at: Date.now() };
        dbStore.push(record);
        console.log(`[DB] Saved record: IP=${data.server_ip}, ThreadTS=${data.thread_ts}`);
        return record;
    }
};

// Mock Gmail Service
const mockGmail = {
    checkEmails: async () => {
        // We will return different emails based on how many times we've been called
        // to simulate a sequence of events.
        if (!this.callCount) this.callCount = 0;
        this.callCount++;

        if (this.callCount === 1) {
            return [{
                id: 'email_001',
                snippet: 'Abuse report regarding 192.168.1.100',
                body: 'Hello, we detected spam from 192.168.1.100. Please investigate.',
                ip: '192.168.1.100',
                subject: 'Abuse Report - Spam',
                from: 'reporter@example.com'
            }];
        } else if (this.callCount === 2) {
            return [{
                id: 'email_002',
                snippet: 'Another issue with 192.168.1.100',
                body: 'More spam coming from 192.168.1.100.',
                ip: '192.168.1.100',
                subject: 'Re: Abuse Report',
                from: 'reporter@example.com'
            }];
        } else if (this.callCount === 3) {
            return [{
                id: 'email_003',
                snippet: 'New attack from 10.0.0.5',
                body: 'DDoS attack detected from 10.0.0.5.',
                ip: '10.0.0.5',
                subject: 'Vulnerability Report',
                from: 'security@alert.com'
            }];
        }
        return [];
    }
};

// Mock Slack Service
const mockSlack = {
    postMessage: async (text, threadTs) => {
        const newTs = '1234567890.123456'; // Fake timestamp
        if (threadTs) {
            console.log(`[Slack] Replying to thread ${threadTs}:\n${text}\n`);
            return newTs;
        } else {
            console.log(`[Slack] Posting NEW message (TS: ${newTs}):\n${text}\n`);
            return newTs;
        }
    }
};

// Mock AI Service
const mockAi = {
    generateAutoReply: async (body, from) => {
        return `Dear ${from},\n\nWe have received your report regarding the IP address mentioned. Our team will investigate immediately.\n\nBest,\nAbuse Response Team`;
    }
};

// --- RUN DEMO ---

async function runDemo() {
    console.log("=== STARTING DEMO ===");
    console.log("Scenario 1: First report for IP 192.168.1.100 (Should create new thread)");
    await processAbuseReports(mockGmail, mockSlack, mockAi, mockModel);

    console.log("\n--------------------------------------------------\n");

    console.log("Scenario 2: Second report for IP 192.168.1.100 (Should reply to EXISTING thread)");
    await processAbuseReports(mockGmail, mockSlack, mockAi, mockModel);

    console.log("\n--------------------------------------------------\n");

    console.log("Scenario 3: New report for IP 10.0.0.5 (Should create NEW thread)");
    await processAbuseReports(mockGmail, mockSlack, mockAi, mockModel);

    console.log("\n=== DEMO COMPLETE ===");
}

runDemo();
