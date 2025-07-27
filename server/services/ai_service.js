import axios from 'axios';

// IMPORTANT: Replace this with your actual Hugging Face Space URL
// It will look like: https://<your-hf-username>-<your-space-name>.hf.space
const FLASK_API_URL = "https://sohamnk-lost-and-found-ai-pipeline.hf.space";

/**
 * Calls the Flask server to process an item's details and get its features.
 * @param {object} itemData - Contains objectName, objectDescription, objectImage (URL).
 * @returns {Promise<object|null>} - A promise that resolves to the features object or null on error.
 */
export const processItemFeatures = async (itemData) => {
    try {
        console.log('Calling Flask API to process item features...');
        const response = await axios.post(`${FLASK_API_URL}/process`, itemData);
        console.log('Successfully received features from Flask API.');
          console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling /process endpoint on Flask API:', error.response ? error.response.data : error.message);
        return null;
    }
};

/**
 * Calls the Flask server to compare a query item against a list of other items.
 * @param {object} queryItem - The item to find matches for (must include feature fields).
 * @param {Array<object>} searchList - The list of items to search against (must include feature fields).
 * @returns {Promise<object|null>} - A promise that resolves to the match results or null on error.
 */
export const findMatches = async (queryItem, searchList) => {
    try {
        console.log(`Calling Flask API to compare ${queryItem._id} against ${searchList.length} items...`);
        const payload = {
            queryItem,
            searchList,
        };
        const response = await axios.post(`${FLASK_API_URL}/compare`, payload);
        console.log('Successfully received comparison results from Flask API.');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling /compare endpoint on Flask API:', error.response ? error.response.data : error.message);
        return null;
    }
};
