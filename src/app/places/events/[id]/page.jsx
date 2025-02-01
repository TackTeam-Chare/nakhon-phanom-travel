"use client";

import React, { useEffect, useState } from "react";
import { fetchEventById } from "@/services/api/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaCalendarDay, FaLink, FaPhone, FaEnvelope } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const EventDetailPage = ({ params }) => {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEventById(id);
        if (!data) {
          router.push("/404"); // ถ้าไม่มีข้อมูลให้ไปที่หน้า 404
        } else {
          setEvent(data);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#F97316" size={50} />
      </div>
    );
  }

  if (!event) {
    return <p className="text-center text-gray-600">ไม่พบข้อมูลอีเว้นต์</p>;
  }

  return (
    <div className="container mx-auto mt-10 px-4">
      <h1 className="text-4xl font-bold text-orange-500">{event.name}</h1>
      <div className="text-gray-600 flex items-center mt-2">
        <FaMapMarkerAlt className="text-orange-500 mr-2" />
        <span>{event.province}</span>
      </div>
      <div className="text-gray-600 flex items-center mt-2">
        <FaCalendarDay className="text-orange-500 mr-2" />
        <span>{event.startDate} - {event.endDate}</span>
      </div>

      {/* รูปภาพ */}
      {event.images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {event.images.map((image, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index} className="relative h-64 w-full">
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">ไม่มีรูปภาพสำหรับอีเว้นต์นี้</p>
      )}

      {/* รายละเอียดอีเว้นต์ */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-800">รายละเอียด</h2>
        <p className="text-gray-700 mt-2">{event.introduction}</p>
      </div>

      {/* ข้อมูลการติดต่อ */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-800">ข้อมูลการติดต่อ</h2>
        {event.contact.phones.length > 0 && (
          <p className="flex items-center mt-2">
            <FaPhone className="text-orange-500 mr-2" />
            {event.contact.phones.join(", ")}
          </p>
        )}
        {event.contact.emails.length > 0 && (
          <p className="flex items-center mt-2">
            <FaEnvelope className="text-orange-500 mr-2" />
            {event.contact.emails.join(", ")}
          </p>
        )}
        {event.contact.urls.length > 0 && (
          <p className="flex items-center mt-2">
            <FaLink className="text-orange-500 mr-2" />
            <Link href={event.contact.urls[0]} target="_blank" rel="noopener noreferrer">
              เว็บไซต์ทางการ
            </Link>
          </p>
        )}
      </div>

      {/* ลิงก์ไป Google Maps */}
      {event.googleMapUrl && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800">แผนที่</h2>
          {/* biome-ignore lint/a11y/useIframeTitle: <explanation> */}
<iframe
            src={event.googleMapUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            className="rounded-lg shadow-lg mt-3"
          />
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
