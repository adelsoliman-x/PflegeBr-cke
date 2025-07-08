const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient"); // افترضنا إنك عامل ملف client.js بيربط بـ Prisma

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // 👇 التحقق من الاشتراك
    const subscription = await prisma.subscription.findUnique({
      where: { userId: decoded.userId },
    });

    if (
      !subscription ||
      subscription.status !== "active" ||
      new Date(subscription.expiryDate) < new Date()
    ) {
      return res.status(403).json({ message: "الاشتراك غير مفعل أو منتهي" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
