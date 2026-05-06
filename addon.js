const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const manifest = {
    id: "org.sportsstream.pk",
    version: "1.0.5", // Incremented version
    name: "Streamed.pk Live Sports",
    description: "Live NBA, MLB, NHL, and Football from streamed.pk",
    resources: ["catalog", "stream"],
    types: ["tv"],
    catalogs: [{ type: "tv", id: "sports_all", name: "Popular Live Sports" }]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async () => {
    try {
        // Fetching ALL matches instead of just football
        const res = await fetch('https://streamed.pk/api/matches/all');
        const matches = await res.json();
        
        const metas = matches
            .filter(match => match.sources && match.sources.length > 0)
            .map(match => {
                // Use the API's poster or a generated one
                const posterUrl = match.poster || `https://streamed.pk/api/images/poster/${match.id}`;

                return {
                    id: `pk:${match.sources[0].source}:${match.sources[0].id}`,
                    type: "tv",
                    name: match.title,
                    poster: posterUrl,
                    background: posterUrl,
                    description: `${match.category || 'Sports'} - Live at ${match.time || 'now'}`
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
            // This fetches the actual video link
            const res = await fetch(`https://streamed.pk/api/stream/${source}/${id}`);
            const streamsData = await res.json();
            
            return {
                streams: streamsData.map(s => ({
                    name: "Streamed.pk",
                    title: s.name,
                    url: s.url // The direct .m3u8 link
                }))
            };
        } catch (e) { return { streams: [] }; }
    }
    return { streams: [] };
});

module.exports = builder.getInterface();
