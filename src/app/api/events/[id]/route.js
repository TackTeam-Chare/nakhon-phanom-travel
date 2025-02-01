import { NextResponse } from "next/server";
import axios from "axios";

const { TAT_API_KEY, TAT_EVENTS_URL } = process.env;

export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const config = {
      headers: {
        "x-api-key": TAT_API_KEY,
        "Accept-Language": "th",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    };

    const response = await axios.get(`${TAT_EVENTS_URL}/${id}`, config);

    if (!response.data) {
      return NextResponse.json({ error: "Invalid API response format" }, { status: 500 });
    }

    const event = response.data;

    const formattedEvent = {
      eventId: event.eventId,
      name: event.name,
      introduction: event.information?.introduction || "ไม่มีข้อมูลคำอธิบาย",
      startDate: event.startDate,
      endDate: event.endDate,
      latitude: event.latitude,
      longitude: event.longitude,
      province: event.location?.province?.name || "นครพนม",
      categories: event.categories?.map((cat) => cat.name) || [],
      contact: {
        phones: event.contact?.phones?.map((p) => p.value) || [],
        emails: event.contact?.emails?.map((e) => e.value) || [],
        urls: event.contact?.urls?.map((u) => u.value) || [],
      },
      thumbnailUrl: event.thumbnailUrl,
      images: event.desktopImage_urls || event.mobileImage_urls || [],
      googleMapUrl: event.googleMapUrl,
      tags: event.tags || [],
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch event data",
      details: error.response?.data || error.message,
    }, { status: error.response?.status || 500 });
  }
}
