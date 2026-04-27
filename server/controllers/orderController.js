const Order = require("../models/Order");
const Product = require("../models/Product");
const nodemailer = require("nodemailer");
const env = require("../config/env");
const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop";

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

async function sendOrderConfirmationEmail({ to, orderNumber, shippingCode, paymentMethod, shippingAddress, total, items }) {
  if (!isMailerConfigured() || !to) return;

  const transporter = createTransporter();
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const estimatedDeliveryText = estimatedDelivery.toLocaleDateString("vi-VN");
  const paymentLabel = getPaymentMethodLabel(paymentMethod);
  const itemLines = items.map((item) => `- ${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}`).join("\n");

  const subject = `Glow | Xác nhận đơn hàng ${orderNumber}`;
  const text = `Xin chào ${shippingAddress.name},

Đơn hàng của bạn đã được ghi nhận thành công.
Mã đơn: ${orderNumber}
Mã vận chuyển: ${shippingCode}
Phương thức thanh toán: ${paymentLabel}
Tổng thanh toán: $${Number(total).toFixed(2)}
Ngày giao dự kiến: ${estimatedDeliveryText}

Sản phẩm:
${itemLines}

Địa chỉ nhận hàng:
${shippingAddress.name} - ${shippingAddress.phone}
${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.zipCode}, ${shippingAddress.country}

Vui lòng giữ email này để tiện theo dõi đơn hàng.
`;

  const htmlItems = items
    .map(
      (item) =>
        `<li>${item.name} x${item.quantity} - <strong>$${(item.price * item.quantity).toFixed(2)}</strong></li>`
    )
    .join("");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2>Xác nhận đơn hàng ${orderNumber}</h2>
      <p>Xin chào <strong>${shippingAddress.name}</strong>, đơn hàng của bạn đã được ghi nhận thành công.</p>
      <p>
        <strong>Mã vận chuyển:</strong> ${shippingCode}<br/>
        <strong>Phương thức thanh toán:</strong> ${paymentLabel}<br/>
        <strong>Tổng thanh toán:</strong> $${Number(total).toFixed(2)}<br/>
        <strong>Ngày giao dự kiến:</strong> ${estimatedDeliveryText}
      </p>
      <p><strong>Sản phẩm:</strong></p>
      <ul>${htmlItems}</ul>
      <p>
        <strong>Địa chỉ nhận hàng:</strong><br/>
        ${shippingAddress.name} - ${shippingAddress.phone}<br/>
        ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.zipCode}, ${shippingAddress.country}
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

    if (
      !shippingAddress?.name ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.zipCode ||
      !shippingAddress?.country
    ) {
      return res.status(400).json({ message: "Shipping information is incomplete" });
    }
    if (!/^[0-9+\-() ]{8,20}$/.test(String(shippingAddress.phone).trim())) {
      return res.status(400).json({ message: "Phone number format is invalid" });
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
        name: String(shippingAddress.name).trim(),
        phone: String(shippingAddress.phone).trim(),
        address: String(shippingAddress.address).trim(),
        city: String(shippingAddress.city).trim(),
        zipCode: String(shippingAddress.zipCode).trim(),
        country: String(shippingAddress.country).trim(),
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

    return res.status(201).json({
      message: "Order created successfully",
      order: formatOrder(order),
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
