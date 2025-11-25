const axios = require('axios');
require('dotenv').config();

const SLACK_API_URL = 'https://slack.com/api';

/**
 * Post a message to Slack.
 * If threadTs is provided, replies to that thread.
 * Returns the timestamp of the posted message.
 */
async function postMessage(text, threadTs = null) {
    const token = process.env.SLACK_BOT_TOKEN;
    const channel = process.env.SLACK_CHANNEL_ID;

    if (!token || !channel) {
        console.error('Slack credentials missing in .env');
        return null;
    }

    try {
        const payload = {
            channel: channel,
            text: text,
        };

        if (threadTs) {
            payload.thread_ts = threadTs;
        }

        const response = await axios.post(`${SLACK_API_URL}/chat.postMessage`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.ok) {
            return response.data.ts;
        } else {
            console.error('Slack API error:', response.data.error);
            return null;
        }
    } catch (error) {
        console.error('Error posting to Slack:', error.message);
        return null;
    }
}

module.exports = {
    postMessage,
};
