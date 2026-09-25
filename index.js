import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import { isSupervisionAnnouncement, extractSessionTimes, buildReply } from "./matcher.js";

const { Client, LocalAuth } = pkg;
const GROUP_NAME = process.env.GROUP_NAME || "BK Çarşı Şube Gözetmenlik";
const FULL_NAME = process.env.FULL_NAME || "Furkan Esad Uzun";
const START = Number(process.env.SUNDAY_START_HOUR || 6);
const END = Number(process.env.SUNDAY_END_HOUR || 18);
const DRY_RUN = String(process.env.DRY_RUN ?? "true").toLowerCase() === "true";

process.env.TZ = process.env.TZ || "Europe/Istanbul";

const dataDir = path.resolve("data");
const stateFile = path.join(dataDir, "state.json");
fs.mkdirSync(dataDir, { recursive: true });

function weekKey(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay() || 7;
  x.setDate(x.getDate() + 4 - day);
  const y0 = new Date(x.getFullYear(), 0, 1);
  const week = Math.ceil((((x - y0) / 86400000) + 1) / 7);
  return `${x.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function alreadySentThisWeek() {
  try { return JSON.parse(fs.readFileSync(stateFile, "utf8")).week === weekKey(); }
  catch { return false; }
}

function markSent(messageId) {
  fs.writeFileSync(stateFile, JSON.stringify({
    week: weekKey(),
    messageId,
    sentAt: new Date().toISOString()
  }, null, 2));
}

function isActiveWindow() {
  const now = new Date();
  return now.getDay() === 0 && now.getHours() >= START && now.getHours() < END;
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  }
});

client.on("qr", qr => {
  console.log("WhatsApp > Bağlı cihazlar > Cihaz bağla ile QR kodunu okut:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => console.log("Bot hazır. Hedef grup:", GROUP_NAME));
client.on("auth_failure", m => console.error("Kimlik doğrulama hatası:", m));
client.on("disconnected", r => console.error("WhatsApp bağlantısı kesildi:", r));

client.on("message", async msg => {
  try {
    if (msg.fromMe || !isActiveWindow() || alreadySentThisWeek()) return;

    const chat = await msg.getChat();
    if (!chat.isGroup || chat.name !== GROUP_NAME) return;
    if (!isSupervisionAnnouncement(msg.body)) return;

    const times = extractSessionTimes(msg.body);
    const reply = buildReply(FULL_NAME, times);

    console.log("Duyuru yakalandı:", msg.body);
    console.log("Cevap:", reply);

    if (DRY_RUN) {
      console.log("DRY_RUN=true: mesaj gönderilmedi.");
      return;
    }

    await chat.sendMessage(reply);
    markSent(msg.id?._serialized || "unknown");
    console.log("Mesaj gönderildi.");
  } catch (err) {
    console.error("Mesaj işlenirken hata:", err);
  }
});

client.initialize();
