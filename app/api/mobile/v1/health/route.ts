import { NextRequest, NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * GET /api/mobile/v1/health
 * 
 * Returns API health status for mobile app.
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'v1',
    environment: process.env.NODE_ENV || 'development',
  });
}
