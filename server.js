const cors = require('cors');
const jsonServer = require('json-server');
const app = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use the environment variable PORT or default to 8080
const port = process.env.PORT || 8080;

// Allow all origins temporarily (for debugging purposes)
app.use(cors());

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
