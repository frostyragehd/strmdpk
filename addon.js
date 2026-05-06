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

function getPosterUrl(match) {
    if (match.poster) return `${API_BASE}/images/proxy/${match.poster}.webp`;
    if (match.teams?.home?.badge && match.teams?.away?.badge) {
        return `${API_BASE}/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`;
    }
    if (match.teams?.home?.badge) return `${API_BASE}/images/badge/${match.teams.home.badge}.webp`;
    return "https://placehold.co/600x400?text=Live+Sports";
}

async function initAddon() {
    const sports = await apiFetch('/sports');
    const catalogs = [{ type: "tv", id: "spk_live", name: "Live Now (All Sports)" }];

    sports.forEach(sport => {
        catalogs.push({ type: "tv", id: `spk_${sport.id}`, name: sport.name });
    });

    const builder = new addonBuilder({
        id: "org.streamedpk.ultimate.v5",
        version: "5.0.0",
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
        if (args.id.startsWith("pk:")) {
            const [_, source, sourceId] = args.id.split(":");
            const streamsData = await apiFetch(`/stream/${source}/${sourceId}`);
            
            return {
                streams: streamsData.map(s => ({
                    name: `SPK: ${s.source.toUpperCase()}`,
                    title: `${s.language} ${s.hd ? ' [HD]' : ''}\nStream #${s.streamNo}`,
                    externalUrl: s.embedUrl
                }))
            };
        }
        return { streams: [] };
    });

    return builder.getInterface();
}

module.exports = initAddon();
