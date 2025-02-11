"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchEventById } from "@/services/api/api";
import Image from "next/image";
import {
  MapPin, Info, Phone, Calendar, Activity, Landmark
} from "lucide-react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import "@/app/globals.css";

const formatThaiDate = (dateString) => {
  if (!dateString) return "ไม่ระบุวันที่";
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("th-TH", options);
};

const TouristAttractionsPage = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id)
      .then((data) => {
        setPlace(data.data);
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
        <Slide easing="ease" duration={3000} transitionDuration={500} indicators arrows cssClass="custom-slide">
          {place?.mobileImageUrls?.length > 0 ? (
            place.mobileImageUrls.map((image, index) => (
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
            ))
          ) : (
            <div className="w-full h-[75vh] flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">ไม่มีรูปภาพ</span>
            </div>
          )}
        </Slide>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{place.name}</h1>
            <div className="flex items-center text-lg text-gray-300 mb-2">
              <Landmark className="w-5 h-5 mr-2 " />
              <span>{place.categories?.map(sub => sub.name).join(", ") || "ไม่ระบุ"}</span>
            </div>
            <div className="flex items-center text-lg">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{place.location?.province?.name}</span>
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
            {place.information?.introduction || "ไม่มีข้อมูลคำอธิบาย"}
          </p>
          <div
            className="text-gray-700 text-lg mt-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{ __html: place.information?.htmlDetail || "<p>ไม่มีรายละเอียดเพิ่มเติม</p>" }}
          />
        </div>

        {/* 🔹 วันที่จัดอีเว้นต์ */}
        <div className="p-6 ">
          <h2 className="flex items-center text-2xl text-orange-600 font-bold">
            <Calendar className="w-6 h-6 mr-2" />
            วันที่จัดงาน
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            {formatThaiDate(place.startDate)} - {formatThaiDate(place.endDate)}
          </p>
        </div>

        {/* 🔹 ข้อมูลติดต่อ */}
        {place.contact?.phones?.length > 0 && (
          <div className="p-6 ">
            <h2 className="flex items-center text-2xl text-orange-600 font-bold">
              <Phone className="w-6 h-6 mr-2" />
              ข้อมูลติดต่อ
            </h2>
            <p className="text-lg mt-4">โทร: {place.contact.phones.join(", ")}</p>
          </div>
        )}

        {/* 🔹 กิจกรรมที่สามารถทำได้ */}
        {place.information?.activities?.length > 0 && (
          <div className="p-6 ">
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
      </main>
    </div>
  );
};

export default TouristAttractionsPage;
