import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

// Serve static files
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"]
}));

// Simple contact endpoint (beta)
app.post("/api/contact", (req, res) => {
  const { name, phone, message, preferred, company } = req.body || {};

  // Honeypot anti-spam: "company" must stay empty
  if (company && String(company).trim().length > 0) {
    return res.status(200).json({ ok: true });
  }

  // Basic validation
  if (!name || !phone || !message) {
    return res.status(400).json({ ok: false, error: "Completează numele, telefonul și mesajul." });
  }

  // In beta: just log it (later you can send email / store DB)
  console.log("New contact:", {
    name: String(name).trim(),
    phone: String(phone).trim(),
    preferred: preferred ? String(preferred).trim() : "",
    message: String(message).trim()
  });

  return res.json({ ok: true });
});

// Fallback (single page)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Vital Dent beta running: http://localhost:${PORT}`));