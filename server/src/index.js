import express from "express";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";
import { me } from "./routes/me.js";
import { errorHandler } from "./middleware/error.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = join(__dirname, "../../_site");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/", health);
app.use("/", auth);
app.use("/", me);

app.use(express.static(SITE_DIR));

app.use((req, res, next) => {
  const candidate = join(SITE_DIR, req.path, "index.html");
  if (existsSync(candidate)) return res.sendFile(candidate);
  next();
});

app.use((req, res) =>
  res.status(404).send("Not found"),
);

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FlickBolt running on port ${PORT}`);
});
