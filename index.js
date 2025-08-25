import express from "express";
import { Boom } from "@hapi/boom";
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let sessionData = null;

// Function to start WhatsApp with pairing code
async function startBot(number) {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    // Example auto reply
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text?.toLowerCase() === "hi") {
            await sock.sendMessage(from, { text: "Hello 👋 I’m Star-MD Bot" });
        }
        if (text?.toLowerCase() === "menu") {
            await sock.sendMessage(from, { text: "⭐ Star-MD Bot Menu ⭐\n1. !ping\n2. !time\n3. !joke" });
        }
        if (text?.toLowerCase() === "!ping") {
            await sock.sendMessage(from, { text: "Pong 🏓" });
        }
        if (text?.toLowerCase() === "!time") {
            await sock.sendMessage(from, { text: `⏰ Current Time: ${new Date().toLocaleString()}` });
        }
        if (text?.toLowerCase() === "!joke") {
            await sock.sendMessage(from, { text: "😂 Why don’t skeletons fight? They don’t have the guts!" });
        }
    });

    return sock;
}

// API to pair and generate session
app.post("/pair", async (req, res) => {
    const { number } = req.body;

    if (!number) return res.status(400).json({ error: "Number required!" });

    try {
        sock = await startBot(number);
        sessionData = { id: "star-md-session", number, timestamp: Date.now() };

        fs.writeFileSync("./sessionData.json", JSON.stringify(sessionData, null, 2));
        res.json({ success: true, session: sessionData });
    } catch (err) {
        res.status(500).json({ error: "Failed to start session", details: err.message });
    }
});

// API to download session
app.get("/download-session", (req, res) => {
    if (!sessionData) return res.status(404).json({ error: "No session found" });

    res.setHeader("Content-Disposition", "attachment; filename=session.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(sessionData, null, 2));
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
