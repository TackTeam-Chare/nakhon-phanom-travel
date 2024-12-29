"use client";
import React, { useRef } from "react";
import Image from "next/image";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaCommentDots,
  FaComments,
} from "react-icons/fa";

// ⭐ Review Card Component
const ReviewCard = ({ review }) => (
  <div className="shadow-md rounded-xl p-6 bg-white border hover:shadow-lg transition-all duration-300 ease-in-out min-w-[90%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[30%] mr-4">
    {/* Header Section */}
    <div className="flex justify-between items-center mb-4">
      {/* User Info */}
      <div className="flex items-center gap-3">
        {review.userImage ? (
          <Image
            src={review.userImage}
            alt={review.username}
            width={50}
            height={50}
            className="rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <FaUserCircle className="text-gray-400 text-5xl" />
        )}
        <div>
          <h4 className="font-bold text-lg text-gray-800">
            {review.username || "ผู้ใช้งานทั่วไป"}
          </h4>
        </div>
      </div>

      {/* Rating & Date */}
      <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
        <div className="flex items-center text-yellow-400">
          {Array.from({ length: review.rating }).map((_, index) => (
            <FaStar key={index} />
          ))}
        </div>
        <div className="flex items-center text-gray-500">
          <FaCalendarAlt className="mr-1 text-orange-500" />
          {new Date(review.created_at).toLocaleDateString("th-TH")}
        </div>
      </div>
    </div>

    {/* Comment Section */}
    <p className="text-gray-700 text-sm flex items-start">
      <FaCommentDots className="text-orange-400 mr-2" />
      {review.comment}
    </p>
  </div>
);

// 🎯 Main Review Section Component
const ReviewSection = ({ rating, reviews }) => {
  const scrollRef = useRef(null);

  // 🔄 Scroll Left
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // 🔄 Scroll Right
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="container mx-auto px-4 py-10 m-5 mt-10">
      {/* ⭐ Rating Summary */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-orange-500 flex justify-center items-center">
          <FaStar className="mr-2 text-yellow-400" />
          {rating.toFixed(2)} / 5
        </h1>
        <p className="text-gray-600 mt-2 text-lg font-medium flex items-center justify-center">
          <FaComments className="mr-2 text-blue-500" />
          ทั้งหมด {reviews.length} ความคิดเห็น
        </p>
      </div>

      {/* 📚 Review List */}
      <h2 className="text-2xl font-bold text-orange-500 mb-6 text-center">
        ความคิดเห็นจากผู้ใช้งาน
      </h2>

      {/* 🖥️ Desktop Grid View */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* 📱 Mobile Scrollable View */}
      <div className="relative md:hidden mt-6">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-orange-500 shadow-lg p-3 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out"
        >
          <FaChevronLeft />
        </button>

        {/* Scrollable Reviews */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 no-scrollbar py-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-orange-500 shadow-lg p-3 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default ReviewSection;
