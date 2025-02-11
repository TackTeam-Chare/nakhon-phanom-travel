"use client";

import React, { useEffect, useState } from "react";
import { fetchRealTimeTouristEvents } from "@/services/api/api";
import Image from "next/image";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRealTimeTouristEvents();
        setEvents(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching tourist events:", error);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-orange-500 text-center mt-10 mb-5">
        อีเว้นต์ท่องเที่ยว
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEvents.map((event) => (
          <Link href={`/places/events/${event.eventId}`} key={event.eventId}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full">
              {event.thumbnailUrl ? (
                <Image
                  src={event.thumbnailUrl}
                  alt={event.name}
                  width={500}
                  height={300}
                  className="rounded-lg mb-4 object-cover w-full h-48"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  <span className="text-gray-500">ไม่มีรูปภาพ</span>
                </div>
              )}
              <div className="p-4 flex-grow flex flex-col">
                <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                <p className="text-gray-600 flex-grow">{event.introduction}</p>
                <p className="text-orange-500 font-bold mt-2">
                  {event.province}
                </p>
                <Link
                  href={`/places/events/${event.eventId}`}
                  className="text-orange-500 mt-2 font-bold self-end flex items-center hover:underline"
                >
                  อ่านเพิ่มเติม
                  <FaChevronRight className="ml-1" />
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex justify-center mt-8">
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mx-1 px-3 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 transform hover:scale-105 transition duration-300 ease-in-out"
      >
        ก่อนหน้า
      </button>
      {pages.map((page) => (
        // biome-ignore lint/a11y/useButtonType: <explanation>
<button
          key={page}
          onClick={() => onPageChange(page)}
          className={`mx-1 px-3 py-2 rounded-lg transform transition duration-300 ease-in-out ${
            page === currentPage
              ? "bg-orange-700 text-white hover:shadow-xl hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-800"
              : "bg-orange-500 text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600"
          } hover:scale-105`}
        >
          {page}
        </button>
      ))}
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="mx-1 px-3 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 transform hover:scale-105 transition duration-300 ease-in-out"
      >
        ถัดไป
      </button>
    </div>
  );
};

export default EventsPage;
