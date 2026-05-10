import express from "express";
import cors from "cors";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";
import { me } from "./routes/me.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const PORT = process.env.API_PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, allowedOrigins[0]);
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  }),
);

app.use(express.json());

app.use("/", health);
app.use("/", auth);
app.use("/", me);

app.use((req, res) =>
  res.status(404).json({ error: { code: "not_found", message: "Route not found" } }),
);

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FlickBolt API running on port ${PORT}`);
});
