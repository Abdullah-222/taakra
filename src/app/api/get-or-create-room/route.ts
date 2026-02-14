import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Validate environment variables
    if (!process.env.MANAGEMENT_TOKEN) {
      return NextResponse.json(
        { error: "MANAGEMENT_TOKEN is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.TEMPLATE_ID) {
      return NextResponse.json(
        { error: "TEMPLATE_ID is not configured" },
        { status: 500 }
      );
    }

    const requestBody = {
      name: `demo-room-${Date.now()}`, // Unique room name
      template_id: process.env.TEMPLATE_ID,
    };

    console.log("Creating room:", requestBody);

    const res = await fetch("https://api.100ms.live/v2/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MANAGEMENT_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await res.text();
    console.log("100ms API response:", {
      status: res.status,
      statusText: res.statusText,
      body: text,
    });

    if (!res.ok) {
      let errorData = text;
      try {
        errorData = JSON.parse(text);
      } catch {
        // Keep as text if not JSON
      }
      
      console.error("100ms API error:", res.status, errorData);
      return NextResponse.json(
        {
          error: "Failed to create room",
          status: res.status,
          details: errorData,
        },
        { status: res.status }
      );
    }

    // Parse successful response
    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Empty response from 100ms API" },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Create room error:", err);
    return NextResponse.json(
      { error: "Failed to create room", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

