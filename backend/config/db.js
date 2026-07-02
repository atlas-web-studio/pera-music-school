import mongoose from "mongoose";

const RETRY_DELAY_MS = 10_000;
let reconnectTimer = null;
let isConnecting = false;
let hasRegisteredListeners = false;
let lastConnectionError = "";
let lastDisconnectedAt = "";

const READY_STATE_LABELS = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus() {
  const readyState = mongoose.connection.readyState;

  return {
    connected: readyState === 1,
    readyState,
    state: READY_STATE_LABELS[readyState] || "unknown",
    lastConnectionError,
    lastDisconnectedAt,
  };
}

function clearReconnectTimer() {
  if (!reconnectTimer) {
    return;
  }

  clearTimeout(reconnectTimer);
  reconnectTimer = null;
}

function scheduleReconnect(reason = "unknown reason") {
  if (!process.env.MONGO_URI || reconnectTimer || isConnecting) {
    return;
  }

  const readyState = mongoose.connection.readyState;

  if (readyState === 1 || readyState === 2) {
    return;
  }

  console.warn(
    `MongoDB unavailable (${reason}). Retrying in ${RETRY_DELAY_MS / 1000} seconds.`
  );

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectDB();
  }, RETRY_DELAY_MS);
}

function registerConnectionListeners() {
  if (hasRegisteredListeners) {
    return;
  }

  hasRegisteredListeners = true;

  mongoose.connection.on("connected", () => {
    lastConnectionError = "";
    clearReconnectTimer();
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    lastConnectionError = error?.message || String(error);
    console.error("MongoDB connection error:", error?.message || error);
    scheduleReconnect("connection error");
  });

  mongoose.connection.on("disconnected", () => {
    lastDisconnectedAt = new Date().toISOString();
    console.warn("MongoDB disconnected");
    scheduleReconnect("disconnect event");
  });
}

const connectDB = async () => {
  registerConnectionListeners();

  if (!process.env.MONGO_URI) {
    lastConnectionError = "MONGO_URI is not configured.";
    console.error("DB connection error: MONGO_URI is not configured.");
    return false;
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose.connection.readyState === 1;
  }

  isConnecting = true;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: process.env.NODE_ENV === "production" ? 10_000 : 5_000,
      bufferCommands: false,
    });
    return true;
  } catch (error) {
    lastConnectionError = error?.message || String(error);
    console.error("DB connection error:", error?.message || error);
    scheduleReconnect("initial connection failure");
    return false;
  } finally {
    isConnecting = false;
  }
};

export default connectDB;
