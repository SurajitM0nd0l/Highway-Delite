// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// --- User Schema ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// --- Note Schema ---
const noteSchema = new mongoose.Schema({
    email: { type: String, required: true }, // associate note with user email
    text: { type: String, required: true },
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);

// --- Temporary OTP Storage ---
let otps = {}; // { email: otp }

// --- Routes ---

// Generate OTP
app.post("/get-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps[email] = otp;

    // Set OTP to expire in 5 minutes
    setTimeout(() => {
        delete otps[email];
        console.log(`OTP for ${email} expired`);
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
        service: "Gmail", // or another email service
        auth: {
            user: process.env.EMAIL_USER, // your email
            pass: process.env.EMAIL_PASS, // app password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log(`OTP sent to ${email}: ${otp}`);
        return res.json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
});


// Signup
app.post("/signup", async (req, res) => {
    const { name, dob, email, password, otp } = req.body;

    if (!name || !dob || !email || !password || !otp) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (otps[email] !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, dob, email, password: hashedPassword });
        await user.save();

        delete otps[email];

        return res.json({ message: "Signup successful" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Signin
app.post("/signin", async (req, res) => {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) return res.status(400).json({ message: "All fields are required" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        if (otps[email] !== otp) return res.status(400).json({ message: "Invalid OTP" });

        delete otps[email];

        // Fetch user notes
        const notes = await Note.find({ email });

        return res.json({ message: "Signin successful ✅", user: { name: user.name, email: user.email }, notes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Create note
app.post("/notes", async (req, res) => {
    const { email, text } = req.body;
    if (!email || !text) return res.status(400).json({ message: "Email and text are required" });

    try {
        const note = new Note({ email, text });
        await note.save();
        return res.json({ message: "Note created successfully", note });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Get notes for user
app.get("/notes/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const notes = await Note.find({ email });
        return res.json(notes);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
