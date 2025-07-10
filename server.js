const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto-js');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');

// Configuration
const PORT = process.env.PORT || 15550;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'safevote-secret-key-2025';

// PostgreSQL setup
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'safevote',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432
});

// Helper: Encrypt Data
function encryptData(data) {
  return crypto.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

// Initialize Express App
const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mock Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // In real-world, query DB
  if (username === 'voter1' && password === 'pass1') {
    res.json({ message: 'Login successful', userId: 1 });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Submit Vote
app.post('/votes', async (req, res) => {
  const { userId, candidateId } = req.body;

  if (!userId || !candidateId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await pool.query(
      'INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)',
      [userId, candidateId]
    );

    const resultRes = await pool.query(
      'SELECT candidate_id, COUNT(*) FROM votes GROUP BY candidate_id'
    );

    const result = resultRes.rows.reduce((acc, row) => {
      acc[row.candidate_id] = parseInt(row.count);
      return acc;
    }, {});

    const encrypted = encryptData(result);

    await pool.query(
      'INSERT INTO results (encrypted_results) VALUES ($1) ON CONFLICT (id) DO UPDATE SET encrypted_results = $1',
      [encrypted]
    );

    res.json({ message: 'Vote submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Encrypted Results
app.get('/results', async (req, res) => {
  try {
    const result = await pool.query('SELECT encrypted_results FROM results ORDER BY updated_at DESC LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No results available yet' });
    }

    res.json({ encryptedResults: result.rows[0].encrypted_results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
let server;
if (require.main == module){
  server = app.listen(PORT, () => {
    console.log(`✅ SafeVote Backend running on http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = { app, server };
