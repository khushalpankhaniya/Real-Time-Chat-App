import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (mongoURI) {
        try {
            await mongoose.connect(mongoURI);
            console.log('MongoDB connected successfully');
        } catch (err) {
            console.error('MongoDB connection error:', err);
        }
    } else {
        console.log('MONGODB_URI not provided in environment. Set it in .env to connect to database.');
    }
};