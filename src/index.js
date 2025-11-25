const cron = require('node-cron');
const sequelize = require('./config/database');
const AbuseReport = require('./models/AbuseReport');
const gmailService = require('./services/gmailService');
const slackService = require('./services/slackService');
const aiService = require('./services/aiService');
require('dotenv').config();

// Sync Database
// Only sync if running directly or if explicitly called (we'll handle this in the export)
if (require.main === module) {
    sequelize.sync().then(() => {
        console.log('Database synced');
        // Run once on startup
        processAbuseReports();
        // Schedule
        cron.schedule('*/5 * * * *', () => {
            processAbuseReports();
        });
        console.log('Abuse Reporting Bot started. Polling every 5 minutes.');
    }).catch((err) => {
        console.error('Failed to sync database:', err);
    });
}

/**
 * Main logic function with dependency injection for testing/demo.
 */
async function processAbuseReports(
    injectedGmail = gmailService,
    injectedSlack = slackService,
    injectedAi = aiService,
    injectedModel = AbuseReport
) {
    console.log('Checking for new abuse reports...');
    const emails = await injectedGmail.checkEmails();

    if (emails.length === 0) {
        console.log('No new relevant emails found.');
        return;
    }

    console.log(`Found ${emails.length} new reports.`);

    for (const email of emails) {
        try {
            // Check if we already processed this email ID (double check)
            const existingEmail = await injectedModel.findOne({ where: { email_id: email.id } });
            if (existingEmail) {
                console.log(`Email ${email.id} already processed. Skipping.`);
                continue;
            }

            console.log(`Processing report for IP: ${email.ip}`);

            // Check if we have an open thread for this IP
            const existingReport = await injectedModel.findOne({
                where: { server_ip: email.ip, status: 'open' },
                order: [['created_at', 'DESC']]
            });

            let threadTs = null;
            let messageText = '';

            if (existingReport && existingReport.thread_ts) {
                // Thread exists, reply to it
                console.log(`Found existing thread for IP ${email.ip}. Replying...`);
                threadTs = existingReport.thread_ts;
                messageText = `*New Report Received for this IP*\n*Subject:* ${email.subject}\n*From:* ${email.from}\n*Snippet:* ${email.snippet}`;
            } else {
                // New issue, create new thread
                console.log(`No active thread for IP ${email.ip}. Creating new post...`);
                messageText = `*🚨 New Abuse Report Detected*\n*Target IP:* ${email.ip}\n*Subject:* ${email.subject}\n*From:* ${email.from}\n*Snippet:* ${email.snippet}`;
            }

            // Post to Slack
            const ts = await injectedSlack.postMessage(messageText, threadTs);

            // If it was a new thread, we need to save the ts
            const finalThreadTs = threadTs || ts;

            await injectedModel.create({
                server_ip: email.ip,
                email_id: email.id,
                thread_ts: finalThreadTs,
                status: 'open'
            });

            // Generate AI Auto-Reply
            const autoReply = await injectedAi.generateAutoReply(email.body, email.from);
            console.log(`[AI Auto-Reply Draft] To: ${email.from}\n${autoReply}`);

        } catch (err) {
            console.error(`Error processing email ${email.id}:`, err);
        }
    }
}

module.exports = { processAbuseReports };
