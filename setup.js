const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(__dirname, '.env');

const questions = [
    { key: 'DB_HOST', question: 'Database Host (default: localhost): ', default: 'localhost' },
    { key: 'DB_USER', question: 'Database User (default: root): ', default: 'root' },
    { key: 'DB_PASSWORD', question: 'Database Password: ' },
    { key: 'DB_NAME', question: 'Database Name (default: abuse_reports_db): ', default: 'abuse_reports_db' },
    { key: 'SLACK_BOT_TOKEN', question: 'Slack Bot Token (xoxb-...): ' },
    { key: 'SLACK_CHANNEL_ID', question: 'Slack Channel ID: ' },
    { key: 'AI_PROVIDER', question: 'AI Provider (gemini/openai) (default: gemini): ', default: 'gemini' },
];

const config = {};

async function askQuestion(q) {
    return new Promise((resolve) => {
        rl.question(q.question, (answer) => {
            resolve(answer.trim() || q.default || '');
        });
    });
}

async function setup() {
    console.log("=== Abuse Reporting Bot Setup ===\n");

    for (const q of questions) {
        config[q.key] = await askQuestion(q);
    }

    if (config.AI_PROVIDER === 'openai') {
        config.OPENAI_API_KEY = await askQuestion({ question: 'OpenAI API Key: ' });
    } else {
        config.GEMINI_API_KEY = await askQuestion({ question: 'Gemini API Key: ' });
    }

    // Generate .env content
    let envContent = '';
    for (const [key, value] of Object.entries(config)) {
        envContent += `${key}=${value}\n`;
    }

    // Add defaults
    envContent += `PORT=3000\nNODE_ENV=production\nDB_DIALECT=mysql\nGOOGLE_APPLICATION_CREDENTIALS=./credentials.json\n`;

    fs.writeFileSync(envPath, envContent);

    console.log("\n✅ .env file created successfully!");
    console.log("\n=== Next Steps ===");
    console.log("1. Ensure you have 'credentials.json' for Gmail in this directory.");
    console.log("2. Run 'npm start' to launch the bot.");

    rl.close();
}

setup();
