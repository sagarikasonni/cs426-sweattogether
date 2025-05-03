import bcrypt from 'bcrypt';

import { Request, Response } from "express";
import UserLogin from "../models/Login";

// function to create a new profile
export const createLogin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); //encrypt password to store
        const newLogin = new UserLogin({ email, password: hashedPassword });
        const savedLogin = await newLogin.save()
        res.status(201).json(savedLogin)
    }
    catch (error) {
        console.error('Error saving username and password', error)
        res.status(500).json({ error: 'Failed to save username and password' })
    }
}

// function to get existing login
export const authenticateLogin = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await UserLogin.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'Email not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    res.json({ message: 'Login successful', user });
}

export const checkIfEmailExists = async (req: Request, res: Response) => {
    const { email } = req.body;
    const existingUser = await UserLogin.findOne({ email });
    res.json({ exists: !!existingUser });
};