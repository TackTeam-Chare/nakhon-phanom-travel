import { NextResponse } from "next/server";
import axios from "axios";

const { TAT_API_KEY, TAT_EVENTS_URL } = process.env;

export async function GET(req, context) {
  try {
    const { id } = context.params;
    const response = await axios.get(`${TAT_EVENTS_URL}/${id}`, {
      headers: {
        "x-api-key": TAT_API_KEY,
        "Accept-Language": "th",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch place data",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
