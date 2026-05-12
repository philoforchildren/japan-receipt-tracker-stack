import { NextResponse } from "next/server";
import { getTrips } from "@/lib/notion";

export async function GET() {
  try {
    const trips = await getTrips();
    return NextResponse.json(trips);
  } catch (e) {
    console.error("Trips error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
