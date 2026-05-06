const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const API_BASE = "https://streamed.pk/api";

async function apiFetch(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        return res.ok ? await res.json() : [];
    } catch (e) {
        console.error(`API Error: ${endpoint}`, e);
        return [];
    }
}

// Fixed Image Logic based on your docs
function getPosterUrl(match) {
    if (match.poster) return `${API_BASE}/images/proxy/${match.poster}.webp`;
    if (match.teams?.home?.badge && match.teams?.away?.badge) {
        return `${API_BASE}/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`;
    }
    return "https://placehold.co/600x400?text=Live+Sports";
}

async function initAddon() {
    const sports = await apiFetch('/sports');
    const catalogs = [{ type: "tv", id: "spk_live", name: "Live Now (All Sports)" }];

    sports.forEach(sport => {
        catalogs.push({ type: "tv", id: `spk_${sport.id}`, name: sport.name });
    });

    const builder = new addonBuilder({
        id: "org.streamedpk.ultimate.v3", // Changed ID to force Stremio to refresh
        version: "3.0.0",
        name: "Streamed.pk Ultimate",
        description: "Live NBA, MLB, NHL, Football & more",
        resources: ["catalog", "stream"],
        types: ["tv"],
        catalogs: catalogs
    });

    builder.defineCatalogHandler(async (args) => {
        let endpoint = (args.id === "spk_live") ? '/matches/live' : `/matches/${args.id.replace("spk_", "")}`;
        const matches = await apiFetch(endpoint);
        
        return {
            metas: matches.filter(m => m.sources?.length > 0).map(match => ({
                // CRITICAL: This ID must match what the Stream Handler looks for
                id: `pk:${match.sources[0].source}:${match.sources[0].id}`,
                type: "tv",
                name: match.title,
                poster: getPosterUrl(match),
                background: getPosterUrl(match),
                description: `${match.category.toUpperCase()} | Live`
            }))
        };
    });

    builder.defineStreamHandler(async (args) => {
        // args.id will look like "pk:alpha:match123"
        if (args.id.startsWith("pk:")) {
            const [_, source, sourceId] = args.id.split(":");
            const streamsData = await apiFetch(`/stream/${source}/${sourceId}`);
            
            return {
                streams: streamsData.map(s => ({
                    name:
