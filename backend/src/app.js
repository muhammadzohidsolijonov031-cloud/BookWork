require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("node:path");
const { clerkMiddleware, getAuth } = require("@clerk/express");
const communityRoutes = require("./routes/community.routes.js");

const app = express();

app.use(morgan("dev"));
const productionFrontendOrigin = "https://book-work-eight.vercel.app";
const frontendOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isLocalFrontend = (origin) => {
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      callback(
        null,
        !origin ||
          isLocalFrontend(origin) ||
          origin === productionFrontendOrigin ||
          frontendOrigins.includes(origin),
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(clerkMiddleware());
app.get("/whoami", (req, res) => {
  const { userId, sessionId, sessionClaims } = getAuth(req);
  res.json({
    success: true,
    data: {
      userId,
      sessionId,
      hasClaims: !!sessionClaims,
      authOnReq: req.auth ?? null,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});

const bookRoutes = require("./routes/book.routes.js");

app.get("/health", (req, res) => {
  res.json({
    success: true,

    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});

app.use("/books", bookRoutes);
app.use("/community", communityRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ZodError") {
    return res.status(400).json({ success: false, error: err.issues });
  }
  res.status(err.status || 500).json({ success: false, error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint topilmadi" });
});
module.exports = app;
