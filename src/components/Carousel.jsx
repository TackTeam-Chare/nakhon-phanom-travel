"use client";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Carousel = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch("/api/tourist-attractions");
        const data = await response.json();

        if (Array.isArray(data)) {
          setPlaces(data);
        } else {
          setPlaces([]);
        }
      } catch (error) {
        setPlaces([]);
      } finally {
        setLoading(false);
      }
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
            <div key={place.placeId} className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
              <Image
                src={place.thumbnailUrl}
                alt={place.name}
                layout="fill"
                objectFit="cover"
                quality={100}
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-start p-8 md:p-16 lg:p-24">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-yellow-400">
                  {place.name}
                </h2>
                <h3 className="text-lg md:text-xl lg:text-2xl text-white mt-2">
                  {place.subDistrict}, {place.district}, {place.province}
                </h3>
                <p className="text-md md:text-lg lg:text-xl text-white mt-4 max-w-3xl">
                  {place.introduction}
                </p>
              </div>
            </div>
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
