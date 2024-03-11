import * as http from 'https';
import { RequestOptions } from 'http';

// Define a type for the postData parameter which can be a string or Buffer
type PostData = string | Buffer;

function httpRequestAsync(options: RequestOptions, postData?: PostData): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            // Handle HTTP response
            let data = '';
            res.on('data', (chunk: any) => {
                data += chunk;
            });
            res.on('end', () => resolve(JSON.parse(data)));
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        // Write data to request body if POST method is used
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

export async function makeRequest(options : RequestOptions, postData?: PostData): Promise<Record<string, unknown>> {
    try {
        const response = await httpRequestAsync(options, postData);
        return response;
    } catch (error) {
        console.error(error);
        return {};
    }
}