import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("Database already connected");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Database connected successfully to LazyQ");
  } catch (error) {
    console.error("Database connection failed", error);
    throw new Error("Failed to connect to the database");
  }
};

export default dbConnect;