import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";

// function to create a new profile
export const createProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const newProfile = new UserProfile(req.body)
        const savedProfile = await newProfile.save()
        res.status(201).json(savedProfile)
    }
    catch (error) {
        console.error('Error saving profile', error)
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