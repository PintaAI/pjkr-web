import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
    // Test if we can read from verification table (better-auth uses this)
    const verificationCount = await prisma.verification.count();
    console.log(`Verification count: ${verificationCount}`);
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      verificationCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Database connection error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
