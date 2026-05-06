const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

// Render uses the PORT environment variable
serveHTTP(addonInterface, { port: process.env.PORT || 7000 });
