import { NextResponse } from "next/server";
import axios from "axios";

const { TAT_API_KEY, TAT_EVENTS_URL } = process.env;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // รับ query parameters เช่น pageNumber, pageSize, keyword, provinceId
    const pageNumber = searchParams.get("pageNumber") || 1;
    const pageSize = searchParams.get("pageSize") || 10;
    const keyword = searchParams.get("keyword") || "นครพนม";
    const provinceId = searchParams.get("provinceId") || 579; // นครพนม

    const apiUrl = `${TAT_EVENTS_URL}`;

    const response = await axios.get(apiUrl, {
      headers: {
        "x-api-key": TAT_API_KEY,
        "Accept-Language": "th",
        "Content-Type": "application/json",
      },
      params: {
        pageNumber,
        pageSize,
        keyword,
        provinceId,
      },
      timeout: 30000,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch event data",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
