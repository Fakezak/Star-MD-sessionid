const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.post("/generate", async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: "Number required" });

    const sessionPath = path.join(__dirname, "session", number);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(number);
        return res.json({ pairingCode: code, message: "Enter this code in WhatsApp Linked Devices" });
    } else {
        return res.json({ message: "Already registered", sessionPath });
    }
});

app.listen(PORT, () => console.log(`SessionID website running on port ${PORT}`));
