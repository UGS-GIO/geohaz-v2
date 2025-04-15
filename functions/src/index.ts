import * as functions from "firebase-functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require("node-fetch");
import cors from "cors";
import { URLSearchParams } from "url";
import { Response as FetchResponse } from 'node-fetch';

// --- Secret Manager Client (Import commented out for now) ---
// import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// --- Load .env file ONLY when running in Firebase Emulator ---
if (process.env.FUNCTIONS_EMULATOR === 'true') {
    console.log("EMULATOR DETECTED: Loading .env variables...");
    try {
        // Use require here for simple conditional loading in CJS context
        require('dotenv').config();
        console.log(".env file loaded.");
    } catch (e) {
        console.warn("Could not load .env file (make sure dotenv is installed):", e);
    }
}

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// --- Configuration ---
const API_KEY_ENV_VAR = "UTAH_MAPSERV_API_KEY"; // Name for Environment Variable

const UTAH_GEOCODE_URL_TEMPLATE = "http://api.mapserv.utah.gov/api/v1/geocode/{street}/{zone}";


// Secret Manager Configuration (Ready for tomorrow)
// const SECRET_ID = "utah-mapserv-api-key";
// const GCP_PROJECT_ID = process.env.GCLOUD_PROJECT; // Get project ID from runtime env if needed by client/name construction
// const SECRET_VERSION_NAME = `projects/${GCP_PROJECT_ID}/secrets/${SECRET_ID}/versions/latest`;
// const secretManagerClient = new SecretManagerServiceClient(); // Instantiate client


// --- Modified getApiKey Function ---
async function getApiKey(): Promise<string> {

    // --- Environment Variable Logic (Active for Today's Local Testing) ---
    functions.logger.info("Attempting to retrieve API Key via Environment Variable...");
    const apiKey = process.env[API_KEY_ENV_VAR]; // Reads from process.env (populated by dotenv locally)
    console.log(`API Key from Environment Variable: ${apiKey}`); // Log the API key for debugging (remove in production)f


    if (!apiKey) {
        const errorMsg = `Environment variable ${API_KEY_ENV_VAR} is not set. Ensure it's in .env for local emulation or set in Cloud Function deployment config.`;
        functions.logger.error(errorMsg);
        throw new functions.https.HttpsError(
            'internal', // Error code
            'API key configuration error on the server.', // Generic message to client
            errorMsg // Detailed message for server logs
        );
    }
    functions.logger.info("Successfully retrieved API key from Environment Variable.");
    return apiKey;


    /*
    // --- Secret Manager Logic (Commented out for Tomorrow) ---
    functions.logger.info("Attempting to retrieve API Key via Secret Manager...");

    if (!GCP_PROJECT_ID) {
        functions.logger.error("Google Cloud Project ID environment variable (GCLOUD_PROJECT) is not set for Secret Manager.");
        throw new functions.https.HttpsError('internal', 'Server configuration error.');
    }
    try {
        functions.logger.log(`Accessing secret: ${SECRET_VERSION_NAME}`);
        const [version] = await secretManagerClient.accessSecretVersion({
            name: SECRET_VERSION_NAME,
        });

        // Extract the payload as a string.
        const secretApiKey = version.payload?.data?.toString('utf8'); // Specify encoding

        if (!secretApiKey) {
            throw new Error(`Secret payload is empty for ${SECRET_VERSION_NAME}. Ensure the secret value is set correctly.`);
        }
        functions.logger.log(`Successfully retrieved API key from Secret Manager (version: ${version.name?.split('/').pop()})`);
        return secretApiKey;

    } catch (error: any) {
        functions.logger.error(`Failed to access secret version ${SECRET_VERSION_NAME}:`, error);
        throw new functions.https.HttpsError(
            'internal',
            'Could not retrieve secure API key configuration.',
            // Only include detailed error message in logs, not sent to client usually
            error.message
        );
    }
    // --- End Secret Manager Logic ---
    */
}


// --- HTTP Cloud Function (No changes needed here) ---
export const geocodeProxy = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {

        if (request.method !== "GET") { /* ... */ response.status(405).send("Method Not Allowed"); return; }

        const street = request.query.street as string | undefined;
        const zone = request.query.zone as string | undefined;

        if (!street || !zone) { /* ... */ response.status(400).send("Missing query parameters: 'street' and 'zone'."); return; }

        let apiKey: string;
        try {
            apiKey = await getApiKey(); // This will now use the active logic (Env Var today)

            const encodedStreet = encodeURIComponent(street);
            const encodedZone = encodeURIComponent(zone);
            const targetUrlPath = UTAH_GEOCODE_URL_TEMPLATE.replace("{street}", encodedStreet).replace("{zone}", encodedZone);
            const targetQueryParams = new URLSearchParams();
            targetQueryParams.set('apiKey', apiKey);
            if (request.query.spatialReference) { targetQueryParams.set('spatialReference', request.query.spatialReference as string); }
            if (request.query.acceptScore) { targetQueryParams.set('acceptScore', request.query.acceptScore as string); }
            const finalTargetUrl = `${targetUrlPath}?${targetQueryParams.toString()}`;

            functions.logger.info(`Proxying request to: ${finalTargetUrl}`);

            const outgoingHeaders: HeadersInit = { // Using HeadersInit type
                "Accept": "application/json",
                // Add any other headers the target API might need
                // "User-Agent": "Firebase Cloud Function Proxy v1.0" // Example
            };

            // --- ADD LOGGING HERE ---
            functions.logger.info("Outgoing request details:", {
                method: "GET",
                url: finalTargetUrl,
                headers: outgoingHeaders // Log the headers being sent
            });
            // --- END LOGGING ---


            const targetResponse: FetchResponse = await fetch(finalTargetUrl, { method: "GET", headers: { "Accept": "application/json" } });

            const contentType = targetResponse.headers.get("content-type");
            if (contentType) { response.set("Content-Type", contentType); }

            const responseBody = await targetResponse.buffer();
            response.status(targetResponse.status).send(responseBody);
            functions.logger.info(`Responded with status: ${targetResponse.status}`);

        } catch (error: any) {
            functions.logger.error("Error processing request in geocodeProxy:", error);
            if (error instanceof functions.https.HttpsError) {
                response.status(error.httpErrorCode.status).send(error.message);
            } else {
                response.status(500).send("An internal server error occurred.");
            }
        }
    }); // End CORS handler
});