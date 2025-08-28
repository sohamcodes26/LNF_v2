import express from 'express';
import { reportItem } from '../controllers/objectquerycontroller.js';
import { uploadMultipleImages } from '../middlewares/uploadcareUpload.js'; // Assuming you rename the middleware

const object_query_router = express.Router();

// A single endpoint for reporting both lost and found items
// The middleware now accepts up to 8 files from the 'images' field
object_query_router.post('/report-item', uploadMultipleImages, reportItem);

export default object_query_router;