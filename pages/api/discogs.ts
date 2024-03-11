import type { NextApiRequest, NextApiResponse } from 'next'
import { makeRequest } from '../requests';

type ResponseData = Object

// makes the relevant requests to the discogs api based on query parameters
const discogsApiHandler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    // discogs search
    if (req.query['q']){
        let discogsSearchQuery = req.query['q'].toString() || '';
        const options = {
            protocol: 'https:',
            hostname: 'api.discogs.com',
            path: `/database/search?q=${encodeURIComponent(discogsSearchQuery)}&token=${process.env.DISCOGS_TOKEN}`,
            headers: {
                'User-Agent': 'Disconest/1.0 +http://www.disconest.com',
            },
        };
        const discogsApiResponse = await makeRequest(options);
        // filter to just release and master types
        res.status(200).json({
                // @ts-ignore
                results: discogsApiResponse.results.filter((result: any) => {
                    return result.type == 'release' || result.type == 'master';
                })
        });
        res.status(200).json(discogsApiResponse);
    }
    // discogs release
    if (req.query['release']){
        let discogsReleaseId = req.query['release'] || '';
        const options = {
            protocol: 'https:',
            hostname: 'api.discogs.com',
            path: `/releases/${discogsReleaseId}?token=${process.env.DISCOGS_TOKEN}`,
            headers: {
                'User-Agent': 'Disconest/1.0 +http://www.disconest.com',
            },
        };
        const discogsApiResponse = await makeRequest(options);
        res.status(200).json(discogsApiResponse);
    }    
    // discogs master
    if (req.query['master']){
        let discogsReleaseId = req.query['master'] || '';
        const options = {
            protocol: 'https:',
            hostname: 'api.discogs.com',
            path: `/masters/${discogsReleaseId}?token=${process.env.DISCOGS_TOKEN}`,
            headers: {
                'User-Agent': 'Disconest/1.0 +http://www.disconest.com',
            },
        };
        const discogsApiResponse = await makeRequest(options);
        res.status(200).json(discogsApiResponse);
    }
    res.status(200).json({});
};

export default discogsApiHandler;