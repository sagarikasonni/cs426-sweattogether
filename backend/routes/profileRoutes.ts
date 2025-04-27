import express from 'express'
import { createProfile, getProfile } from '../controllers/profileController'

const router = express.Router()

// make a post to the create profile function
router.post('/', createProfile)
// get request to retrieve existing profile
router.get('/', getProfile)

export default router