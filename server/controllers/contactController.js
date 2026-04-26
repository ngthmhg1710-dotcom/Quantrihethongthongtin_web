const nodemailer = require("nodemailer");
const ContactMessage = require("../models/ContactMessage");
const env = require("../config/env");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isMailerConfigured() {
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.newsletterFromEmail);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

async function submitContact(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!name || !subject || !message || !isValidEmail(email)) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin hợp lệ." });
    }

    await ContactMessage.create({ name, email, subject, message, sentAt: new Date() });

    if (!isMailerConfigured()) {
      return res.status(201).json({ message: "Đã ghi nhận tin nhắn. Chúng tôi sẽ phản hồi sớm." });
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: env.newsletterFromEmail,
      to: env.contactReceiverEmail || env.smtpUser,
      replyTo: email,
      subject: `[Liên hệ] ${subject}`,
      text: `Tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>Bạn có tin nhắn liên hệ mới</h2>
          <p><strong>Tên:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Chủ đề:</strong> ${subject}</p>
          <p><strong>Nội dung:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });

    return res.status(201).json({ message: "Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất có thể." });
  } catch (error) {
    console.error("contact submit error:", error?.message || error);
    return res.status(500).json({ message: "Gửi tin nhắn thất bại. Vui lòng thử lại sau." });
  }
}

module.exports = {
  submitContact,
};
