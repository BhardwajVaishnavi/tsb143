/**
 * Server runner with request logging
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const PORT = 5001;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://tsb143.vercel.app'],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy all requests to the actual server
app.all('*', (req, res) => {
  const url = `http://localhost:5002${req.url}`;
  console.log(`Proxying request to: ${url}`);

  // Forward the request to the actual server
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...req.headers
    },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
  };

  fetch(url, options)
    .then(response => {
      // Copy status and headers
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      return response.text();
    })
    .then(body => {
      res.send(body);
      console.log(`Response sent for ${req.method} ${req.url}`);
    })
    .catch(error => {
      console.error(`Error proxying request: ${error.message}`);
      res.status(500).json({ error: 'Proxy error' });
    });
});

// Start the proxy server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);

  // Start the actual server on a different port
  exec('node server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Server stderr: ${stderr}`);
      return;
    }
    console.log(`Server stdout: ${stdout}`);
  });
});
