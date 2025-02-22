"use client";

import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { fetchRestaurants } from "../../services/user/api";
import Image from "next/image";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

const Restaurants = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const data = await fetchRestaurants();
        setAttractions(data);
      } catch (error) {
        console.error("Error fetching real-time tourist attractions:", error);
      } finally {
        setLoading(false); // ตั้งค่า loading เป็น false หลังดึงข้อมูลเสร็จ
      }
    };

    fetchAttractions();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto mt-10 mb-10 px-4 flex justify-center items-center h-[300px]">
        <ClipLoader size={50} color={"#F97316"} loading={loading} />
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="container mx-auto mt-10 mb-10 px-4 text-center">
        <p className="text-gray-500 text-lg">ไม่มีข้อมูลร้านอาหาร</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 mb-10 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500 mt-10 mb-5">
        ร้านอาหาร
      </h1>
      <div>
        <Carousel
          responsive={responsive}
          swipeable={true}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={3000}
          containerClass="carousel-container"
          itemClass="carousel-item-padding-20-px"
        >
          {attractions.map((attraction) => (
            <Link
              key={attraction.id}
              href={`/place/${attraction.id}`}
              className="p-2 sm:p-3 block"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full min-h-[350px] max-h-[400px]">
                {attraction.image_url?.[0] ? (
                  <Image
                    src={attraction.image_url[0]}
                    alt={attraction.name}
                    width={300}
                    height={200}
                    className="rounded-t-lg object-cover w-full h-36 sm:h-40"
                  />
                ) : (
                  <div className="w-full h-36 sm:h-40 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
                <div className="p-3 flex flex-col justify-between flex-grow">
                  <div className="mb-2">
                    <h3 className="text-base sm:text-lg font-semibold line-clamp-1">
                      {attraction.name}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base line-clamp-4">
                      {attraction.description}
                    </p>
                  </div>
                  <p className="text-orange-500 font-bold mt-1 text-sm sm:text-base">
                    {attraction.district_name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>
        <div className="flex justify-end mt-4">
          <Link
            href="/places/restaurants"
            className="bg-orange-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-orange-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            ดูทั้งหมด
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Restaurants;
