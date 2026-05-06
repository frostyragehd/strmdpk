const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const API_BASE = "https://streamed.pk/api";

// 1. Static Manifest for instant startup
const manifest = {
    id: "org.streamedpk.ultimate.v7",
    version: "7.0.0",
    name: "Streamed.pk Ultimate",
    description: "Live NBA, MLB, NHL, Football & more",
    resources: ["catalog", "stream"],
    types: ["tv"],
    idPrefixes: ["pk:"],
    catalogs: [
        { type: "tv", id: "spk_live", name: "Live Now (All Sports)" },
        { type: "tv", id: "spk_football", name: "Football" },
        { type: "tv", id: "spk_basketball", name: "Basketball" },
        { type: "tv", id: "spk_hockey", name: "Hockey" },
        { type: "tv", id: "spk_baseball", name: "Baseball" }
    ]
};

const builder = new addonBuilder(manifest);

// Helper for images: Handles Proxy, Posters, and Badges from your API docs
function getPosterUrl(match) {
    if (match.poster) return `${API_BASE}/images/proxy/${match.poster}.webp`;
    if (match.teams?.home?.badge && match.teams?.away?.badge) {
        return `${API_BASE}/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`;
    }
    if (match.teams?.home?.badge) return `${API_BASE}/images/badge/${match.teams.home.badge}.webp`;
    return "https://placehold.co/600x400?text=Live+Sports";
}

// 2. Catalog Handler
builder.defineCatalogHandler(async (args) => {
    let endpoint = "/matches/live";
    if (args.id !== "spk_live") {
        endpoint = `/matches/${args.id.replace("spk_", "")}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const matches = await response.json();
        
        const metas = matches.filter(m => m.sources && m.sources.length > 0).map(match => ({
            id: `pk:${match.sources[0].source}:${match.sources[0].id}`,
            type: "tv",
            name: match.title,
            poster: getPosterUrl(match),
            background: getPosterUrl(match),
            description: `${match.category.toUpperCase()} | Live`
        }));
        
        return { metas };
    } catch (e) {
        console.error("Catalog Error:", e);
        return { metas: [] };
    }
});

// 3. Stream Handler
builder.defineStreamHandler(async (args) => {
    if (args.id.startsWith("pk:")) {
        const [_, source, sourceId] = args.id.split(":");
        try {
            const response = await fetch(`${API_BASE}/stream/${source}/${sourceId}`);
            const streamsData = await response.json();
            
            return {
                streams: streamsData.map(s => ({
                    name: `SPK: ${source.toUpperCase()}`,
                    title: `${s.language || 'English'} ${s.hd ? '[HD]' : '[SD]'} - Stream #${s.streamNo}`,
                    externalUrl: s.embedUrl
                }))
            };
        } catch (e) {
            console.error("Stream Error:", e);
            return { streams: [] };
        }
    }
    return { streams: [] };
});

module.exports = builder.getInterface();
