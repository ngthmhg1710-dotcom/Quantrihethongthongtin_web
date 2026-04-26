const nodemailer = require("nodemailer");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");
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

function getWelcomeTemplate(email) {
  return {
    subject: "Glow | Đăng ký nhận ưu đãi thành công",
    text: `Xin chào ${email},

Cảm ơn bạn đã đăng ký nhận tin từ Glow.
Từ bây giờ, bạn sẽ nhận được mẹo chăm sóc da, thông báo sản phẩm mới và ưu đãi đặc biệt.

Nếu bạn không đăng ký, vui lòng bỏ qua email này.
`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
        <h2 style="margin-bottom: 12px;">Cảm ơn bạn đã tham gia cộng đồng Glow</h2>
        <p>Chúng tôi đã ghi nhận email <strong>${email}</strong>.</p>
        <p>Bạn sẽ nhận được mẹo chăm sóc da, thông báo sản phẩm mới và ưu đãi đặc biệt.</p>
        <p style="margin-top: 20px;">Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
      </div>
    `,
  };
}

async function subscribeNewsletter(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    if (!isMailerConfigured()) {
      return res.status(503).json({ message: "Dịch vụ email chưa được cấu hình trên server" });
    }

    const existing = await NewsletterSubscriber.findOne({ email }).lean();
    if (existing?.welcomeEmailSentAt) {
      return res.json({ message: "Email đã đăng ký trước đó" });
    }

    const transporter = createTransporter();
    const template = getWelcomeTemplate(email);

    await transporter.sendMail({
      from: env.newsletterFromEmail,
      to: email,
      replyTo: env.newsletterReplyTo || env.newsletterFromEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    if (existing) {
      await NewsletterSubscriber.updateOne(
        { _id: existing._id },
        { $set: { welcomeEmailSentAt: new Date(), source: "about_page" } }
      );
    } else {
      await NewsletterSubscriber.create({
        email,
        source: "about_page",
        welcomeEmailSentAt: new Date(),
      });
    }

    return res.status(201).json({ message: "Đăng ký thành công. Vui lòng kiểm tra email." });
  } catch (error) {
    console.error("newsletter subscribe error:", error?.message || error);
    return res.status(500).json({ message: "Đăng ký thất bại. Không gửi được email lúc này." });
  }
}

module.exports = {
  subscribeNewsletter,
};
