# Abuse Reporting Bot

A Node.js bot that automates the handling of abuse reports from Gmail, logs them to MySQL, and notifies a Slack channel.

## Features

- **Gmail Integration**: Polls for unread emails with "Abuse Report" or "Vulnerability" in the subject.
- **Parsing**: Extracts the involved Server IP address from the email body.
- **Slack Threading**: Checks if an active thread exists for the IP. If yes, replies to it. If no, creates a new thread.
- **Database**: Stores report details and Slack thread timestamps in MySQL.
- **AI Auto-Reply**: Generates a draft response using **Gemini** or **OpenAI**.

## Quick Start (Interactive Setup)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/abuse-report-app.git
    cd abuse-report-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run Setup Wizard:**
    ```bash
    npm run setup
    ```
    This will prompt you for all necessary keys and create the `.env` file for you.

4.  **Start the Bot:**
    ```bash
    npm start
    ```

## How to Get Credentials

### 1. Gmail Credentials (`credentials.json`)
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **Gmail API**.
4.  Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
5.  Select **Desktop App**.
6.  Download the JSON file and rename it to `credentials.json`.
7.  Place it in the root folder of this project.

### 2. Slack Bot Token
1.  Go to [Slack API Apps](https://api.slack.com/apps).
2.  Create a New App > From Scratch.
3.  Go to **OAuth & Permissions**.
4.  Add the following **Bot Token Scopes**:
    - `chat:write`
    - `channels:read` (optional, depends on needs)
5.  Install the App to your Workspace.
6.  Copy the **Bot User OAuth Token** (`xoxb-...`).
7.  Add the bot to your desired channel in Slack (`/invite @YourBotName`).
8.  Get the **Channel ID** (Right click channel > Copy Link > The ID is the last part, e.g., `C123456`).

### 3. AI API Keys
- **Gemini**: Get your key from [Google AI Studio](https://aistudio.google.com/).
- **OpenAI**: Get your key from [OpenAI Platform](https://platform.openai.com/api-keys).

## Manual Configuration (Alternative)

If you prefer not to use the setup script, copy `.env.example` to `.env` and fill it in manually.

```bash
cp .env.example .env
nano .env
```

## Database Schema

Ensure your MySQL server is running and you have created the database. You can use the provided `schema.sql` to create the table:

```bash
mysql -u root -p < schema.sql
```

## Deployment

For Ubuntu deployment using `systemd`, see `abuse-bot.service`.
