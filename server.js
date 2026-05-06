const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

addonInterface.then(resolvedInterface => {
    // Port 10000 is default for Render
    serveHTTP(resolvedInterface, { port: process.env.PORT || 10000 });
}).catch(err => {
    console.error("Failed to start:", err);
});
