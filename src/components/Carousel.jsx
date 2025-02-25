"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ClipLoader from "react-spinners/ClipLoader";
import "react-multi-carousel/lib/styles.css";
import Carousel from "react-multi-carousel";
import { fetchTouristAttractions } from "@/services/api/api";
import { MapPin, Landmark } from "lucide-react";

const TouristCarousel = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // เรียกครั้งแรกเพื่อเช็กขนาดหน้าจอเมื่อ component mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      const data = await fetchTouristAttractions();
      setPlaces(data);
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 1 },
    desktop: { breakpoint: { max: 1024, min: 768 }, items: 1 },
    tablet: { breakpoint: { max: 768, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <ClipLoader color="#FF7043" size={70} />
        </div>
      ) : places.length > 0 ? (
        <Carousel
          responsive={responsive}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={3000}
          arrows={!isMobile}
          showDots={true}
        >
          {places.map((place) => (
            <Link
              key={place.placeId}
              href={`/places/tourist-attractions/${place.placeId}`}
              passHref
            >
              <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden cursor-pointer">
                {place.thumbnailUrl ? (
                  <Image
                    src={place.thumbnailUrl}
                    alt={place.name}
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                    className="object-cover object-center"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-700 text-lg">ไม่มีรูปภาพ</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end items-start p-8 md:p-12 lg:p-16 text-white">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-yellow-400">
                    {place.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Landmark className="w-6 h-6 text-yellow-300" />
                    <span className="text-lg md:text-xl lg:text-2xl">
                      {place.category || "ไม่มีข้อมูลหมวดหมู่"}
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <MapPin className="w-5 h-5 text-yellow-300 mr-2" />
                    <span className="text-md md:text-lg lg:text-xl">
                      {place.subDistrict}, {place.district}, {place.province}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>
      ) : (
        <div className="flex justify-center items-center h-[80vh] text-gray-700 text-lg">
          ไม่พบข้อมูลสถานที่ท่องเที่ยว
        </div>
      )}
    </div>
  );
};

export default TouristCarousel;
