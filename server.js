const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

// The SDK's serveHTTP handles the manifest and landing page automatically
serveHTTP(addonInterface, { 
    port: process.env.PORT || 10000, 
    host: '0.0.0.0' 
});

console.log(`Addon active on port ${process.env.PORT || 10000}`);
