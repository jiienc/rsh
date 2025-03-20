require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
});

db.connect((err) => {
  if (err) console.error("DB Connection Error:", err);
  else console.log("Connected to MySQL");
});

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

app.post("/api/auth/register", upload.single("ktp"), async (req, res) => {
  const { email, password } = req.body;
  const ktp = req.file ? req.file.filename : null;

  if (!email || !password) return res.status(400).json({ error: "All fields are required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query("INSERT INTO users (email, password, ktp) VALUES (?, ?, ?)", [email, hashedPassword, ktp], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "User registered successfully" });
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

app.get("/api/auth/me", verifyToken, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
