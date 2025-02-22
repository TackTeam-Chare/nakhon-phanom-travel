"use client"
import React, { useEffect, useState } from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import Link from "next/link";
import { useLoadScript } from "@react-google-maps/api";
import ReviewSection from "@/components/ReviewSection"
import {
  FaSun,
  FaCloudRain,
  FaSnowflake,
  FaGlobe,
  FaUtensils,
  FaCheckCircle,
  FaStore,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaLandmark,
  FaHome,
  FaClock,
  FaTimesCircle,
  FaLayerGroup,
  FaMapSigns,
  FaChevronDown,
  FaCalendarDay,
  FaChevronUp,
  FaRegClock,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { getNearbyFetchTourismData } from "@/services/user/api";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import MapComponent from "@/components/Map/MapNearbyPlaces";
import ReviewForm from "@/components/ReviewModal";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

const getSeasonIcon = (seasonName) => {
  const iconClass = "text-orange-500 font-bold mr-2";
  switch (seasonName) {
    case "ฤดูร้อน":
      return <FaSun className={iconClass} />;
    case "ฤดูฝน":
      return <FaCloudRain className={iconClass} />;
    case "ฤดูหนาว":
      return <FaSnowflake className={iconClass} />;
    case "ตลอดทั้งปี":
      return <FaGlobe className={iconClass} />;
    default:
      return <FaLayerGroup className={iconClass} />;
  }
};



const CustomLeftArrow = ({ onClick }) => (
  // biome-ignore lint/a11y/useButtonType: <explanation>
<button
    onClick={onClick}
    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-orange-500 shadow-lg p-2 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out"
    style={{ margin: "0 15px" }}
  >
    <FaChevronLeft />
  </button>
);

const CustomRightArrow = ({ onClick }) => (
  // biome-ignore lint/a11y/useButtonType: <explanation>
<button
    onClick={onClick}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-orange-500 shadow-lg p-2 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out"
    style={{ margin: "0 15px" }}
  >
    <FaChevronRight />
  </button>
);

const removeDuplicateImages = (images) => {
  const uniqueImages = new Map();
  // biome-ignore lint/complexity/noForEach: <explanation>
  images.forEach((image) => {
    if (!uniqueImages.has(image.image_url)) {
      uniqueImages.set(image.image_url, image);
    }
  });
  return Array.from(uniqueImages.values());
};

const getCurrentTimeInThailand = () => {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const thailandTime = new Date(utcTime + 7 * 60 * 60 * 1000);
  return thailandTime;
};

const isOpenNow = (operatingHours) => {
  if (!operatingHours || operatingHours.length === 0) return false;

  const now = getCurrentTimeInThailand();
  const currentDay = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Time in HHMM format

  const todayOperatingHours = operatingHours.find((hours) => {
    return (
      hours.day_of_week ===
        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][currentDay] ||
      hours.day_of_week === "Everyday"
    );
  });

  if (todayOperatingHours) {
    const openingTime = Number.parseInt(todayOperatingHours.opening_time.replace(":", ""));
    const closingTime = Number.parseInt(todayOperatingHours.closing_time.replace(":", ""));

    // Handle overnight open hours (closing after midnight)
    if (closingTime < openingTime) {
      return currentTime >= openingTime || currentTime <= closingTime;
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return currentTime >= openingTime && currentTime <= closingTime;
    }
  }

  return false;
};

const PlaceNearbyPage = ({ params }) => {
  const { id } = params;
  const [tourismData, setTourismData] = useState(null);
  const [nearbyEntities, setNearbyEntities] = useState([]);
  const [showOperatingHours, setShowOperatingHours] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const toggleOperatingHours = () => setShowOperatingHours(!showOperatingHours);

  useEffect(() => {
    const fetchTourismData = async () => {
      if (id) {
        try {
          const data = await getNearbyFetchTourismData(Number(id));
          // biome-ignore lint/complexity/useOptionalChain: <explanation>
          if (data.entity && data.entity.reviews) {
            setReviews(data.entity.reviews);
            setRating(data.entity.rating || 0);
            setTotalReviews(data.entity.reviews.length || 0);
          }
          // biome-ignore lint/complexity/useOptionalChain: <explanation>
          if (data.entity && data.entity.images) {
            data.entity.images = removeDuplicateImages(data.entity.images);
          }
          if (data.nearbyEntities) {
            data.nearbyEntities = data.nearbyEntities.map((entity) => {
              if (entity.images) {
                entity.images = removeDuplicateImages(entity.images);
              }
              return entity;
            });
          }
          setTourismData(data.entity);
          setNearbyEntities(data.nearbyEntities);

          // if (!data.nearbyEntities || data.nearbyEntities.length === 0) {
          //   Swal.fire("No Nearby Places", "ไม่พบสถานที่ใกล้เคียง", "info");
          // }
        } catch (error) {
          console.error("Error fetching tourism data:", error);
          // Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง", "error");
        }
      }
    };

    fetchTourismData();
  }, [id]);

  // if (!isLoaded) {
  //   return (
  //                <div className="flex flex-col justify-center items-center h-screen">
  //           <ClipLoader  color={"#FF7043"}  size={50} />
  //           <span className="ml-4 text-orange-500 font-medium">กำลังโหลดหน้าเว็บ รอสักครู่...</span>
  //         </div>
  //   );
  // }

  if (!tourismData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <ClipLoader size={50} color={"#FF7043"} loading={!tourismData} />
        <span className="ml-4 text-orange-500 font-medium">กำลังโหลดหน้าเว็บ รอสักครู่...</span>
      </div>
    );
  }

  const isValidCoordinates =
    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    !isNaN(Number(tourismData.latitude)) && !isNaN(Number(tourismData.longitude));

  const categoryIcons = {
    "สถานที่ท่องเที่ยว": { icon: <FaLandmark />, color: "text-blue-500" },
    "ที่พัก": { icon: <FaHome />, color: "text-purple-500" },
    "ร้านอาหาร": { icon: <FaUtensils />, color: "text-red-500" },
    "ร้านค้าของฝาก": { icon: <FaStore />, color: "text-green-500" },
  };

  const getCategoryDetails = (categoryName) =>
    categoryIcons[categoryName] || { icon: <FaLayerGroup />, color: "text-gray-500" };

  return (
    <div className="container mx-auto mt-12 mb-12 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <Slide easing="ease" prevArrow={<CustomLeftArrow />} nextArrow={<CustomRightArrow />}>
            {Array.isArray(tourismData.images) && tourismData.images.length > 0 ? (
              tourismData.images.map((image, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index}>
                  <Image
                    src={image.image_url}
                    alt={`Slide ${index + 1}`}
                    width={1200}
                    height={800}
                    className="rounded-lg shadow-lg object-cover w-full h-[40vh] lg:h-[60vh]"
                    priority
                    quality={100}
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-[40vh] lg:h-[60vh] flex items-center justify-center bg-gray-200 rounded-lg shadow-lg">
                <p className="text-gray-500">ไม่มีรูปภาพ</p>
              </div>
            )}
          </Slide>
        </div>
      {/* Information about the place */}
<div className="w-full lg:w-1/2 space-y-6">
  {/* Place Name */}
  <h1 className="text-4xl md:text-3xl lg:text-5xl font-bold text-orange-500 break-words">
    {tourismData.name}
  </h1>

  {/* District and Category */}
  <div className="flex flex-col space-y-2">
    <div className="flex items-center text-lg">
      <FaMapMarkerAlt className="text-orange-500 mr-2 w-6 h-6" />
      <strong className="text-gray-700 break-words">{tourismData.district_name}</strong>
    </div>
    <div className="flex items-center text-lg">
      <div className="w-6 h-6 flex justify-center items-center text-orange-500">
        {getCategoryDetails(tourismData.category_name).icon}
      </div>
      <strong className="ml-2 text-black font-bold break-words">
        {tourismData.category_name}
      </strong>
    </div>
    {/* Check if it's a tourist spot */}
    {tourismData.category_name === "สถานที่ท่องเที่ยว" && (
      <div className="flex items-center text-lg">
        <div className="w-6 h-6 flex justify-center items-center">
          {getSeasonIcon(tourismData.season_name)}
        </div>
        <strong className="ml-2">{tourismData.season_name}</strong>
      </div>
    )}
  </div>

  {/* Description */}
  <div className="flex items-start text-gray-600">
    <FaInfoCircle className="text-orange-500 mr-2 w-6 h-6 flex-shrink-0" />
    <p className="text-sm sm:text-base break-words">{tourismData.description}</p>
  </div>

  {/* Location */}
  <div className="flex items-start text-gray-600">
    <FaHome className="text-orange-500 mr-2 w-6 h-6 flex-shrink-0" />
    <p className="text-sm sm:text-base break-words">{tourismData.location}</p>
  </div>

  {/* Open/Closed Status */}
  {tourismData.category_name !== "ที่พัก" && (
    <div className="flex items-center font-bold text-lg">
      {isOpenNow(tourismData.operating_hours) ? (
        <span className="text-green-500 flex items-center">
          <FaCheckCircle className="mr-1 w-6 h-6" /> เปิดทำการ
        </span>
      ) : (
        <span className="text-red-500 flex items-center">
          <FaTimesCircle className="mr-1 w-6 h-6" /> ปิดทำการ
        </span>
      )}
    </div>
  )}

  {/* Operating Hours */}
  {tourismData.category_name !== "ที่พัก" && (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
<h2
        className="text-lg text-orange-500 font-black mb-3 flex items-center cursor-pointer"
        onClick={toggleOperatingHours}
      >
        <FaClock className="text-orange-500 mr-2 w-6 h-6" />
        ช่วงวันเวลาทำการของสถานที่
        {showOperatingHours ? (
          <FaChevronUp className="ml-2 w-6 h-6" />
        ) : (
          <FaChevronDown className="ml-2 w-6 h-6" />
        )}
      </h2>
      {showOperatingHours && tourismData.operating_hours && tourismData.operating_hours.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {tourismData.operating_hours.map((hours, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<li key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-none">
              <div className="flex items-center space-x-2">
                <FaCalendarDay className="text-orange-500 w-6 h-6 flex-shrink-0" />
                <span className="font-medium text-gray-700">{hours.day_of_week}</span>
              </div>
              <div className="flex items-center space-x-1">
                {hours.opening_time ? (
                  <>
                    <FaRegClock className="text-green-500 w-6 h-6 flex-shrink-0" />
                    <span>{hours.opening_time}</span>
                    <FaArrowRight className="text-gray-500 mx-1 w-6 h-6 flex-shrink-0" />
                    <FaRegClock className="text-red-500 w-6 h-6 flex-shrink-0" />
                    <span>{hours.closing_time}</span>
                  </>
                ) : (
                  <span className="text-gray-500">ปิด</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : showOperatingHours && <p>ช่วงวันเวลาทำการของสถานที่ไม่มีอยู่</p>}
    </div>
  )}
</div>

      </div>

      {/* Map Component */}
      <div className="mt-20 mb-10">
        <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-orange-500 mt-10 mb-5 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-5xl text-orange-500" />
          แผนที่
        </h1>

        {isValidCoordinates ? (
          <>
            <div className="text-lg text-gray-700 mb-4 flex items-center">
              <FaMapSigns className="text-orange-500 mr-2" />
              <span className="ml-2 text-orange-600 font-semibold">{tourismData.name}</span>
            </div>

            <MapComponent
              center={{
                lat: Number(tourismData.latitude),
                lng: Number(tourismData.longitude),
              }}
              places={nearbyEntities}
              mainPlace={tourismData}
              isLoaded={isLoaded}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-200 text-gray-600">
            <FaInfoCircle className="text-orange-500 mr-2" />
            <p>ไม่พบข้อมูลพิกัดสถานที่</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-orange-500 mt-10 mb-5">
          สถานที่ใกล้เคียง
        </h1>
      </div>

      <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
        {nearbyEntities.map((entity) => (
          <div key={entity.id} className="p-2 h-full flex">
            <Link href={`/place/${entity.id}`} className="block w-full">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full relative">
                {entity.images && entity.images.length > 0 ? (
                  <Image
                    src={entity.images[0].image_url}
                    alt={entity.name}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
<div className="p-4 flex-grow flex flex-col justify-between">
  <div>
    <h3 className="text-lg font-semibold mb-2 flex items-center">
      {entity.name}
    </h3>
    <p className="text-sm sm:text-base line-clamp-2">
      {entity.description}
    </p>
  </div>
  <p className="text-orange-500 font-bold flex items-center justify-end mt-5">
    {entity.category_name}
  </p>
</div>

              </div>
            </Link>
          </div>
        ))}
      </Carousel>
      <ReviewForm place={tourismData} />
{reviews.length > 0 && (
  <ReviewSection
    rating={rating}
    totalReviews={totalReviews}
    reviews={reviews}
  />
)}

    </div>
  );
};

export default PlaceNearbyPage;
