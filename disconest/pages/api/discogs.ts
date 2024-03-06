import type { NextApiRequest, NextApiResponse } from 'next'
import { makeRequest } from '../requests';
type ResponseData = Object

// performs a discogs search for a query
export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    let discogsSearchQuery = req.query['q'] || '';
    var options = {
        protocol: 'https:',
        hostname: 'api.discogs.com',
        path: `/database/search?q=${discogsSearchQuery}&token=${process.env.DISCOGS_TOKEN}&type=master`,
        headers: {
            'User-Agent': 'Disconest/1.0 +http://www.disconest.com',
        },
    };
    const discogsApiResponse = await makeRequest(options);
    res.status(200).json(discogsApiResponse);
};