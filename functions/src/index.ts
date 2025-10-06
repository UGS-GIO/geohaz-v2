import * as functions from "firebase-functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require("node-fetch");
import cors from "cors";
import { URLSearchParams } from "url";
import { Response as FetchResponse } from 'node-fetch';
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// Initialize CORS middleware
const corsHandler = cors({ origin: true });
const UTAH_GEOCODE_URL_TEMPLATE = "http://api.mapserv.utah.gov/api/v1/geocode/{street}/{zone}";
// Secret Manager Configuration (Ready for tomorrow)
const SECRET_ID = "UTAH_MAPSERV_API_KEY";
const GCP_PROJECT_ID = process.env.GCLOUD_PROJECT;
const SECRET_VERSION_NAME = `projects/${GCP_PROJECT_ID}/secrets/${SECRET_ID}/versions/latest`;
const secretManagerClient = new SecretManagerServiceClient(); // Instantiate client
fgh

// --- Modified getApiKey Function ---
async function getApiKey(): Promise<string> {

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
        const secretApiKey = version.payload?.data?.toString();

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
}


export const geocodeProxy = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {

        if (request.method !== "GET") {
            response.status(405).send("Method Not Allowed");
            return;
        }

        const street = request.query.street as string | undefined;
        const zone = request.query.zone as string | undefined;

        if (!street || !zone) {
            response.status(400).send("Missing query parameters: 'street' and 'zone'.");
            return;
        }

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
    });
});