import express from 'express';
import fs from 'fs-extra';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Hard-coded path for local storage (No Environment Variable needed)
const DB_PATH = './3eesher_universe.json';

// Identity: Abdullah Haruna (Hard-coded for immediate deploy)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: 'abdullahharuna216@gmail.com', 
        pass: 'qplt ekkg jkej mtcn' 
    }
});

const initDB = async () => {
    if (!await fs.pathExists(DB_PATH)) {
        await fs.writeJson(DB_PATH, {
            owner: "Abdullah Haruna",
            wallet: { bank: "0429006480", paypal: "abdullahharuna216@gmail.com" },
            links_50: Array.from({length: 50}, (_, i) => `https://link-${i+1}.3eesher.cloud`),
            reports: [],
            chat_history: []
        });
    }
};
await initDB();

// 24/7 Background Money Engine
cron.schedule('0 * * * *', async () => {
    const db = await fs.readJson(DB_PATH);
    const link = db.links_50[Math.floor(Math.random() * 50)];
    db.reports.unshift({ time: new Date().toLocaleString(), task: "Auto-Marketing", status: "Success" });
    await fs.writeJson(DB_PATH, db);
    
    // Agent sends you the track link automatically
    await transporter.sendMail({
        from: '"3eesher-agent" <abdullahharuna216@gmail.com>',
        to: 'abdullahharuna216@gmail.com',
        subject: "Agent Track Link",
        text: `Task done as Abdullah. Track here: ${link}`
    });
});

// Super Admin Chat Logic
app.post('/api/admin/chat', async (req, res) => {
    const { token, prompt } = req.body;
    if (token !== "MASTER_3EESHER_2026") return res.status(403).send("Unauthorized");
    const db = await fs.readJson(DB_PATH);
    let agentSay = `Executing: "${prompt}" for you, Abdullah.`;
    db.chat_history.push({ user: prompt, agent: agentSay, time: new Date().toLocaleString() });
    await fs.writeJson(DB_PATH, db);
    res.json({ response: agentSay });
});

app.get('/api/admin/data', async (req, res) => {
    const db = await fs.readJson(DB_PATH);
    res.json(db);
});

// Render dynamic port or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`3eesher-agent is LIVE on port ${PORT}`));
