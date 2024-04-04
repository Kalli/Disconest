import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = Object
const discogsApiUrl = process.env.DISCOGS_API_URL || 'https://api.discogs.com';
const discogsHeaders = {
    'User-Agent': 'Disconest/1.0 +http://www.disconest.com',
}
// makes the relevant requests to the discogs api based on query parameters
const discogsApiHandler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    if (req.query['q']){
        // discogs database search
        let discogsSearchQuery = req.query['q'].toString() || '';
        const path = `/database/search?q=${encodeURIComponent(discogsSearchQuery)}&token=${process.env.DISCOGS_TOKEN}`;
        const discogsApiResponse = await fetch(discogsApiUrl + path, { headers: discogsHeaders });
        const discogsApiResponseJson = await discogsApiResponse.json();
        // filter to just release and master types
        res.status(200).json({
            // @ts-ignore
            results: discogsApiResponseJson.results.filter((result: any) => {
                return result.type == 'release' || result.type == 'master';
            })
        });
    } else if (req.query['release'] || req.query['master']){
        // discogs release or master
        const discogsReleaseId = req.query['release'] || req.query['master'];
        const releaseType = req.query['release'] ? 'releases' : 'masters';
        const path = `/${releaseType}/${discogsReleaseId}?token=${process.env.DISCOGS_TOKEN}`;
        const discogsApiResponse = await fetch(discogsApiUrl + path, { headers: discogsHeaders });
        const discogsApiResponseJson = await discogsApiResponse.json();
        res.status(200).json(discogsApiResponseJson);
    } else {
        // something went wrong
        res.status(401).json({error: 'No query parameters provided'});
    }
};

export default discogsApiHandler;