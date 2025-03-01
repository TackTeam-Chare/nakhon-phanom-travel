"use client";

import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { fetchRealTimeTouristEvents } from "@/services/api/api.js";
import Image from "next/image";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, slidesToSlide: 3 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2, slidesToSlide: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1, slidesToSlide: 1 },
};

const RealTimeEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await fetchRealTimeTouristEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching real-time tourist events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#F97316" size={50} />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 mb-10 px-4">
      <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-orange-500 mt-10 mb-5">
        อีเวนต์ท่องเที่ยวล่าสุด
      </h1>
      <div>
        <Carousel responsive={responsive} className="z-10">
          {events.map((event, index) => (
            <Link key={event.eventId} href={`/places/events/${event.eventId}`} className="p-4 block">
              <div
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full"
                style={{ minHeight: "400px" }}
              >
                {event.thumbnailUrl ? (
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.name}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold line-clamp-1">{event.name}</h3>
                    <p className="text-gray-600 line-clamp-4">{event.introduction}</p>
                  </div>
                  <p className="text-orange-500 font-bold">{event.province}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(event.startDate).toLocaleDateString("th-TH")} - {new Date(event.endDate).toLocaleDateString("th-TH")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>
        <div className="flex justify-end mt-4">
          <Link
            href="/places/events"
            className="bg-orange-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-orange-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            ดูทั้งหมด
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RealTimeEvents;
