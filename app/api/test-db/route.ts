import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    // Try to query the database
    const allUsers = await db.select().from(users).limit(5);
    
    return NextResponse.json({ 
      success: true,
      message: "Database connection successful",
      userCount: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to connect to database",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
