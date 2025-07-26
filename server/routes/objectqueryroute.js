import express from 'express';
import { reportLostItem, reportFoundItem } from '../controllers/objectquerycontroller.js';
import upload from '../middlewares/upload.js';

const object_query_router = express.Router();

object_query_router.post('/report-lost', upload.single('objectImage'), reportLostItem);
object_query_router.post('/report-found', upload.single('objectImage'), reportFoundItem);

export default object_query_router;