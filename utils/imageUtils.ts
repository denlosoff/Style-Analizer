/**
 * Helper function to convert a Response blob into a base64 data URL.
 * @param response The fetch Response object.
 * @returns A promise that resolves to the base64 data URL.
 */
async function processImageResponse(response: Response): Promise<string> {
    const blob = await response.blob();
    // The proxy might return a text error with a 200 OK status, so we check the blob type.
    if (!blob.type.startsWith('image/')) {
        throw new Error(`Fetched content is not an image. MIME type: ${blob.type}. The URL might be incorrect or the server returned an error page.`);
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(new Error('Failed to read blob as data URL. ' + error));
        reader.readAsDataURL(blob);
    });
}


/**
 * Fetches an image from a URL and converts it to a base64 data URL.
 * This is useful for storing images locally and avoiding CORS issues.
 * It uses a public CORS proxy to bypass browser restrictions.
 * @param url The URL of the image to fetch.
 * @returns A promise that resolves to the base64 data URL of the image.
 */
export async function fetchImageAsBase64(url: string): Promise<string> {
    // Using a reliable public proxy to bypass CORS.
    // The previous proxy `api.allorigins.win` might be blocked by some networks or CSPs.
    // `corsproxy.io` is another alternative.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

    try {
        // We are making a cross-origin request to the proxy server.
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            // The proxy itself might be down or returned an error.
            throw new Error(`Proxy server returned an error: ${response.status} ${response.statusText}`);
        }
        
        // The response from the proxy should be the image data.
        return await processImageResponse(response);

    } catch (error) {
        console.error("Image fetch failed:", error);
        
        // The `Failed to fetch` error in browsers is often generic for security reasons
        // (e.g., user is offline, DNS failure, CORS error, CSP block).
        // We provide a user-friendly message that covers the most likely scenarios.
        throw new Error(`Could not fetch image. This can happen if you are offline, the URL is invalid, or the server is protected by a strict security policy (CORS/CSP).`);
    }
}