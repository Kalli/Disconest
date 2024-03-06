import * as http from 'https';
import { RequestOptions } from 'http';

// Define a type for the postData parameter which can be a string or Buffer
type PostData = string | Buffer;

function httpRequestAsync(options: RequestOptions, postData?: PostData): Promise<string> {
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

export async function makeRequest(options : RequestOptions): Promise<string> {
    try {
        const response: string = await httpRequestAsync(options);
        return response;
    } catch (error) {
        console.error(error);
        return '';
    }
}