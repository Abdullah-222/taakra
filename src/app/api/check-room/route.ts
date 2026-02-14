import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    if (!process.env.MANAGEMENT_TOKEN) {
      return NextResponse.json(
        { error: "MANAGEMENT_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const { room_id } = await req.json();

    if (!room_id) {
      return NextResponse.json(
        { error: "room_id is required" },
        { status: 400 }
      );
    }

    // Check if room exists
    const res = await fetch(`https://api.100ms.live/v2/rooms/${room_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MANAGEMENT_TOKEN}`,
      },
    });

    if (res.status === 404) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("100ms API error:", res.status, errorText);
      return NextResponse.json(
        { error: "Failed to check room", status: res.status },
        { status: res.status }
      );
    }

    const roomData = await res.json();
    return NextResponse.json(
      { exists: true, room: roomData },
      { status: 200 }
    );
  } catch (err) {
    console.error("Check room error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

