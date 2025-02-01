import { NextResponse } from "next/server";
import axios from "axios";

const { TAT_API_KEY, TAT_EVENTS_URL } = process.env;

export async function GET() {
  try {
    const config = {
      headers: {
        "x-api-key": TAT_API_KEY,
        "Accept-Language": "th",
        "Content-Type": "application/json",
      },
      params: {
        keyword: "นครพนม",
        sort_by: "updatedAt:desc",
        page: 1,
      },
      timeout: 30000,
    };

    const response = await axios.get(TAT_EVENTS_URL, config);

    if (!response.data?.data) {
      return NextResponse.json({ error: "Invalid API response format" }, { status: 500 });
    }

    const events = response.data.data
      .filter((event) => event.thumbnailUrl)
      .map((event) => ({
        eventId: event.eventId,
        name: event.name,
        introduction: event.introduction || "ไม่มีข้อมูลคำอธิบาย",
        startDate: event.startDate,
        endDate: event.endDate,
        latitude: event.latitude,
        longitude: event.longitude,
        province: event.location?.province?.name || "นครพนม",
        thumbnailUrl: event.thumbnailUrl,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      }));

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch data",
      details: error.response?.data || error.message,
    }, { status: error.response?.status || 500 });
  }
}
