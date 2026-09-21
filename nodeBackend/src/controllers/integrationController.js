import userModelSchema from '../models/userModel.js';
import {getGoogleAuthUrl, getGoogleAccessToken} from '../utils/googleCalander.js';

export const getoAuthGoogleUrl = async (req, res) => {
    if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
        return res.status(500).json({ message: 'Google credentials are not set' });
    }
    const authUrl = getGoogleAuthUrl(req.user._id);
    return res.json({ authUrl: getGoogleAuthUrl(req.user._id) });
}

export const handleGoogleCallback = async (req, res) => {
    const {code , state} = req.query;

    if(!code || !state) {
        return res.redirect(`${process.env.CLIENT_URL}/settings`);
    }

    const { userId } = JSON.parse(state);
    const user = await userModelSchema.findById(userId);
    if(!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const tokens = await getGoogleAccessToken(code);
    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token;
}