import express from 'express';
import * as resultController from '../controllers/resultcontroller.js'; // Adjust path as needed

const result_router = express.Router();


result_router.get('/get-results', resultController.getMyMatches);



export default result_router;
