// session.js
import express from "express"
import cors from "cors"
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"

const app = express()
app.use(cors())
app.use(express.json())

// Test route
app.get("/", (req, res) => res.send("Star MD Pair Code Backend Running ✅"))

// POST /pair => generate pair code for WhatsApp
app.post("/pair", async (req, res) => {
    try {
        const { number } = req.body
        if (!number) return res.status(400).json({ success: false, error: "No number provided" })

        // Initialize WhatsApp session
        const { state, saveCreds } = await useMultiFileAuthState("auth_info")
        const { version } = await fetchLatestBaileysVersion()

        const sock = makeWASocket({ version, auth: state })
        sock.ev.on("creds.update", saveCreds)

        // Generate Pair Code (no QR)
        const pairCode = await sock.requestPairingCode(number)
        res.json({ success: true, pairCode })

    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`🚀 Star MD Backend running on port ${port}`))    if (!sessionData) return res.status(404).json({ error: "No session found" });

    res.setHeader("Content-Disposition", "attachment; filename=session.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(sessionData, null, 2));
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
