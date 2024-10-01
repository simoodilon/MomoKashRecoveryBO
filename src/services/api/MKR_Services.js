import { BASE_URL } from '../endpoints.config';

export default async function MKR_Services(services, link, method, form, token) {
    let headers = {};
    let body;
    const url = BASE_URL[services] + link;

    if (form instanceof FormData) {
        headers = {
            Accept: 'application/json',
        };
        body = form;
    } else {
        headers = {
            'Accept': 'application/json',
            'Content-type': 'application/json;charset=UTF-8',
        };
        body = JSON.stringify(form);
    }

    if (token) {
        headers = { ...headers, Authorization: `Bearer ${token}` };
    }



    const requestConfig = {
        method: method,
        headers: headers,
    };

    if (method !== 'GET' && method !== 'HEAD') {
        requestConfig.body = body;
    }

    const request = new Request(url, requestConfig);

    console.log('url', url);

    try {
        const resp = await fetch(request);
        const data = await resp.json();
        return ApiResponse(resp.status, data);
    } catch (error) {
        console.error('Error:', error);
        return ApiResponse(500, { error: 'Internal Server Error' });
    }
}

function ApiResponse(status, data) {
    return {
        status: status,
        body: data,
    };
}
