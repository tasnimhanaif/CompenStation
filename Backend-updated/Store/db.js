require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function getSslConfig() {
  const certificatePath = process.env.DB_SSL_CA_PATH;

  if (!certificatePath) {
    return undefined;
  }

  const resolvedCertificatePath = path.isAbsolute(certificatePath)
    ? certificatePath
    : path.resolve(__dirname, "..", certificatePath);

  return {
    ca: fs.readFileSync(resolvedCertificatePath, "utf8"),
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: getSslConfig(),
});

module.exports = pool;