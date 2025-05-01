import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";

// finds and updates one
// TODO: find a way to associate a profile with a user email
export const createProfile = async (req: Request, res: Response): Promise<any> => {
    try {
      const updatedProfile = await UserProfile.findOneAndUpdate(
        {},             
        req.body,       
        { new: true, upsert: true }  
      )
      res.status(200).json(updatedProfile)
    } catch (error) {
      console.error('Error saving profile:', error)
      res.status(500).json({ error: 'Failed to save profile' })
    }
}

// function to get existing profile
export const getProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const profile = await UserProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error retrieving profile', error);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
}