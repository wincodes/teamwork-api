const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const admin = require('../middleware/admin');

/**
 * @swagger
 * paths:
 *  /api/v1/auth/create-user:
 *    post:
 *      description: admin creates a user
 *      parameters:
 *        - in: query
 *          name: firstName
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: lastName
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: email
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: password
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: gender
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: jobRole
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: department
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: address
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '201':
 *          description: OK, User created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: "success" 
 *                  data:
 *                    type: object
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '401':
 *          description: Authorization information is missing or invalid.
 *              
 */
router.post('/create-user', admin, AuthController.registerUser);

module.exports = router;