import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/telemed';
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("========== FULL ERROR ==========");
console.error(error);
console.error("Error Name:", error.name);
console.error("Error Message:", error.message);
console.error("Error Cause:", error.cause);
console.error("===============================");
    process.exit(1);
  }
};

export default connectDB;
