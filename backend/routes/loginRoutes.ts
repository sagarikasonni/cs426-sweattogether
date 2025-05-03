// TODO: Implement routing for login
import express from 'express'
import { createLogin, authenticateLogin, checkIfEmailExists } from '../controllers/loginController'
//import passport from 'passport'
//import LocalStrategy from 'passport-local'
//import crypto from 'crypto'

const router = express.Router()

// make a post to the create profile function
router.post('/signup', createLogin)
// get request to retrieve existing profile
router.post('/authenticate', authenticateLogin)
// Check if email is already registered
router.post('/check', checkIfEmailExists)

export default router