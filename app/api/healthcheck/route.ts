import { NextRequest, NextResponse } from "next/server";
import https from 'https';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const expectedStatus = searchParams.get("expectedStatus");

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        
        headers: {
          "User-Agent": "MyHostedHub-HealthCheck/1.0",
        },
      });

      clearTimeout(timeoutId);
      const status = response.status;
      const isHealthy = expectedStatus
        ? status === parseInt(expectedStatus)
        : status >= 200 && status < 400;

      return NextResponse.json({
        healthy: isHealthy,
        status,
        expectedStatus: expectedStatus ? parseInt(expectedStatus) : null,
        url,
      });
    } catch (error: any) {
      return NextResponse.json({
        healthy: false,
        status: null,
        error: error.name === "AbortError" ? "Timeout" : error.message,
        url,
      });
    }
  } catch (error) {
    console.error("Error in healthcheck:", error);
    return NextResponse.json(
      { error: "Failed to perform healthcheck" },
      { status: 500 }
    );
  }
}

