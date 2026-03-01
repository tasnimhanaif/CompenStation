const mysql = require("mysql2/promise");

// Connection pool (best practice for production)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "payroll_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;