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

// ⭐ การ์ดรีวิว
const ReviewCard = ({ review }) => (
  <div className="shadow-lg rounded-xl p-6 mb-4 border hover:shadow-2xl transition duration-300 ease-in-out min-w-[90%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[30%] mr-4">
    {/* Header */}
    <div className="flex items-center mb-4">
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
      <div className="ml-4">
        <h4 className="font-bold text-lg text-gray-800">
          {review.username || "ผู้ใช้งานทั่วไป"}
        </h4>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <FaCalendarAlt className="mr-1 text-orange-500" />
          {new Date(review.created_at).toLocaleDateString("th-TH")}
        </p>
      </div>
    </div>

    {/* Rating */}
    <div className="flex items-center mb-3 text-yellow-400">
      {Array.from({ length: review.rating }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<FaStar key={index} />
      ))}
    </div>

    {/* Comment */}
    <p className="text-gray-700 mb-3 text-sm flex items-start">
      <FaCommentDots className="text-orange-400 mr-2" />
      {review.comment}
    </p>
  </div>
);

// 🎯 ส่วนหลักแสดงรีวิว
const ReviewSection = ({ rating, reviews }) => {
  const scrollRef = useRef(null);

  // 🔄 เลื่อนไปทางซ้าย
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // 🔄 เลื่อนไปทางขวา
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="container mx-auto px-4 py-10 m-5 mt-10">
      {/* ⭐ สรุปคะแนนและจำนวนความคิดเห็น */}
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

      {/* 📚 รายการรีวิว */}
      <h2 className="text-2xl font-bold text-orange-500 mb-6 text-center">
        ความคิดเห็นจากผู้ใช้งาน
      </h2>

      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Mobile View - เลื่อนรีวิวได้ */}
      <div className="relative md:hidden">
        {/* ปุ่มเลื่อนไปซ้าย */}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
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

        {/* ปุ่มเลื่อนไปขวา */}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
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
