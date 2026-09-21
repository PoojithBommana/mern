import userModelSchema from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import { generateOtp , verifyOtp} from "../utils/EmailOtp.js";
import urlEncoder from "../utils/slug.js";

const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  slug: user.slug,
  businessName: user.businessName,
  businessDescription: user.businessDescription,
  brandTheme: user.brandTheme,
  brandAccent: user.brandAccent,
  timezone: user.timezone,
  googleCalendarConnected: user.googleCalendarConnected,
  googleCalendarId: user.googleCalendarId,
  payoutDetails: user.payoutDetails,
  stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_')),
});

const buildUniqueSlug = async (baseValue, excludeUserId = null) => {
    const baseSlug = urlEncoder(baseValue) || "business";
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug: finalSlug };
        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }

        const existing = await userModelSchema.findOne(query);
        if (!existing) {
            return finalSlug;
        }

        finalSlug = `${baseSlug}-${counter}`;
        counter += 1;
    }
};

export const registerUser = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        password,
        businessName,
        businessDescription,
        brandTheme,
        brandAccent,
        timezone,
        emailOtp
    } = req.body;

    if (!username || !email || !password || !emailOtp) {
        return res.status(400).json({
            message: "Please fill all the required fields"
        });
    }

    const normalisedEmail = email.toLowerCase();

    const existingUser = await userModelSchema.findOne({
        email: normalisedEmail
    });

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const otpResult = await verifyOtp({
        email: normalisedEmail,
        purpose: "registration",
        code: emailOtp,
        consume: true
    });

    if (!otpResult?.verified) {
        return res.status(400).json({
            message: otpResult?.reason || "Invalid OTP"
        });
    }

    const baseslug = await buildUniqueSlug(businessName || username);

    const hashedPassword = await bcrypt.hash(password, 10);

    const validThemes = ["emerald", "indigo", "rose", "amber", "slate"];
    const userPayload = {
        name: username,
        email: normalisedEmail,
        password: hashedPassword,
        slug: baseslug,
    };

    if (businessName) userPayload.businessName = businessName;
    if (businessDescription) userPayload.businessDescription = businessDescription;
    if (brandTheme && validThemes.includes(brandTheme)) userPayload.brandTheme = brandTheme;
    if (brandAccent) userPayload.brandAccent = brandAccent;
    if (timezone) userPayload.timezone = timezone;

    const newUser = await userModelSchema.create(userPayload);

    const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return res.status(201).json({
        message: "User registered successfully",
        token,
        user: toUserResponse(newUser)
    });
});


export const requestOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    
    const normalize = email.toLowerCase();

    const existingUser = await userModelSchema.findOne({ email: normalize });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const otpResult = await generateOtp({ email: normalize, purpose: "registration" });

    if (!otpResult?.ok || !otpResult.sent) {
        return res.status(502).json({
            message: otpResult?.reason || "Failed to send OTP email via Brevo",
        });
    }

    return res.status(200).json({
        message: "OTP sent successfully",
        sent: true,
    });
});


export const verifyOtpController = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalize = email.toLowerCase();

    const otpResult = await verifyOtp({
        email: normalize,
        purpose: "registration",
        code: otp,
        consume: false
    });

    if (!otpResult?.verified) {
        return res.status(400).json({ message: otpResult?.reason || "Invalid or expired OTP" });
    }

    return res.status(200).json({
        message: "OTP verified successfully",
        otpResult
    });
});



export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the required fields" });
    }

    const user = await userModelSchema.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
        message: "User logged in successfully",
        token,
        user: toUserResponse(user)
    });
});




export const getUserProfile = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: "User profile retrieved successfully",
        user: toUserResponse(req.user)
    });
});



export const updateProfile = asyncHandler(async (req, res) => {
    const { businessName, businessDescription, timezone, brandTheme, brandAccent } = req.body;

    const user = await userModelSchema.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const validThemes = ["emerald", "indigo", "rose", "amber", "slate"];

    if (businessName !== undefined) user.businessName = businessName;
    if (businessDescription !== undefined) user.businessDescription = businessDescription;
    if (timezone !== undefined) user.timezone = timezone;
    if (brandTheme !== undefined) {
        if (!validThemes.includes(brandTheme)) {
            return res.status(400).json({ message: "Invalid brand theme" });
        }
        user.brandTheme = brandTheme;
    }
    if (brandAccent !== undefined) user.brandAccent = brandAccent;

    user.slug = await buildUniqueSlug(user.businessName || user.name, user._id);

    await user.save();

    return res.status(200).json({
        message: "Profile updated successfully",
        user: toUserResponse(user),
    });
});
