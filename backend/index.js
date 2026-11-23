const fs = require('fs');
const path = require('path');

// Auto-copy .env from .env.example if missing
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Skopiowano .env.example do .env w backendzie.');
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./db');
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const seedDatabase = require('./seeder');

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*'
}));

// Load OpenAPI / Swagger specification
let swaggerDocument;
const swaggerSpecPath = path.join(__dirname, '../docs/swagger.json');
const localSwaggerPath = path.join(__dirname, 'swagger.json');

if (fs.existsSync(swaggerSpecPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerSpecPath, 'utf8'));
} else if (fs.existsSync(localSwaggerPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(localSwaggerPath, 'utf8'));
}

// Serve Swagger specification JSON
app.get('/swagger.json', (req, res) => {
    if (swaggerDocument) {
        res.json(swaggerDocument);
    } else {
        res.status(404).json({ error: "Swagger specification not found" });
    }
});

// Swagger UI integration with fallback
try {
    const swaggerUi = require('swagger-ui-express');
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
    console.warn("ℹ️ swagger-ui-express not installed, serving CDN-based Swagger UI.");
    const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fishing Website API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
    app.get('/swagger', (req, res) => res.send(swaggerHtml));
    app.get('/api-docs', (req, res) => res.send(swaggerHtml));
}

// Redirect root to Swagger UI
app.get('/', (req, res) => {
    res.redirect('/swagger');
});

// Application Routes
app.use("/auth", authRoutes);
app.use("/api", userRoutes);

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connection();
        await seedDatabase();
        app.listen(port, () => {
            console.log(`Nasłuchiwanie na porcie ${port}`);
            console.log(`Dokumentacja Swagger UI: http://localhost:${port}/swagger`);
        });
    } catch (err) {
        console.error("Błąd podczas uruchamiania serwera:", err);
    }
};

startServer();
