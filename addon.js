const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const manifest = {
    id: "org.sportsstream.pk",
    version: "1.0.0",
    name: "Live Sports Streams",
    description: "Live sports from streamed.pk",
    resources: ["catalog", "stream"],
    types: ["tv"],
    catalogs: [{ type: "tv", id: "sports_live", name: "Live Matches" }]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async () => {
    try {
        const res = await fetch('https://streamed.pk/api/matches/football');
        const matches = await res.json();
        
        const metas = matches.map(match => {
            // Use the provided image API for posters
            const posterUrl = match.poster 
                ? match.poster 
                : `https://streamed.pk/api/images/poster/${match.id}`;

            return {
                id: `pk:${match.sources[0].source}:${match.sources[0].id}`,
                type: "tv",
                name: match.title,
                poster: posterUrl,
                background: posterUrl,
                description: `Watch ${match.title} live.`
            };
        });
        
        return { metas };
    } catch (e) { 
        console.error(e);
        return { metas: [] }; 
    }
});

builder.defineStreamHandler(async (args) => {
    if (args.id.startsWith("pk:")) {
        const [_, source, id] = args.id.split(":");
        try {
            const res = await fetch(`https://streamed.pk/api/stream/${source}/${id}`);
            const streamsData = await res.json();
            return {
                streams: streamsData.map(s => ({
                    title: s.name,
                    url: s.url 
                }))
            };
        } catch (e) { return { streams: [] }; }
    }
    return { streams: [] };
});

module.exports = builder.getInterface();
