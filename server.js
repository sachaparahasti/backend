const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL Connection
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

con.connect((error) => {
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("Connected to MySQL database successfully!");
  }
});

// Base route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// API base
const ROUTE = "/api/enquiries";

// CREATE
app.post(ROUTE, (req, res) => {
  const { clientName, projectName, phone, description, budget, links } = req.body;

  if (!clientName || !projectName || !phone || !description || !budget) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  const sql = `
    INSERT INTO enquiries 
    (clientName, projectName, phone, description, budget, links, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  con.query(sql, [clientName, projectName, phone, description, budget, links || ""], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed to save enquiry" });
    }
    res.status(201).json({ success: true, id: result.insertId });
  });
});

// READ
app.get(ROUTE, (req, res) => {
  const sql = "SELECT * FROM enquiries ORDER BY createdAt DESC";

  con.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: results });
  });
});

// DELETE
app.delete(`${ROUTE}/:id`, (req, res) => {
  const sql = "DELETE FROM enquiries WHERE id = ?";
  con.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false });
    res.json({ success: true });
  });
});

// UPDATE
app.put(`${ROUTE}/:id`, (req, res) => {
  const { clientName, projectName, phone, description, budget, links } = req.body;

  const sql = `
    UPDATE enquiries 
    SET clientName=?, projectName=?, phone=?, description=?, budget=?, links=?
    WHERE id=?
  `;

  con.query(
    sql,
    [clientName, projectName, phone, description, budget, links || "", req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false });
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false });
      res.json({ success: true });
    }
  );
});

// START SERVER (Render-safe)
// server port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
