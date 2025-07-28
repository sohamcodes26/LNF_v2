import express from 'express';
import { reportLostItem, reportFoundItem } from '../controllers/objectquerycontroller.js';

import { uploadCareImage } from '../middlewares/uploadcareUpload.js'; 

const object_query_router = express.Router();

object_query_router.post('/report-lost', uploadCareImage, reportLostItem); 
object_query_router.post('/report-found', uploadCareImage, reportFoundItem); 

export default object_query_router;