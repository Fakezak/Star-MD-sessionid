import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import express from "express"

const app = express()
const port = 5000

async function connectBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info")

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true // 👈 prints QR in terminal
    })

    sock.ev.on("creds.update", saveCreds)

    // listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        let text = msg.message.conversation || msg.message.extendedTextMessage?.text
        console.log("📩 New message:", text)

        if (text === ".hi") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Hello! 👋 This is your bot." })
        }
    })

    return sock
}

connectBot()

// simple express API for generating pair code
app.get("/pair", async (req, res) => {
    const { state } = await useMultiFileAuthState("auth_info")
    const sock = makeWASocket({ auth: state })

    // Baileys supports "code pairing" here 👇
    const code = await sock.requestPairingCode("18768375254") // 👈 put your full number WITH country code
    res.send({ code })
})

app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`)
})        if (text?.toLowerCase() === "menu") {
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
