"use client";

import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { fetchPlacesNearbyByCoordinatesRealTime } from "@/services/user/api";
import Image from "next/image";
import Link from "next/link";

import { FaRoute } from "react-icons/fa";
import { FaHotel, FaStore, FaUtensils, FaLandmark } from "react-icons/fa";

const categoryIcons = {
  "สถานที่ท่องเที่ยว": { icon: <FaLandmark />, color: "text-blue-500" },
  "ที่พัก": { icon: <FaHotel />, color: "text-purple-500" },
  "ร้านอาหาร": { icon: <FaUtensils />, color: "text-red-500" },
  "ร้านค้าของฝาก": { icon: <FaStore />, color: "text-green-500" },
};

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1024 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 768, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const convertMetersToKilometers = (meters) => {
  if (!meters && meters !== 0) {
    return "ไม่ทราบระยะทาง"; // ในกรณีที่ meters เป็น null หรือ undefined
  }

  if (meters >= 1000) {
    return (meters / 1000).toFixed(2) + " กิโลเมตร";
  }
  return meters.toFixed(0) + " เมตร";
};

const NearbyPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // Set state with the fetched coordinates
            setLatitude(latitude);
            setLongitude(longitude);
            
            // Log the user's location to the console
            console.log(`User's location: Latitude ${latitude}, Longitude ${longitude}`);
          },
          (error) => {
            console.error("Error fetching user location:", error);
          }
        );
      } else {
        console.log("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      }
    };
  
    getUserLocation();
  }, []);
  
  

  useEffect(() => {
    const getNearbyPlaces = async () => {
      if (latitude !== null && longitude !== null) {
        try {
          const data = await fetchPlacesNearbyByCoordinatesRealTime(
            latitude,
            longitude
          );
          if (data.length === 0) {
            console.log("ไม่มีสถานที่ใกล้เคียง");
          }
          setPlaces(data);
        } catch (error) {
          console.error("Error fetching places nearby by coordinates:", error);
          console.error("Error fetching places nearby by coordinates:", error);
        }
      }
    };

    getNearbyPlaces();
  }, [latitude, longitude]);

  if (places.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto mt-10 mb-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-orange-500 mt-10 mb-5">
          สถานที่ใกล้เคียง
        </h1>
      </div>
      <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
        {places.map((place) => {
          const category =
            categoryIcons[place.category_name] || {
              icon: <FaRoute />,
              color: "text-gray-500",
            };

          return (
            <div key={place.id} className="p-2 h-full flex">
              <Link href={`/place/${place.id}`} className="block w-full">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full">
                  {place.image_url && place.image_url.length > 0 ? (
                    <Image
                      src={place.image_url[0]}
                      alt={place.name}
                      width={500}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">
                        ไม่มีรูปภาพสถานที่
                      </span>
                    </div>
                  )}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {place.name}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                      {place.description}
                    </p>
                    </div>
                      {/* <p className={`flex items-center font-bold ${category.color}`}>
                        {category.icon}
                        <span className="ml-2">{place.category_name}</span>
                      </p> */}
                <p className="text-orange-500 font-bold flex items-center justify-end m-2 mt-5">
  <FaRoute className="mr-2" />
  {convertMetersToKilometers(place.distance)}{" "}
</p>

                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};

export default NearbyPlaces;
