import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    // Test the database connection
    await dbConnect();
    
    return NextResponse.json({
      success: true,
      message: "Database connected successfully to LazyQ!",
      timestamp: new Date().toISOString(),
      database: process.env.MONGODB_DB_NAME
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}