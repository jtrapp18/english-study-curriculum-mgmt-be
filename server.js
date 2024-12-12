const cors = require('cors');
const jsonServer = require('json-server');
const app = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use the environment variable PORT or default to 8080
const port = process.env.PORT || 8080;

// List of allowed origins (including ports)
const allowedOrigins = [
  'http://localhost:3000', 
  'https://jtrapp18.github.io/english-study-curriculum-mgmt'
];

// Configure CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Include cookies or credentials if needed
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Use default json-server middlewares
app.use(middlewares);
app.use(router);

// Catch-all error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
