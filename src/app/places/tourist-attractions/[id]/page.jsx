"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchTouristAttractionsById } from "@/services/api/api";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Info,
  Users,
  Phone,
  Globe,
  Banknote,
  Star,
  Award,
  ChevronRight,
  Calendar,
  Timer,
  Tag,
  Activity
} from "lucide-react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

const TouristAttractionsPage = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchTouristAttractionsById(id)
      .then((data) => {
        setPlace(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching place data:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Info className="w-16 h-16 text-orange-400 mb-4" />
        <h2 className="text-2xl font-medium text-gray-700">ไม่พบข้อมูลสถานที่</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 🔹 Hero Section */}
      <div className="relative w-full h-[75vh]">
        <Slide easing="ease" duration={3000} transitionDuration={500} indicators arrows>
          {place.mobileImageUrls?.map((image, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index} className="relative w-full h-[75vh]">
              <Image
                src={image}
                alt={`${place.name} - ภาพที่ ${index + 1}`}
                layout="fill"
                objectFit="cover"
                priority={index === 0}
                className="brightness-75"
              />
            </div>
          ))}
        </Slide>

        {/* 🔹 ชื่อสถานที่ + หมวดหมู่ + จังหวัด */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{place.name}</h1>
            <div className="flex items-center text-lg text-gray-300 mb-2">
              <Tag className="w-5 h-5 mr-2 " />
              <span>{place.category?.name} - {place.category?.subCategories?.[0]?.name || "ไม่ระบุ"}</span>
            </div>
            <div className="flex items-center text-lg">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{place.location?.district?.name}, {place.location?.province?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
        
        {/* 🔹 รายละเอียดสถานที่ */}
        <div className="md:col-span-2">
          <h2 className="flex items-center text-2xl text-orange-600 font-bold">
            <Info className="w-6 h-6 mr-2" />
            รายละเอียด
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mt-4">
            {place.information?.detail || "ไม่มีข้อมูลคำอธิบาย"}
          </p>
        </div>

        {/* 🔹 กิจกรรมที่ทำได้ */}
        {place.information?.activities?.length > 0 && (
          <div>
            <h2 className="flex items-center text-2xl text-orange-600 font-bold">
              <Activity className="w-6 h-6 mr-2" />
              กิจกรรมที่สามารถทำได้
            </h2>
            <ul className="mt-4 text-lg space-y-2">
              {place.information.activities.map((activity, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<li key={index} className="text-gray-700">{activity}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 🔹 ข้อมูลติดต่อ */}
        {place.contact?.phones?.length > 0 && (
          <div>
            <h2 className="flex items-center text-2xl text-orange-600 font-bold">
              <Phone className="w-6 h-6 mr-2" />
              ข้อมูลติดต่อ
            </h2>
            <p className="text-lg mt-4">โทร: {place.contact.phones.join(", ")}</p>
          </div>
        )}

        {/* 🔹 ค่าธรรมเนียม */}
        <div>
          <h2 className="flex items-center text-2xl text-orange-600 font-bold">
            <Banknote className="w-6 h-6 mr-2" />
            ค่าเข้าชม
          </h2>
          <ul className="mt-4 text-lg space-y-2">
            <li>ผู้ใหญ่ (ไทย): {place.information?.fee?.thaiAdult} บาท</li>
            <li>เด็ก (ไทย): {place.information?.fee?.thaiChild} บาท</li>
            <li>ผู้ใหญ่ (ต่างชาติ): {place.information?.fee?.foreignerAdult} บาท</li>
            <li>เด็ก (ต่างชาติ): {place.information?.fee?.foreignerChild} บาท</li>
          </ul>
        </div>

        {/* 🔹 รีวิว */}
        <div>
          <h2 className="flex items-center text-2xl text-orange-600 font-bold">
            <Star className="w-6 h-6 mr-2" />
            คะแนนรีวิว
          </h2>
          <p className="text-lg mt-4">{place.rating?.rating || "0"} / 5</p>
        </div>

        {/* 🔹 แผนที่ & การเดินทาง */}
        {place.googleMapUrl && (
          <div>
            <h2 className="flex items-center text-2xl text-orange-600 font-bold">
              <Globe className="w-6 h-6 mr-2" />
              การเดินทาง
            </h2>
            <a href={place.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition">
              ดูแผนที่บน Google Maps
            </a>
          </div>
        )}

      </main>
    </div>
  );
};

export default TouristAttractionsPage;
