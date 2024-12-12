// const express = require('express');
// const routes = require('./routes/crud');
// const app = express();

const cors = require('cors');
const jsonServer = require('json-server');
const app = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use the environment variable PORT or default to 8080
const port = process.env.PORT || 8080;

// List of allowed origins (including ports)
const allowedOrigins = ['http://localhost:3000', 'https://jtrapp18.github.io/english-study-curriculum-mgmt'];

// Configure CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

// app.use(express.json());

app.use(middlewares);
app.use(router);

// Catch-all error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});