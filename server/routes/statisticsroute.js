import express from 'express';
import { getDashboardStatistics } from '../controllers/statisticscontroller';
// import { getDashboardStatistics } from '../controllers/statisticscontroller.js';


const statisticsrouter = express.Router();

statisticsrouter.get('/', getDashboardStatistics);

export default statisticsrouter;

