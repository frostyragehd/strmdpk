builder.defineCatalogHandler(async () => {
    try {
        const res = await fetch('https://streamed.pk/api/matches/football');
        const matches = await res.json();
        
        const metas = matches.map(match => {
            // If the API provides a poster, we use it. 
            // Otherwise, we point to their image endpoint or a placeholder.
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
