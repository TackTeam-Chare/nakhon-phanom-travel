"use client"
import React, { useEffect, useState } from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import Link from "next/link";
import { useLoadScript } from "@react-google-maps/api";
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
  // FaRoute,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { getNearbyFetchTourismData } from "@/services/user/api";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import dynamic from "next/dynamic";
const MapComponent = dynamic(() => import("@/components/Map/MapNearbyPlaces"), {
  ssr: false
});

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

// ฟังก์ชันช่วยแสดงหมายเหตุในคำอธิบาย
const highlightNoteInDescription = (description) => (
  <>
    {description}
    <p className="text-sm text-gray-500 mt-2">
      <span className="font-bold text-red-500">หมายเหตุ:</span> รูปภาพประกอบอาจนำมาจากแหล่งภายนอก เช่น <em>Google Maps</em> หรือ <em>เพจ Facebook</em>
    </p>
  </>
);

const getSeasonIcon = (seasonName) => {
  switch (seasonName) {
    case "ฤดูร้อน":
      return <FaSun className="text-orange-500 mr-2" />;
    case "ฤดูฝน":
      return <FaCloudRain className="text-orange-500 mr-2" />;
    case "ฤดูหนาว":
      return <FaSnowflake className="text-orange-500 mr-2" />;
    case "ตลอดทั้งปี":
      return <FaGlobe className="text-orange-500 mr-2" />;
    default:
      return <FaLayerGroup className="text-orange-500 mr-2" />;
  }
};


const getSeasonColor = (seasonName) => {
  switch (seasonName) {
    case "ฤดูร้อน":
      return "text-orange-500";
    case "ฤดูฝน":
      return "text-blue-500";
    case "ฤดูหนาว":
      return "text-teal-500";
    case "ตลอดทั้งปี":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

const CustomLeftArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-orange-500 shadow-lg p-2 rounded-full z-10 hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out"
    style={{ margin: "0 15px" }}
  >
    <FaChevronLeft />
  </button>
);

const CustomRightArrow = ({ onClick }) => (
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
  images.forEach((image) => {
    if (!uniqueImages.has(image.image_url)) {
      uniqueImages.set(image.image_url, image);
    }
  });
  return Array.from(uniqueImages.values());
};

// const convertMetersToKilometers = (meters) => (meters / 1000).toFixed(2);

const getCurrentTimeInThailand = () => {
  // สร้างออบเจ็กต์ Date สำหรับเวลาในปัจจุบัน (เวลาท้องถิ่นของระบบ)
  const now = new Date();

  // คำนวณเวลาใน UTC (ลบด้วย Timezone Offset ของระบบปัจจุบัน) 
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  // เพิ่ม 7 ชั่วโมง (7 * 60 * 60 * 1000 มิลลิวินาที) เพื่อแปลงเป็นเวลาไทย (UTC+7)
  const thailandTime = new Date(utcTime + 7 * 60 * 60 * 1000);

  // ส่งค่าเวลาในไทยกลับไป
  return thailandTime;
};

const isOpenNow = (operatingHours) => {
  // ถ้า `operatingHours` ไม่มีข้อมูล หรือมีความยาวเป็น 0 ให้ return false ทันที (แปลว่าไม่เปิด)
  if (!operatingHours || operatingHours.length === 0) return false;

  // เรียกฟังก์ชัน `getCurrentTimeInThailand()` เพื่อรับเวลาไทยปัจจุบัน
  const now = getCurrentTimeInThailand();

  // ดึงค่าของวันปัจจุบัน (0 สำหรับวันอาทิตย์, 1 สำหรับวันจันทร์, ... , 6 สำหรับวันเสาร์)
  const currentDay = now.getDay(); 

  // แปลงเวลาเป็นรูปแบบ HHMM (เช่น 14:30 จะกลายเป็น 1430)
  const currentTime = now.getHours() * 100 + now.getMinutes(); 

  // ค้นหาเวลาเปิด-ปิดสำหรับวันปัจจุบัน หรือสำหรับ "Everyday" (เปิดทุกวัน)
  const todayOperatingHours = operatingHours.find((hours) => {
    return (
      hours.day_of_week ===
        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][currentDay] ||
      hours.day_of_week === "Everyday" // ตรวจสอบว่าตรงกับ "เปิดทุกวัน" หรือไม่
    );
  });

  // ถ้าพบเวลาเปิด-ปิดสำหรับวันนั้น
  if (todayOperatingHours) {
    // แปลงเวลาเปิดและปิดจากรูปแบบ HH:MM เป็นตัวเลข (เช่น "09:00" จะกลายเป็น 900)
    const openingTime = parseInt(todayOperatingHours.opening_time.replace(":", ""));
    const closingTime = parseInt(todayOperatingHours.closing_time.replace(":", ""));

    // กรณีที่สถานที่เปิดข้ามวัน (ปิดหลังเที่ยงคืน)
    if (closingTime < openingTime) {
      // ตรวจสอบว่าปัจจุบันเป็นช่วงเปิดหรือไม่ (ก่อนปิดหลังเที่ยงคืน หรือหลังเปิดก่อนเที่ยงคืน)
      return currentTime >= openingTime || currentTime <= closingTime;
    } else {
      // กรณีทั่วไป: ตรวจสอบว่าเวลาปัจจุบันอยู่ในช่วงเปิด-ปิดหรือไม่
      return currentTime >= openingTime && currentTime <= closingTime;
    }
  }

  // ถ้าไม่มีเวลาเปิด-ปิดตรงกับวันปัจจุบัน ให้ return false (สถานที่ไม่เปิด)
  return false;
};

// ตรวจสอบว่าสถานที่ใกล้เปิดหรือใกล้ปิดหรือไม่
const getTimeUntilNextEvent = (openingTime, closingTime) => {
  // เรียกใช้ฟังก์ชัน `getCurrentTimeInThailand()` เพื่อรับเวลาไทยปัจจุบัน
  const now = getCurrentTimeInThailand();

  // แปลงเวลาปัจจุบันเป็นรูปแบบ HHMM (เช่น 14:30 จะกลายเป็น 1430)
  const currentTime = now.getHours() * 100 + now.getMinutes();

  // แปลงเวลาเปิดและปิดจากรูปแบบ "HH:MM" เป็นตัวเลข เช่น "09:00" จะกลายเป็น 900
  const openingTimeInt = parseInt(openingTime.replace(":", ""));
  const closingTimeInt = parseInt(closingTime.replace(":", ""));

  // ตรวจสอบกรณีที่สถานที่เปิดข้ามวัน (ปิดหลังเที่ยงคืน)
  if (closingTimeInt < openingTimeInt) {
    // ถ้าเวลาปัจจุบันอยู่ในช่วงที่เปิดข้ามวัน (เช่น 22:00 - 03:00)
    if (currentTime >= openingTimeInt || currentTime <= closingTimeInt) {
      const timeUntilClose = closingTimeInt - currentTime; // เวลาที่เหลือก่อนปิด

      // ถ้าเหลือเวลาปิดไม่เกิน 1 ชั่วโมง (เช่น 100 นาที)
      if (timeUntilClose <= 100) {
        return { status: "Closing Soon" }; // แจ้งว่าใกล้ปิด
      }
    }
  } else {
    // กรณีปกติ: ตรวจสอบเวลาเปิด-ปิดภายในวันเดียวกัน
    if (currentTime < openingTimeInt) {
      // ถ้าเวลาปัจจุบันยังไม่ถึงเวลาเปิด
      const timeUntilOpen = openingTimeInt - currentTime; // เวลาที่เหลือก่อนเปิด

      // ถ้าเหลือเวลาเปิดไม่เกิน 1 ชั่วโมง
      if (timeUntilOpen <= 100) {
        return { status: "Opening Soon" }; // แจ้งว่าใกล้เปิด
      }
    } else if (currentTime < closingTimeInt) {
      // ถ้าเวลาปัจจุบันอยู่ในช่วงเวลาเปิด
      const timeUntilClose = closingTimeInt - currentTime; // เวลาที่เหลือก่อนปิด

      // ถ้าเหลือเวลาปิดไม่เกิน 1 ชั่วโมง
      if (timeUntilClose <= 100) {
        return { status: "Closing Soon" }; // แจ้งว่าใกล้ปิด
      }
    }
  }

  // ถ้าไม่อยู่ในสถานะใกล้เปิดหรือปิด ให้คืนค่า status เป็น null
  return { status: null };
};

const PlaceNearbyPage = ({ params }) => {
  const { id } = params;
 const [tourismData, setTourismData] = useState(null); // สร้าง state เพื่อเก็บข้อมูลของสถานที่ (ใช้ค่าเริ่มต้นเป็น `null`)
 const [nearbyEntities, setNearbyEntities] = useState([]);  // สร้าง state สำหรับเก็บข้อมูลสถานที่ใกล้เคียง (ค่าเริ่มต้นเป็น array ว่าง)
 const [showOperatingHours, setShowOperatingHours] = useState(false);  // สร้าง state เพื่อตรวจสอบว่าจะแสดงเวลาเปิด-ปิดหรือไม่ (ค่าเริ่มต้นเป็น `false`)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const toggleOperatingHours = () => setShowOperatingHours(!showOperatingHours);

  useEffect(() => {
    // ฟังก์ชัน Async สำหรับดึงข้อมูลสถานที่ท่องเที่ยวและสถานที่ใกล้เคียง
    const fetchTourismData = async () => {
      // ตรวจสอบว่ามี id ของสถานที่ถูกส่งมาหรือไม่
      if (id) {
        try {
          // ดึงข้อมูลสถานที่โดยใช้ฟังก์ชัน getNearbyFetchTourismData และแปลง id เป็นตัวเลข
          const data = await getNearbyFetchTourismData(Number(id));
  
          // ถ้าสถานที่มีภาพ ให้ลบภาพที่ซ้ำกัน
          if (data.entity && data.entity.images) {
            data.entity.images = removeDuplicateImages(data.entity.images);
          }
  
          // ถ้ามีสถานที่ใกล้เคียง ให้ลบภาพซ้ำของแต่ละสถานที่
          if (data.nearbyEntities) {
            data.nearbyEntities = data.nearbyEntities.map((entity) => {
              if (entity.images) {
                entity.images = removeDuplicateImages(entity.images);
              }
              return entity; // คืนค่า entity ที่ถูกลบภาพซ้ำแล้ว
            });
          }
  
          // อัปเดต state ด้วยข้อมูลสถานที่และสถานที่ใกล้เคียง
          setTourismData(data.entity);
          setNearbyEntities(data.nearbyEntities);
  
          // ถ้าไม่มีสถานที่ใกล้เคียง แสดง SweetAlert แจ้งผู้ใช้
          if (!data.nearbyEntities || data.nearbyEntities.length === 0) {
            Swal.fire("No Nearby Places", "ไม่พบสถานที่ใกล้เคียง", "info");
          }
        } catch (error) {
          // กรณีเกิดข้อผิดพลาด ให้แสดงข้อความ Error ด้วย SweetAlert
          console.error("Error fetching tourism data:", error);
          Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง", "error");
        }
      }
    };
  
    // เรียกใช้ฟังก์ชัน fetchTourismData เมื่อ component ถูกสร้างขึ้นหรือ id เปลี่ยนแปลง
    fetchTourismData();
  }, [id]); // ทำงานเมื่อค่า id เปลี่ยนแปลง
  

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <ClipLoader size={50} color={"#FF7043"} loading={!isLoaded} />
        <p className="mt-4 text-gray-600">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  if (!tourismData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <ClipLoader size={50} color={"#FF7043"} loading={!tourismData} />
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลสถานที่ท่องเที่ยว...</p>
      </div>
    );
  }

  const isValidCoordinates =
    !isNaN(Number(tourismData.latitude)) && !isNaN(Number(tourismData.longitude));

    const categoryIcons = {
      "สถานที่ท่องเที่ยว": { icon: <FaLandmark className="text-orange-500" />, color: "text-orange-500" },
      "ที่พัก": { icon: <FaHome className="text-orange-500" />, color: "text-orange-500" },
      "ร้านอาหาร": { icon: <FaUtensils className="text-orange-500" />, color: "text-orange-500" },
      "ร้านค้าของฝาก": { icon: <FaStore className="text-orange-500" />, color: "text-orange-500" },
    };
    
    const getCategoryDetails = (categoryName) =>
      categoryIcons[categoryName] || { icon: <FaLayerGroup className="text-orange-500" />, color: "text-orange-500" };
    

  return (
    <div className="container mx-auto mt-12 mb-12 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <Slide easing="ease" prevArrow={<CustomLeftArrow />} nextArrow={<CustomRightArrow />}>
            {Array.isArray(tourismData.images) && tourismData.images.length > 0 ? (
              tourismData.images.map((image, index) => (
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
          <h1 className="text-4xl md:text-3xl lg:text-5xl font-bold text-orange-500">
            {tourismData.name}
          </h1>

          {/* District and Category */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-lg">
              <FaMapMarkerAlt className="text-orange-500 mr-2 text-2xl" />
              <strong className="text-gray-600">{tourismData.district_name}</strong>
            </div>
            <div className={`flex items-center text-lg ${getCategoryDetails(tourismData.category_name).color}`}>
              {getCategoryDetails(tourismData.category_name).icon}
              <strong className="ml-2 text-gray-600">
                {tourismData.category_name}
              </strong>
            </div>
            {/* Check if it's a tourist spot */}
            {tourismData.category_name === "สถานที่ท่องเที่ยว" && (
              <div className={`flex items-center  text-lg ${getSeasonColor(tourismData.season_name)}`}>
                {getSeasonIcon(tourismData.season_name)}
                <strong className="text-gray-600">
                  {tourismData.season_name}
                </strong>
              </div>
            )}
          </div>

        {/* Description */}
<div className="flex items-center text-gray-600">
  <FaInfoCircle className="text-orange-500 mr-2 text-3xl" />
  <span>{highlightNoteInDescription(tourismData.description)}</span>
</div>


          {/* Location */}
          <div className="flex items-center text-gray-600">
            <FaHome className="text-orange-500 mr-2 text-3xl" />
            <span>{tourismData.location}</span>
          </div>

          {tourismData.category_name !== "ที่พัก" && (
  <div className="flex items-center font-bold text-lg">
    {isOpenNow(tourismData.operating_hours) ? (
      <span className="text-green-500 flex items-center">
        <FaCheckCircle className="mr-1" /> เปิดทำการ
      </span>
    ) : (
      <span className="text-red-500 flex items-center">
        <FaTimesCircle className="mr-1" /> ปิดทำการ
      </span>
    )}

    {/* ตรวจสอบเพียงครั้งเดียวเพื่อแสดงสถานะ "ใกล้เปิดเร็วๆนี้" หรือ "ใกล้ปิดเร็วๆนี้" */}
    {tourismData.operating_hours.some((hours) => {
      const nextEvent = getTimeUntilNextEvent(hours.opening_time, hours.closing_time);
      return nextEvent.status === "Opening Soon" || nextEvent.status === "Closing Soon";
    }) && (
      <span className="ml-4 flex items-center text-red-500">
      <FaClock className="mr-1" />
      {tourismData.operating_hours.some((hours) => getTimeUntilNextEvent(hours.opening_time, hours.closing_time).status === "Opening Soon")
        ? "ใกล้เปิดเร็วๆนี้"
        : "ใกล้ปิดเร็วๆนี้"}
    </span>
    
    )}
  </div>
)}
          {/* Operating Hours */}
          {tourismData.category_name !== "ที่พัก" && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
              <h2
                className="text-lg text-orange-500 font-black mb-3 flex items-center cursor-pointer"
                onClick={toggleOperatingHours}
              >
                <FaClock className="text-orange-500 mr-2" />
                ช่วงวันเวลาทำการของสถานที่
                {showOperatingHours ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </h2>

              {showOperatingHours && tourismData.operating_hours && tourismData.operating_hours.length > 0 ? (
                <ul className="mt-4">
                  {tourismData.operating_hours.map((hours, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-none"
                    >
                      <div className="flex items-center space-x-2">
                        <FaCalendarDay className="text-orange-500" />
                        <span className="font-medium text-gray-700">
                          {hours.day_of_week === "Sunday"
                            ? "วันอาทิตย์"
                            : hours.day_of_week === "Monday"
                            ? "วันจันทร์"
                            : hours.day_of_week === "Tuesday"
                            ? "วันอังคาร"
                            : hours.day_of_week === "Wednesday"
                            ? "วันพุธ"
                            : hours.day_of_week === "Thursday"
                            ? "วันพฤหัสบดี"
                            : hours.day_of_week === "Friday"
                            ? "วันศุกร์"
                            : hours.day_of_week === "Saturday"
                            ? "วันเสาร์"
                            : hours.day_of_week === "Everyday"
                            ? "ทุกวัน"
                            : hours.day_of_week === "Except Holidays"
                            ? "ยกเว้นวันหยุด"
                            : hours.day_of_week}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {hours.opening_time ? (
                          <>
                            <FaRegClock className="text-green-500" />
                            <span>{hours.opening_time}</span>
                            <FaArrowRight className="text-gray-500 mx-1" />
                            <FaRegClock className="text-red-500" />
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
        
        {/* ตรวจสอบว่าพิกัดถูกต้องหรือไม่ หากพิกัดถูกต้อง จะแสดงข้อมูลสถานที่และแผนที่ พร้อมตำแหน่งของสถานที่ใกล้เคียง */}
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
          // หากพิกัดไม่ถูกต้อง จะแสดงข้อความ "ไม่พบข้อมูลพิกัดสถานที่"
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
                    {/* <p className={`font-bold flex items-center mb-2 ${getCategoryDetails(entity.category_name).color}`}>
                      {getCategoryDetails(entity.category_name).icon}
                      <span className="ml-2">{entity.category_name}</span>
                    </p> */}
                    <p className="text-gray-600 line-clamp-2">
                      {entity.description}
                    </p>
                    {/* <p className="text-orange-500 font-bold flex items-center">
                      <FaRoute className="mr-2" />
                      ระยะห่าง {convertMetersToKilometers(entity.distance)} กิโลเมตร
                    </p> */}
                  </div>

                  {/* Status Section (Open/Closed) */}
                  <div className="flex justify-end mt-5">
                    {isOpenNow(entity.operating_hours) ? (
                      <span className="text-green-500 font-bold flex items-center mr-2">
                        <FaCheckCircle className="mr-1" /> เปิดทำการ
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold flex items-center mr-2">
                        <FaTimesCircle className="mr-1" /> ปิดทำการ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default PlaceNearbyPage;