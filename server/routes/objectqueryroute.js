import express from 'express';
import { reportLostItem, reportFoundItem } from '../controllers/objectquerycontroller.js';
// import upload from '../middlewares/upload.js'; // REMOVE OR COMMENT OUT THIS LINE

import { uploadCareImage } from '../middlewares/uploadcareUpload.js'; 

const object_query_router = express.Router();

object_query_router.post('/report-lost', uploadCareImage, reportLostItem); // Changed
object_query_router.post('/report-found', uploadCareImage, reportFoundItem); // Changed

export default object_query_router;