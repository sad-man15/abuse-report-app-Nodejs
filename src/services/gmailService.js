const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// SCOPES for Gmail API
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];

/**
 * Authenticate with Gmail API.
 * This example assumes a Service Account or OAuth2 setup.
 * For a simple bot, a Service Account with Domain-Wide Delegation is often used,
 * OR a standard OAuth2 flow where you generate a token once and refresh it.
 * 
 * HERE we will assume a standard OAuth2 flow using a stored token or credentials.
 */
async function getGmailClient() {
    // NOTE: In a real production app, you might use a Service Account with delegation
    // or load a saved token. For this deliverable, we'll set up the OAuth2 client structure.

    const credentialsPath = path.join(process.cwd(), 'credentials.json');

    if (!fs.existsSync(credentialsPath)) {
        console.warn('Warning: credentials.json not found. Gmail API calls will fail.');
        return null;
    }

    const content = fs.readFileSync(credentialsPath);
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have a saved token
    const tokenPath = path.join(process.cwd(), 'token.json');
    if (fs.existsSync(tokenPath)) {
        const token = fs.readFileSync(tokenPath);
        oAuth2Client.setCredentials(JSON.parse(token));
    } else {
        console.warn('Warning: token.json not found. You need to authenticate first.');
        // In a real CLI app, we would trigger an auth flow here.
        return null;
    }

    return google.gmail({ version: 'v1', auth: oAuth2Client });
}

/**
 * Extract IP address from text using Regex.
 * Looks for IPv4 pattern.
 */
function extractIpAddress(text) {
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    const match = text.match(ipv4Regex);
    return match ? match[0] : null;
}

/**
 * Poll for unread emails with specific subjects.
 */
async function checkEmails() {
    const gmail = await getGmailClient();
    if (!gmail) return [];

    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread subject:("Abuse Report" OR "Vulnerability")',
        });

        const messages = res.data.messages || [];
        const reports = [];

        for (const message of messages) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });

            const snippet = msg.data.snippet;
            // Get body
            let body = '';
            if (msg.data.payload.parts) {
                msg.data.payload.parts.forEach(part => {
                    if (part.mimeType === 'text/plain' && part.body.data) {
                        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                });
            } else if (msg.data.payload.body.data) {
                body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
            }

            const ip = extractIpAddress(body) || extractIpAddress(snippet);

            if (ip) {
                reports.push({
                    id: message.id,
                    snippet: snippet,
                    body: body,
                    ip: ip,
                    subject: msg.data.payload.headers.find(h => h.name === 'Subject').value,
                    from: msg.data.payload.headers.find(h => h.name === 'From').value,
                });
            }

            // Mark as read (remove UNREAD label)
            await gmail.users.messages.modify({
                userId: 'me',
                id: message.id,
                requestBody: {
                    removeLabelIds: ['UNREAD'],
                },
            });
        }

        return reports;

    } catch (error) {
        console.error('The API returned an error: ' + error);
        return [];
    }
}

module.exports = {
    checkEmails,
    extractIpAddress
};
