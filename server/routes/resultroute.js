import express from 'express';
import * as resultController from '../controllers/resultcontroller.js'; // Adjust path as needed

const router = express.Router();

/**
 * @route   GET /api/results/
 * @desc    Get all matches for the authenticated user
 * @access  Private
 */
router.get('/', resultController.getMyMatches);

/**
 * @route   PATCH /api/results/:resultId/reject
 * @desc    Reject a specific match
 * @access  Private
 */
router.patch('/:resultId/reject', resultController.rejectMatch);

/**
 * @route   PATCH /api/results/:resultId/confirm
 * @desc    Confirm a specific match and reject others
 * @access  Private
 */
router.patch('/:resultId/confirm', resultController.confirmMatch);

/**
 * @route   POST /api/results/:resultId/generate-code
 * @desc    Generate a 6-digit code for transfer (Finder only)
 * @access  Private
 */
router.post('/:resultId/generate-code', resultController.generateTransferCode);

/**
 * @route   POST /api/results/:resultId/verify-code
 * @desc    Verify a 6-digit code to complete transfer (Owner only)
 * @access  Private
 * @body    { "code": "123456" }
 */
router.post('/:resultId/verify-code', resultController.verifyTransferCode);


export default router;
