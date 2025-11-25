const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
require('dotenv').config();

// Initialize Clients
let genAI;
let openai;

if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate a polite auto-reply for an abuse report.
 */
async function generateAutoReply(abuseReportBody, senderName) {
    const provider = process.env.AI_PROVIDER || 'gemini';
    const prompt = `
      You are a professional Abuse Reporting Bot for a hosting company.
      A user named "${senderName}" has sent an abuse report with the following content:
      "${abuseReportBody}"
      
      Please draft a polite, professional, and concise email response acknowledging the receipt of this report.
      Assure them that we take abuse reports seriously and will investigate the IP address involved.
      Do not promise a specific resolution time, but say we will take appropriate action.
      Sign it as "Abuse Response Team".
    `;

    try {
        if (provider === 'openai') {
            if (!openai) throw new Error("OpenAI API Key not configured");
            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        } else {
            // Default to Gemini
            if (!genAI) throw new Error("Gemini API Key not configured");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
    } catch (error) {
        console.error(`Error generating AI response (${provider}):`, error.message);
        return "Thank you for your report. We have received it and will investigate.";
    }
}

module.exports = {
    generateAutoReply,
};
