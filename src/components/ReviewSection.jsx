"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaCommentDots,
  FaComments,
  FaQuoteLeft,
  FaQuoteRight,
} from "react-icons/fa";

const ReviewCard = ({ review }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative p-6 bg-white backdrop-blur-sm rounded-xl transform transition-all duration-300 ease-out hover:scale-102 group"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)"
          : "0 10px 20px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Elements */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-2xl transition-all duration-300 group-hover:scale-150 opacity-0 group-hover:opacity-100" />
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {review.userImage ? (
              <Image
                src={review.userImage}
                alt={review.username}
                width={56}
                height={56}
                className="rounded-full object-cover ring-2 ring-orange-500/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <FaUserCircle className="text-white text-2xl" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">
              {review.username || "ผู้ใช้งานทั่วไป"}
            </h4>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <FaCalendarAlt className="mr-2 text-orange-500" />
              {new Date(review.created_at).toLocaleDateString("th-TH", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <FaStar
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className={`w-4 h-4 ${
                  index < review.rating
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 mt-1">
            {review.rating}/5
          </span>
        </div>
      </div>

      {/* Comment Section */}
      <div className="relative">
        <FaQuoteLeft className="absolute -top-4 -left-2 text-orange-500/20 text-3xl" />
        <p className="text-gray-600 leading-relaxed px-4 py-2">
          {review.comment}
        </p>
        <FaQuoteRight className="absolute -bottom-4 -right-2 text-orange-500/20 text-3xl" />
      </div>
    </div>
  );
};

const ReviewSection = ({ rating, reviews }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      {/* Rating Summary */}
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-yellow-500/5 to-orange-500/5 blur-3xl" />
        <div className="relative bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg mb-4">
            <FaStar className="text-white text-3xl" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            {rating.toFixed(2)}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <FaStar
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className={`w-6 h-6 ${
                  index < Math.round(rating)
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600 mt-4 flex items-center justify-center text-lg">
            <FaComments className="mr-2 text-blue-500" />
            {reviews.length} รีวิวจากผู้ใช้งาน
          </p>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 blur-3xl" />
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Mobile Scrollable View */}
      <div className="relative md:hidden">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
          onClick={scrollLeft}
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-orange-500 shadow-lg p-4 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
          <FaChevronLeft />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 no-scrollbar py-4 px-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {reviews.map((review) => (
            <div key={review.id} className="min-w-[300px] max-w-[90vw]">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
          onClick={scrollRight}
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-orange-500 shadow-lg p-4 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default ReviewSection;