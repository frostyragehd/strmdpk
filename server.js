const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

const port = process.env.PORT || 10000;

serveHTTP(addonInterface, { 
    port: port,
    host: '0.0.0.0'
});

console.log(`Addon version 7.0.0 active on port ${port}`);
