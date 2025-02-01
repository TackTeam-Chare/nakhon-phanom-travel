import { NextResponse } from "next/server";
import axios from "axios";

const { TAT_API_KEY, TAT_BASE_URL } = process.env;

export async function GET() {
  try {
    const config = {
      headers: {
        "x-api-key": TAT_API_KEY,
        "Accept-Language": "th",
        "Content-Type": "application/json",
      },
      params: {
        province_id: 579,
        place_category: "attraction",
        sort_by: "updatedAt:desc",
        page: 1,
        limit: 20,
      },
      timeout: 30000,
    };

    const response = await axios.get(TAT_BASE_URL, config);

    if (!response.data?.data) {
      return NextResponse.json({ error: "Invalid API response format" }, { status: 500 });
    }

    const places = response.data.data
      .filter((place) => place.thumbnailUrl && place.thumbnailUrl.length > 0)
      .map((place) => ({
        placeId: place.placeId,
        name: place.name,
        introduction: place.introduction || "ไม่มีข้อมูลคำอธิบาย",
        address: place.location?.address || "ไม่มีข้อมูลที่อยู่",
        subDistrict: place.location?.subDistrict?.name || "ไม่มีข้อมูลตำบล",
        district: place.location?.district?.name || "ไม่มีข้อมูลอำเภอ",
        province: place.location?.province?.name || "นครพนม",
        postcode: place.location?.postcode || "ไม่มีข้อมูลรหัสไปรษณีย์",
        latitude: place.latitude,
        longitude: place.longitude,
        thumbnailUrl: place.thumbnailUrl[0],
        createdAt: place.createdAt,
        updatedAt: place.updatedAt,
      }));

    return NextResponse.json(places);
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch data",
      details: error.response?.data || error.message,
    }, { status: error.response?.status || 500 });
  }
}