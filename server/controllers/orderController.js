const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { computePointsEarned, findNewlyUnlockedTiers } = require("../utils/loyalty");
const nodemailer = require("nodemailer");
const env = require("../config/env");
const { normalizePhoneInput, isValidPhoneNormalized } = require("../utils/phone");
const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop";
const { formatVnd } = require("../utils/currency");

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

function getPaymentMethodLabel(method) {
  if (method === "cod") return "Thanh toán khi nhận hàng (COD)";
  if (method === "bank_transfer") return "Chuyển khoản ngân hàng";
  return "Thẻ ngân hàng";
}

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
}

function getAfterSalesGuideForCategory(category) {
  const c = normalizeCategory(category);

  if (c.includes("cleanser") || c.includes("sữa rửa") || c.includes("clean gel")) {
    return {
      howTo: [
        "Làm ướt mặt, lấy lượng vừa đủ, tạo bọt (nếu có) và massage 30–60 giây.",
        "Rửa lại với nước, lau khô nhẹ nhàng.",
        "Dùng 1–2 lần/ngày (sáng và/hoặc tối).",
      ],
      cautions: [
        "Tránh để sản phẩm vào mắt; nếu dính mắt hãy rửa kỹ với nước.",
        "Nếu da khô căng, giảm tần suất hoặc dùng thêm kem dưỡng phục hồi.",
      ],
    };
  }

  if (c.includes("toner") || c.includes("essence")) {
    return {
      howTo: [
        "Sau rửa mặt, cho vài giọt ra tay/bông và vỗ nhẹ lên da.",
        "Dùng sáng & tối; ưu tiên lớp mỏng và có thể lặp 1–2 lớp nếu da khô.",
      ],
      cautions: [
        "Nếu có AHA/BHA, dùng từ từ (2–3 lần/tuần) rồi tăng dần theo khả năng chịu đựng.",
        "Ban ngày luôn dùng kem chống nắng.",
      ],
    };
  }

  if (c.includes("serum")) {
    return {
      howTo: [
        "Dùng sau toner/essence, 2–4 giọt cho toàn mặt, vỗ nhẹ đến khi thấm.",
        "Ưu tiên dùng theo routine: sáng (dưỡng ẩm/niacinamide) hoặc tối (treatment).",
      ],
      cautions: [
        "Nếu có hoạt chất mạnh (retinol/vitamin C), nên test trước ở vùng nhỏ 24–48h.",
        "Không dùng chung nhiều hoạt chất mạnh cùng lúc khi mới bắt đầu; ưu tiên tăng dần tần suất.",
      ],
    };
  }

  if (c.includes("moisturizer") || c.includes("cream") || c.includes("night")) {
    return {
      howTo: [
        "Dùng sau serum, lấy lượng vừa đủ thoa đều mặt và cổ.",
        "Buổi tối có thể dùng dày hơn ở vùng khô (khóa ẩm).",
      ],
      cautions: [
        "Nếu có retinol, tránh dùng cùng lúc với AHA/BHA khi mới bắt đầu.",
        "Ngưng dùng nếu kích ứng kéo dài và liên hệ hỗ trợ.",
      ],
    };
  }

  if (c.includes("sunscreen") || c.includes("spf") || c.includes("chống nắng")) {
    return {
      howTo: [
        "Dùng bước cuối buổi sáng. Thoa lượng đủ (2 ngón tay cho mặt/cổ).",
        "Thoa lại mỗi 2–3 giờ khi hoạt động ngoài trời/đổ mồ hôi/lau mặt.",
      ],
      cautions: [
        "Không thay thế kem chống nắng bằng makeup có SPF.",
        "Nếu da dễ kích ứng, thử lượng nhỏ trước khi dùng toàn mặt.",
      ],
    };
  }

  if (c.includes("mask") || c.includes("mặt nạ")) {
    return {
      howTo: [
        "Dùng sau rửa mặt/toner. Thoa lớp mỏng đều, tránh vùng mắt.",
        "Để 10–15 phút rồi rửa sạch (hoặc theo hướng dẫn trên bao bì).",
        "Dùng 1–3 lần/tuần tùy nhu cầu da.",
      ],
      cautions: [
        "Không để mặt nạ khô căng quá lâu (đặc biệt mask đất sét) để tránh khô da.",
        "Giảm tần suất nếu có dấu hiệu kích ứng/đỏ rát.",
      ],
    };
  }

  if (c.includes("lip")) {
    return {
      howTo: [
        "Tẩy tế bào chết môi 1–2 lần/tuần; sau đó dùng son dưỡng hằng ngày.",
        "Thoa lại khi môi khô hoặc trước khi ngủ.",
      ],
      cautions: ["Tránh chà xát mạnh khi môi đang nứt/rách.", "Ngưng dùng nếu có kích ứng."],
    };
  }

  return {
    howTo: ["Dùng theo routine chăm sóc da phù hợp và theo hướng dẫn trên bao bì."],
    cautions: ["Ngưng dùng nếu có kích ứng kéo dài và liên hệ hỗ trợ."],
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendOrderConfirmationEmail({ to, orderNumber, shippingCode, paymentMethod, shippingAddress, total, items }) {
  if (!isMailerConfigured() || !to) return;

  const transporter = createTransporter();
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const estimatedDeliveryText = estimatedDelivery.toLocaleDateString("vi-VN");
  const paymentLabel = getPaymentMethodLabel(paymentMethod);
  const itemLines = items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatVnd(item.price * item.quantity)}`)
    .join("\n");

  const subject = `Glow | Xác nhận đơn hàng ${orderNumber}`;
  const text = `Xin chào ${shippingAddress.name},

Đơn hàng của bạn đã được ghi nhận thành công.
Mã đơn: ${orderNumber}
Mã vận chuyển: ${shippingCode}
Phương thức thanh toán: ${paymentLabel}
Tổng thanh toán: ${formatVnd(Number(total))}
Ngày giao dự kiến: ${estimatedDeliveryText}

Sản phẩm:
${itemLines}

Nhằm hỗ trợ sử dụng sản phẩm tốt nhất, vui lòng xem phần hướng dẫn sử dụng trong email tiếp theo chúng tôi gửi tới bạn (cùng địa chỉ email này).

Địa chỉ nhận hàng:
${shippingAddress.name} - ${shippingAddress.phone}
${shippingAddress.address}, ${shippingAddress.district || shippingAddress.zipCode || ""}, ${shippingAddress.city}, ${shippingAddress.country}

Vui lòng giữ email này để tiện theo dõi đơn hàng.
`;

  const htmlItems = items
    .map(
      (item) =>
        `<li>${item.name} x${item.quantity} - <strong>${formatVnd(item.price * item.quantity)}</strong></li>`
    )
    .join("");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2>Xác nhận đơn hàng ${orderNumber}</h2>
      <p>Xin chào <strong>${shippingAddress.name}</strong>, đơn hàng của bạn đã được ghi nhận thành công.</p>
      <p>
        <strong>Mã vận chuyển:</strong> ${shippingCode}<br/>
        <strong>Phương thức thanh toán:</strong> ${paymentLabel}<br/>
        <strong>Tổng thanh toán:</strong> ${formatVnd(Number(total))}<br/>
        <strong>Ngày giao dự kiến:</strong> ${estimatedDeliveryText}
      </p>
      <p><strong>Sản phẩm:</strong></p>
      <ul>${htmlItems}</ul>
      <p style="margin: 14px 0; padding: 12px; background: #fff7f9; border: 1px solid #f0d6dd; border-radius: 10px; color: #444;">
        Nhằm hỗ trợ sử dụng sản phẩm tốt nhất, vui lòng xem phần hướng dẫn sử dụng trong <strong>email tiếp theo</strong> chúng tôi gửi tới bạn (cùng địa chỉ email này).
      </p>
      <p>
        <strong>Địa chỉ nhận hàng:</strong><br/>
        ${shippingAddress.name} - ${shippingAddress.phone}<br/>
        ${shippingAddress.address}, ${shippingAddress.district || shippingAddress.zipCode || ""}, ${shippingAddress.city}, ${shippingAddress.country}
      </p>
      <p>Vui lòng giữ email này để tiện theo dõi đơn hàng.</p>
    </div>
  `;

  await transporter.sendMail({
    from: env.newsletterFromEmail,
    to,
    replyTo: env.newsletterReplyTo || env.newsletterFromEmail,
    subject,
    text,
    html,
  });
}

async function sendAfterSalesGuideEmail({ to, orderNumber, items, customerName }) {
  if (!isMailerConfigured() || !to) return;

  const transporter = createTransporter();
  const afterSalesLines = items
    .map((item) => {
      const guide = getAfterSalesGuideForCategory(item.category);
      const howTo = guide.howTo.map((line) => `  • ${line}`).join("\n");
      const cautions = guide.cautions.map((line) => `  • ${line}`).join("\n");
      return `\n${item.name}:\nHướng dẫn sử dụng:\n${howTo}\nLưu ý:\n${cautions}\n`;
    })
    .join("\n");

  const subject = `Glow | Hướng dẫn sử dụng cho đơn ${orderNumber}`;
  const text = `Xin chào ${customerName || "bạn"},

Cảm ơn bạn đã mua hàng tại Glow. Dưới đây là hướng dẫn sử dụng & lưu ý (dịch vụ hậu mãi) cho các sản phẩm trong đơn ${orderNumber}:
${afterSalesLines}

Nếu bạn cần tư vấn theo tình trạng da, hãy phản hồi email này để được hỗ trợ.
`;

  const htmlAfterSales = items
    .map((item) => {
      const guide = getAfterSalesGuideForCategory(item.category);
      const howTo = guide.howTo.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
      const cautions = guide.cautions.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
      return `
        <div style="padding: 12px; border: 1px solid #f0d6dd; border-radius: 10px; margin: 12px 0; background: #fff7f9;">
          <p style="margin: 0 0 8px 0;"><strong>${escapeHtml(item.name)}</strong></p>
          <p style="margin: 0 0 6px 0;"><strong>Hướng dẫn sử dụng</strong></p>
          <ul style="margin: 0 0 10px 18px; padding: 0;">${howTo}</ul>
          <p style="margin: 0 0 6px 0;"><strong>Lưu ý</strong></p>
          <ul style="margin: 0 0 0 18px; padding: 0;">${cautions}</ul>
        </div>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2>Hướng dẫn sử dụng & lưu ý</h2>
      <p>Xin chào <strong>${escapeHtml(customerName || "bạn")}</strong>, cảm ơn bạn đã mua hàng tại Glow.</p>
      <p style="margin: 0 0 10px 0; color: #444;">
        Đây là hướng dẫn nhanh theo nhóm sản phẩm cho đơn <strong>${escapeHtml(orderNumber)}</strong>. Nếu bạn cần tư vấn theo tình trạng da, hãy phản hồi email này để được hỗ trợ.
      </p>
      ${htmlAfterSales}
    </div>
  `;

  await transporter.sendMail({
    from: env.newsletterFromEmail,
    to,
    replyTo: env.newsletterReplyTo || env.newsletterFromEmail,
    subject,
    text,
    html,
  });
}

function formatOrder(order) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  return {
    id: order.orderNumber,
    date: createdAt ? createdAt.toISOString().split("T")[0] : "",
    placedAt: createdAt ? createdAt.toISOString() : null,
    shippingCode: order.shippingCode || "",
    items: order.items.map((item) => ({
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      },
      quantity: item.quantity,
    })),
    total: order.total,
    paymentMethod: order.paymentMethod || "card",
    status: order.status,
    shippingAddress: order.shippingAddress,
    user: order.userId && typeof order.userId === "object" && order.userId.email
      ? {
          id: order.userId._id.toString(),
          name: order.userId.name,
          email: order.userId.email,
        }
      : undefined,
  };
}

async function createOrder(req, res) {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const name = String(shippingAddress?.name ?? "").trim();
    const address = String(shippingAddress?.address ?? "").trim();
    const district = String(shippingAddress?.district ?? "").trim();
    const city = String(shippingAddress?.city ?? "").trim();
    const country = String(shippingAddress?.country ?? "").trim();
    const normalizedPhone = normalizePhoneInput(shippingAddress?.phone);

    const missing = [];
    if (!name) missing.push("name");
    if (!normalizedPhone) missing.push("phone");
    if (!address) missing.push("address");
    if (!district) missing.push("district");
    if (!city) missing.push("city");
    if (!country) missing.push("country");
    if (missing.length > 0) {
      return res.status(400).json({
        message: "Thông tin giao hàng chưa đủ (kiểm tra lại bước 1: họ tên, SĐT, địa chỉ, quận/huyện, TP, quốc gia).",
        missing,
      });
    }
    if (district.length < 2) {
      return res.status(400).json({ message: "Quận / huyện không hợp lệ (quá ngắn hoặc trống)." });
    }
    if (!isValidPhoneNormalized(normalizedPhone)) {
      return res.status(400).json({ message: "Số điện thoại không đúng định dạng." });
    }

    const normalizedItems = items
      .map((item) => ({
        productId: Number(item?.product?.id),
        name: item?.product?.name || "Product",
        price: Number(item?.product?.price || 0),
        image: item?.product?.image || FALLBACK_PRODUCT_IMAGE,
        category: item?.product?.category || "General",
        quantity: Number(item?.quantity || 1),
      }))
      .filter((item) => Number.isFinite(item.productId) && item.productId > 0 && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: "Order items are invalid" });
    }

    const validPaymentMethods = ["card", "cod", "bank_transfer"];
    const normalizedPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : "card";

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal > 50 ? 0 : 5.99;
    const computedTotal = Number((subtotal + shippingFee).toFixed(2));

    // Atomically decrement stock for each item (prevent overselling).
    // Note: If a later item fails, we roll back previous decrements.
    const decremented = [];
    for (const item of normalizedItems) {
      const updated = await Product.findOneAndUpdate(
        { id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, projection: { id: 1, name: 1, stock: 1 } }
      ).lean();

      if (!updated) {
        await Promise.all(
          decremented.map((prev) => Product.updateOne({ id: prev.productId }, { $inc: { stock: prev.quantity } }))
        );
        const productMeta = await Product.findOne({ id: item.productId }, { name: 1, stock: 1 }).lean();
        return res.status(400).json({
          message: productMeta
            ? `Not enough stock for ${productMeta.name}. Available: ${Number(productMeta.stock || 0)}`
            : `Product ${item.productId} is unavailable`,
        });
      }
      decremented.push({ productId: item.productId, quantity: item.quantity });
    }

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      shippingCode: `SHIP-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: req.user.id,
      items: normalizedItems,
      total: computedTotal,
      paymentMethod: normalizedPaymentMethod,
      status: "pending",
      shippingAddress: {
        name,
        phone: normalizedPhone,
        address,
        district,
        city,
        zipCode: "",
        country,
      },
    });

    sendOrderConfirmationEmail({
      to: req.user?.email || "",
      orderNumber: order.orderNumber,
      shippingCode: order.shippingCode,
      paymentMethod: normalizedPaymentMethod,
      shippingAddress: order.shippingAddress,
      total: order.total,
      items: order.items,
    }).catch((error) => {
      console.error("order confirmation email error:", error?.message || error);
    });

    sendAfterSalesGuideEmail({
      to: req.user?.email || "",
      orderNumber: order.orderNumber,
      items: order.items,
      customerName: order.shippingAddress?.name || req.user?.name || "",
    }).catch((error) => {
      console.error("after sales guide email error:", error?.message || error);
    });

    let loyalty = null;
    try {
      const buyer = await User.findById(req.user.id);
      if (buyer) {
        const prevPts = Number(buyer.loyaltyPoints || 0);
        const earned = computePointsEarned(computedTotal);
        buyer.loyaltyPoints = prevPts + earned;
        await buyer.save();
        const tiersUnlocked = findNewlyUnlockedTiers(prevPts, buyer.loyaltyPoints);
        loyalty = {
          pointsEarned: earned,
          totalPoints: buyer.loyaltyPoints,
          tiersUnlocked,
        };
      }
    } catch (err) {
      console.error("loyalty update error:", err?.message || err);
    }

    return res.status(201).json({
      message: "Order created successfully",
      order: formatOrder(order),
      ...(loyalty && { loyalty }),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order",
      detail: error instanceof Error ? error.message : undefined,
    });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json({ orders: orders.map(formatOrder) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ orders: orders.map(formatOrder) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findOneAndUpdate(
      { orderNumber: id },
      { status },
      { new: true }
    )
      .populate("userId", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      message: "Order status updated",
      order: formatOrder(order),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status" });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
