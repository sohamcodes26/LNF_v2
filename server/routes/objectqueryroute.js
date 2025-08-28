import express from 'express';
import { reportLostItem, reportFoundItem } from '../controllers/objectquerycontroller.js';
import { uploadMultipleImages } from '../middlewares/uploadcareUpload.js';

const object_query_router = express.Router();

// Route for lost items, using the multi-image upload middleware
object_query_router.post('/report-lost', uploadMultipleImages, reportLostItem);

// Route for found items, using the same multi-image upload middleware
object_query_router.post('/report-found', uploadMultipleImages, reportFoundItem);

export default object_query_router;
