const Order = require("../models/Order");
const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop";

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
    const { items, total, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!shippingAddress?.name || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.zipCode || !shippingAddress?.country) {
      return res.status(400).json({ message: "Shipping information is incomplete" });
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

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      shippingCode: `SHIP-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: req.user.id,
      items: normalizedItems,
      total: Number(total || 0),
      status: "processing",
      shippingAddress,
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
