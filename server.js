const express = require('express');
const cors = require('cors');
const routes = require('./routes/crud');

const app = express();
const port = process.env.PORT || 8080;

// List of allowed origins (including ports)
const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'https://jtrapp18.github.io/english-study-curriculum-mgmt'];

// Configure CORS
app.use(cors({
  origin: allowedOrigins, // Only allow these origins
}));
app.use(express.json());

// Mount routes
app.use('/', routes);

// Catch-all error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
