const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

addonInterface.then(resolvedInterface => {
    serveHTTP(resolvedInterface, { port: process.env.PORT || 7000 });
}).catch(err => {
    console.error("Failed to start:", err);
});
