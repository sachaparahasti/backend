const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Important for React frontend

const app = express();

// Middleware
app.use(cors()); // Allows React (localhost:3000) to access this API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "hasti@123", 
  database: "portfolio_db"
});

con.connect((error) => {
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("Connected to MySQL database successfully!");
  }
});

// Route base
const ROUTE = "/api/enquiries";

// CREATE - Insert new enquiry
app.post(ROUTE, (req, res) => {
  const { clientName, projectName, phone, description, budget, links } = req.body;

  if (!clientName || !projectName || !phone || !description || !budget) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  const sql = `INSERT INTO enquiries (clientName, projectName, phone, description, budget, links, createdAt) 
               VALUES (?, ?, ?, ?, ?, ?, NOW())`;

  con.query(sql, [clientName, projectName, phone, description, budget, links || ""], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed to save enquiry" });
    }
    res.status(201).json({ success: true, message: "Enquiry saved successfully", id: result.insertId });
  });
});

// READ - Get all enquiries
app.get(ROUTE, (req, res) => {
  const sql = "SELECT * FROM enquiries ORDER BY createdAt DESC";

  con.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
    }
    res.json({ success: true, data: results });
  });
});

// DELETE - Remove enquiry by ID
app.delete(`${ROUTE}/:id`, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM enquiries WHERE id = ?";

  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Delete failed" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, message: "Enquiry deleted successfully" });
  });
});

// UPDATE - Update enquiry by ID (optional)
app.put(`${ROUTE}/:id`, (req, res) => {
  const { id } = req.params;
  const { clientName, projectName, phone, description, budget, links } = req.body;

  const sql = `UPDATE enquiries 
               SET clientName=?, projectName=?, phone=?, description=?, budget=?, links=?
               WHERE id=?`;

  con.query(sql, [clientName, projectName, phone, description, budget, links || "", id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Update failed" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, message: "Enquiry updated successfully" });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});