"use client";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link"; // ✅ เพิ่ม Link สำหรับการนำทาง
import ClipLoader from "react-spinners/ClipLoader";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchTouristAttractions } from "@/services/api/api";
import { MapPin, Landmark } from "lucide-react";

const Carousel = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const data = await fetchTouristAttractions();
      setPlaces(data);
      setLoading(false);
    };

    fetchPlaces();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <ClipLoader color="#FF7043" size={70} />
        </div>
      ) : places.length > 0 ? (
        <Slider {...settings}>
          {places.map((place) => (
            <Link key={place.placeId} href={`/places/tourist-attractions/${place.placeId}`} passHref>
              <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden cursor-pointer">
                <Image
                  src={place.thumbnailUrl}
                  alt={place.name}
                  layout="fill"
                  objectFit="cover"
                  quality={100}
                  className="object-cover object-center"
                  priority
                />
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
        </Slider>
      ) : (
        <div className="flex justify-center items-center h-[80vh] text-white text-lg">
          ไม่พบข้อมูลสถานที่ท่องเที่ยว
        </div>
      )}
    </div>
  );
};

export default Carousel;
