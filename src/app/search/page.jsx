"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaHotel,
  FaUtensils,
  FaStore,
  FaTree,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaLayerGroup,
  FaLeaf,
  FaRoute,
  FaSun,
  FaCloudRain,
  FaSnowflake,
  FaGlobe,
  FaChevronDown,
  FaChevronUp 
} from "react-icons/fa";
import { Circles } from "react-loader-spinner";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchPlacesNearbyByCoordinates,
  searchTouristEntitiesUnified,
  fetchAllFilters
} from "@/services/user/api";
import Image from "next/image";
import { useJsApiLoader } from "@react-google-maps/api";

const MapComponent = dynamic(() => import("@/components/Map/MapSearch"), {
  ssr: false
});

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const Tooltip = dynamic(() => import("react-tooltip"), { ssr: false });

const GeocodingSearchPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    seasons: [],
    districts: [],
    categories: []
  });
  const [searchParams, setSearchParams] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false); 
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false); 
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false); 
  const [selectedDay, setSelectedDay] = useState(null);
  const [isTimeFilterVisible, setIsTimeFilterVisible] = useState(false); 
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isSeasonEnabled, setIsSeasonEnabled] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);  // ติดตามสถานะการค้นหา

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    setIsClient(true); // ตั้งค่าว่าเป็น client-side (เบราว์เซอร์) โดยอัปเดต state
  
    // ประกาศฟังก์ชัน async เพื่อโหลดข้อมูลฟิลเตอร์ทั้งหมด
    const loadFilters = async () => {
      try {
        // เรียกใช้ฟังก์ชัน fetchAllFilters() เพื่อดึงข้อมูลฟิลเตอร์
        const data = await fetchAllFilters();
        setFilters(data); // บันทึกข้อมูลฟิลเตอร์ใน state
      } catch (error) {
        // จัดการข้อผิดพลาดที่เกิดขึ้นระหว่างการดึงข้อมูล
        console.error("Error fetching filters:", error); // แสดงข้อผิดพลาดใน console
      }
    };
  
    loadFilters(); // เรียกใช้ฟังก์ชันเพื่อโหลดฟิลเตอร์เมื่อ component ถูก mount
  }, []); // useEffect จะทำงานเพียงครั้งเดียวเมื่อ component ถูก mount
  

  
  useEffect(() => {
    // ตรวจสอบว่ากำลังรันบน client-side (เบราว์เซอร์) หรือไม่
    if (!isClient) return; // ถ้าไม่ใช่ client-side ให้หยุดการทำงานของ useEffect
  
    // ฟังก์ชันสำหรับอัปเดตตำแหน่งผู้ใช้
    const updateLocation = () => {
      setLoading(true); // ตั้งสถานะการโหลดเป็น true เพื่อแสดงว่าเริ่มการดึงข้อมูลตำแหน่ง
  
      // ใช้ navigator.geolocation เพื่อขอตำแหน่งปัจจุบันของผู้ใช้
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // ดึง latitude และ longitude จากตำแหน่งที่ได้รับ
          const { latitude, longitude } = position.coords;
  
          // แสดงตำแหน่งผู้ใช้ใน console สำหรับ debug
          console.log(`User's location: Latitude ${latitude}, Longitude ${longitude}`);
  
          // บันทึกตำแหน่งผู้ใช้ลงใน state
          setUserLocation({ lat: latitude, lng: longitude });
  
          // ดึงข้อมูลสถานที่ใกล้เคียงตามพิกัดที่ได้รับ
          fetchNearbyPlaces(latitude, longitude);
  
          setLoading(false); // ยกเลิกสถานะการโหลดหลังจากดึงข้อมูลสำเร็จ
        },
        (error) => {
          // จัดการข้อผิดพลาดเมื่อไม่สามารถดึงตำแหน่งผู้ใช้ได้
          console.error("Error getting user's location:", error); // แสดงข้อผิดพลาดใน console
          setLoading(false); // ยกเลิกสถานะการโหลดเมื่อเกิดข้อผิดพลาด
        }
      );
    };
  
    // เรียกใช้ฟังก์ชัน updateLocation เมื่อ useEffect ทำงาน
    updateLocation();
  }, [isClient]); // useEffect จะทำงานใหม่เมื่อค่า isClient เปลี่ยนแปลง
  
  

  const fetchNearbyPlaces = async (lat, lng, radius) => {
    try {
      setLoading(true); // ตั้งสถานะการโหลดเป็น true เพื่อแสดงว่ากำลังดึงข้อมูลสถานที่ใกล้เคียง
  
      // เรียกใช้ฟังก์ชัน fetchPlacesNearbyByCoordinates เพื่อดึงข้อมูลสถานที่ใกล้เคียง
      const data = await fetchPlacesNearbyByCoordinates(lat, lng, radius);
  
      setNearbyPlaces(data); // บันทึกข้อมูลสถานที่ใกล้เคียงลงใน state
    } catch (error) {
      // จัดการข้อผิดพลาด ถ้าการดึงข้อมูลล้มเหลว
      console.error("Error fetching nearby places:", error); // แสดงข้อผิดพลาดใน console
      setNearbyPlaces([]); // ล้างข้อมูลสถานที่ใกล้เคียงในกรณีที่เกิดข้อผิดพลาด
    } finally {
      setLoading(false); // ไม่ว่าจะสำเร็จหรือเกิดข้อผิดพลาด หยุดการโหลดเสมอ
    }
  };
  

  const searchPlaces = async (params) => {
    try {
      setLoading(true); // ตั้งสถานะการโหลดเป็น true เพื่อแสดงว่าเริ่มการค้นหาแล้ว
      setHasSearched(true); // อัปเดตสถานะเพื่อบอกว่ามีการค้นหาเกิดขึ้น
  
      // เรียกใช้ฟังก์ชัน searchTouristEntitiesUnified() เพื่อค้นหาสถานที่โดยส่ง params ไป
      const data = await searchTouristEntitiesUnified(params);
  
      // บันทึกผลลัพธ์การค้นหาใน state
      setSearchResults(data);
  
      if (data.length > 0) { 
        // ถ้ามีผลลัพธ์การค้นหา ให้ตั้งศูนย์กลางแผนที่ไปที่พิกัดของผลลัพธ์แรก
        const firstResult = data[0]; // ดึงรายการแรกจากผลลัพธ์
        setMapCenter({
          lat: Number(firstResult.latitude), // แปลง latitude เป็นตัวเลข
          lng: Number(firstResult.longitude) // แปลง longitude เป็นตัวเลข
        });
      }
    } catch (error) {
      // จัดการข้อผิดพลาด ถ้ามีปัญหาในการค้นหา
      console.error("Error searching places:", error); // แสดงข้อความผิดพลาดใน console
      setSearchResults([]); // ล้างผลลัพธ์การค้นหา
    } finally {
      setLoading(false); // ไม่ว่าการค้นหาจะสำเร็จหรือเกิดข้อผิดพลาด จะหยุดการโหลดเสมอ
    }
  };
  

  const handleSearchByField = (field, value) => {
    // ล้างผลการค้นหาและสถานที่ใกล้เคียงเมื่อมีการอัปเดตฟิลด์ใด ๆ
    setSearchResults([]); 
    setNearbyPlaces([]); 
    
    // อัปเดตพารามิเตอร์การค้นหาและเริ่มการค้นหาใหม่
    const updatedParams = { ...searchParams, [field]: value }; // คัดลอก searchParams และอัปเดตฟิลด์ที่เปลี่ยนแปลง
    setSearchParams(updatedParams); // อัปเดต state ของพารามิเตอร์การค้นหา
    searchPlaces(updatedParams); // เรียกใช้การค้นหาโดยใช้พารามิเตอร์ที่อัปเดต
  
    // ตรวจสอบและจัดการสถานะที่เกี่ยวข้องกับฟิลด์แต่ละประเภท
    if (field === "category") {
      // หากฟิลด์ที่อัปเดตเป็นประเภทหมวดหมู่
      const selectedCategory = filters.categories.find((cat) => cat.id === value); // ค้นหาหมวดหมู่ที่เลือก
      setSelectedCategory(selectedCategory?.name || null); // อัปเดตชื่อหมวดหมู่ใน state
      setIsCategoryDropdownOpen(false); // ปิด dropdown ของหมวดหมู่
  
      // ตรวจสอบว่าหมวดหมู่ที่เลือกเป็น "สถานที่ท่องเที่ยว" หรือไม่
      const isTouristCategory = selectedCategory?.name === "สถานที่ท่องเที่ยว";
      setIsSeasonEnabled(isTouristCategory); // เปิด/ปิดการใช้งาน dropdown ของฤดูกาลตามหมวดหมู่
  
      if (!isTouristCategory) {
        // ถ้าหมวดหมู่ไม่ใช่ "สถานที่ท่องเที่ยว" ให้ล้างค่าฤดูกาลที่เลือก
        setSelectedSeason(null); 
        setSearchParams((prevParams) => ({ ...prevParams, season: null })); // อัปเดตพารามิเตอร์โดยลบค่าฤดูกาลออก
      }
    }
  
    if (field === "season") {
      // ถ้าฟิลด์ที่อัปเดตคือ "ฤดูกาล"
      const seasonName = filters.seasons.find((season) => season.id === value)?.name || null; // ค้นหาชื่อฤดูกาล
      setSelectedSeason(seasonName); // อัปเดต state ของฤดูกาลที่เลือก
      setIsSeasonDropdownOpen(false); // ปิด dropdown ของฤดูกาล
    }
  
    if (field === "district") {
      // ถ้าฟิลด์ที่อัปเดตคือ "อำเภอ"
      const districtName = filters.districts.find((district) => district.id === value)?.name || null; // ค้นหาชื่ออำเภอ
      setSelectedDistrict(districtName); // อัปเดต state ของอำเภอที่เลือก
      setIsDistrictDropdownOpen(false); // ปิด dropdown ของอำเภอ
    }
  
    if (field === "day_of_week") {
      // ถ้าฟิลด์ที่อัปเดตคือ "วันในสัปดาห์"
      setSelectedDay(value); // อัปเดตวันใน state
    }
  };
  

  const handleCurrentLocationClick = () => {
    // ตรวจสอบว่าฟังก์ชัน geolocation รองรับโดยเบราว์เซอร์หรือไม่
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return; // หากไม่รองรับ ให้หยุดการทำงานของฟังก์ชัน
    }
  
    setLoading(true); // แสดงสถานะการโหลดข้อมูล
  
    // ขอสิทธิ์เข้าถึงตำแหน่งปัจจุบันของผู้ใช้
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // ดึง latitude และ longitude จากตำแหน่งปัจจุบันของผู้ใช้
        const { latitude, longitude } = position.coords;
        console.log(`User's updated location: Latitude ${latitude}, Longitude ${longitude}`);
  
        // อัปเดตตำแหน่งของผู้ใช้ใน state
        setUserLocation({ lat: latitude, lng: longitude });
  
        // อัปเดตตำแหน่งศูนย์กลางของแผนที่
        setMapCenter({ lat: latitude, lng: longitude });
  
        // ดึงข้อมูลสถานที่ใกล้เคียงตามตำแหน่งที่อัปเดต
        fetchNearbyPlaces(latitude, longitude);
  
        setLoading(false); // ยกเลิกสถานะการโหลด
      },
      (error) => {
        // กรณีที่เกิดข้อผิดพลาดในการดึงตำแหน่งผู้ใช้
        console.error("Error getting user's location:", error);
        setLoading(false); // ยกเลิกสถานะการโหลด
      }
    );
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchResults([]);
    setNearbyPlaces([]);
    setSelectedCategory(null);
    setSelectedSeason(null);
    setSelectedDistrict(null);
    setSelectedDay(null);
    setIsTimeFilterVisible(false);
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const resetTogglesAndSearch = () => {
    setIsTimeFilterVisible(false);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const convertMetersToKilometers = (meters) => {
    if (!meters && meters !== 0) {
      return "ไม่ทราบระยะทาง";  // ในกรณีที่ meters เป็น null หรือ undefined
    }
  
    if (meters >= 1000) {
      return (meters / 1000).toFixed(2) + ' กิโลเมตร';
    }
    return meters.toFixed(0) + ' เมตร';
  };

// ฟังก์ชันสำหรับลบข้อมูลที่ซ้ำกันในอาร์เรย์ของสถานที่
const removeDuplicates = (places) => {
  // ใช้ฟังก์ชัน filter() เพื่อกรองเฉพาะสถานที่ที่ไม่ซ้ำกัน
  return places.filter((place, index, self) =>
    // ใช้ findIndex() เพื่อตรวจสอบว่ามีสถานที่นี้อยู่แล้วหรือไม่
    index === self.findIndex(
      (p) => p.id === place.id && p.name === place.name // ถ้า id และ name เหมือนกัน แสดงว่าซ้ำ
    )
  );
};

const dayOfWeekMapping = {
  Sunday: "วันอาทิตย์",
  Monday: "วันจันทร์",
  Tuesday: "วันอังคาร",
  Wednesday: "วันพุธ",
  Thursday: "วันพฤหัสบดี",
  Friday: "วันศุกร์",
  Saturday: "วันเสาร์",
  Everyday: "ทุกวัน",
  ExceptHolidays: "ยกเว้นวันหยุดเสาร์-อาทิตย์",
};

const formatTimeTo24Hour = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

  return (
    <div className="container mx-auto p-4 relative">
      {/* Search Bar and Buttons */}
      <div className="flex flex-col lg:flex-row items-center justify-center mb-6">
        <div className="relative w-full lg:max-w-md mx-auto flex items-center justify-center mb-4 lg:mb-0">
          <button
            onClick={handleCurrentLocationClick}
            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition duration-300"
            aria-label="Check current location"
            data-tip="เช็คพิกัดปัจจุบัน"
          >
            <FaMapMarkerAlt />
          </button>
          <Tooltip place="top" type="dark" effect="solid" />
          <div className="relative w-full max-w-full lg:max-w-md mx-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานที่"
              className="p-2 pl-10 border border-orange-500 rounded w-full focus:outline-none focus:border-orange-600"
              value={searchParams.q || ""}
              onChange={e => handleSearchByField("q", e.target.value)}
              aria-label="ค้นชื่อสถานที่"
            />
            {searchParams.q ||
            searchParams.category ||
            searchParams.district ||
            searchParams.season ? (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500"
                aria-label="Clear search"
              >
                <FaTimesCircle size={20} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Toggle Buttons for Categories, Seasons, Districts, and Days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-center mb-4">
        <button
          onClick={() => {
            resetTogglesAndSearch();
            setIsCategoryDropdownOpen(prev => (prev ? null : "category"));
          }}
          className="border-2 border-orange-500 text-orange-500 rounded-full py-1 px-3 flex items-center justify-center"
        >
          <FaLayerGroup className="mr-2" /> ประเภทสถานที่
          {isCategoryDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
        </button>

        {/* Disable/Enable Season button based on category */}
        <button
          onClick={() => {
            resetTogglesAndSearch();
            setIsSeasonDropdownOpen(prev => (prev ? null : "season"));
          }}
          className={`border-2 border-orange-500 text-orange-500 rounded-full py-1 px-3 flex items-center justify-center ${!isSeasonEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isSeasonEnabled} // Disable if the season is not enabled
        >
          <FaLeaf className="mr-2" /> สถานที่ท่องเที่ยวตามฤดูกาล
          {isSeasonDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
        </button>
        <button
            onClick={() => {
              resetTogglesAndSearch();
              setIsDistrictDropdownOpen(prev => (prev ? null : "district"));
            }}
            className="border-2 border-orange-500 text-orange-500 rounded-full py-1 px-3 flex items-center justify-center"
          >
            <FaMapMarkerAlt className="mr-2" /> เลือกอำเภอ
            {isDistrictDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>

     {/* Toggle for Day and Time Filter */}
  <button
    onClick={() => {
      resetTogglesAndSearch();
      setIsTimeFilterVisible((prev) => !prev);
    }}
    className="border-2 border-orange-500 text-orange-500 rounded-full py-1 px-3 flex items-center justify-center"
  >
    <FaCalendarAlt className="mr-2" /> วันและเวลา
  </button>
      </div>

      {isCategoryDropdownOpen && (
  <div className="absolute z-10 w-full bg-white border border-orange-500 rounded-md shadow-lg mt-1">
    {filters.categories.map((category) => (
      <button
        key={category.id}
        className={`flex items-center w-full text-left py-2 px-4 text-sm space-x-2 ${
          searchParams.category === category.id
            ? "bg-orange-500 text-white"
            : "text-orange-500"
        } hover:bg-orange-100`}
        onClick={() => handleSearchByField("category", category.id)}
      >
        {category.name === "สถานที่ท่องเที่ยว" && <FaTree />}
        {category.name === "ที่พัก" && <FaHotel />}
        {category.name === "ร้านอาหาร" && <FaUtensils />}
        {category.name === "ร้านค้าของฝาก" && <FaStore />}
        <span>{category.name}</span>
      </button>
    ))}
  </div>
)}


{isSeasonDropdownOpen && (
  <div className="absolute z-10 w-full bg-white border border-orange-500 rounded-md shadow-lg mt-1">
    {filters.seasons.map((season) => (
      <button
        key={season.id}
        className={`flex items-center w-full text-left py-2 px-4 text-sm space-x-2 ${
          searchParams.season === season.id
            ? "bg-orange-500 text-white"
            : "text-orange-500"
        } hover:bg-orange-100`}
        onClick={() => handleSearchByField("season", season.id)}
      >
        {/* Icon ข้างหน้าข้อความ */}
        {season.name === "ฤดูร้อน" && <FaSun />}
        {season.name === "ฤดูฝน" && <FaCloudRain />}
        {season.name === "ฤดูหนาว" && <FaSnowflake />}
        {season.name === "ตลอดทั้งปี" && <FaGlobe />}

        {/* ข้อความของฤดูกาล */}
        <span>{season.name}</span>
      </button>
    ))}
  </div>
)}


{isDistrictDropdownOpen && (
            <div className="absolute z-10 w-full bg-white border border-orange-500 rounded-md shadow-lg mt-1">
              {filters.districts.map((district) => (
                <button
                  key={district.id}
                  className={`block w-full text-left py-2 px-4 text-sm ${
                    searchParams.district === district.id
                      ? "bg-orange-500 text-white"
                      : "text-orange-500"
                  } hover:bg-orange-100`}
                  onClick={() => handleSearchByField("district", district.id)}
                >
                  {district.name}
                </button>
              ))}
            </div>
          )}

      {isTimeFilterVisible && (
        <div className="flex flex-col sm:flex-row justify-center items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <FaClock className="text-orange-500" />
            <label className="text-orange-500 font-semibold">เลือกวัน:</label>
            <select
              className="border border-orange-500 text-orange-500 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-600"
              onChange={e => handleSearchByField("day_of_week", e.target.value)}
              value={searchParams.day_of_week || ""}
            >
              <option value="">วัน</option>
              <option value="Sunday">วันอาทิตย์</option>
              <option value="Monday">วันจันทร์</option>
              <option value="Tuesday">วันอังคาร</option>
              <option value="Wednesday">วันพุธ</option>
              <option value="Thursday">วันพฤหัสบดี</option>
              <option value="Friday">วันศุกร์</option>
              <option value="Saturday">วันเสาร์</option>
              <option value="Everyday">ทุกวัน</option>
              <option value="ExceptHolidays">ยกเว้นวันหยุดเสาร์-อาทิตย์</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <FaClock className="text-orange-500" />
            <label className="text-orange-500 font-semibold">เวลาเปิด:</label>
            <input
              type="time"
              className="border border-orange-500 text-orange-500 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-600"
              onChange={e =>
                handleSearchByField("opening_time", e.target.value)
              }
              value={searchParams.opening_time || ""}
            />
          </div>

          <div className="flex items-center space-x-2">
            <FaClock className="text-orange-500" />
            <label className="text-orange-500 font-semibold">เวลาปิด:</label>
            <input
              type="time"
              className="border border-orange-500 text-orange-500 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-600"
              onChange={e =>
                handleSearchByField("closing_time", e.target.value)
              }
              value={searchParams.closing_time || ""}
            />
          </div>
        </div>
      )}

      {/* Display selected filters */}
      <div className="text-center mb-4">
        {selectedCategory && (
          <p className="text-lg font-bold text-orange-500">
            หมวดหมู่ที่เลือก: {selectedCategory}
          </p>
        )}
        {selectedSeason && (
          <p className="text-lg font-bold text-orange-500">
            ฤดูกาลที่เลือก: {selectedSeason}
          </p>
        )}
     {selectedDistrict && (
        <p className="text-lg font-bold text-orange-500 text-center mb-4">
          อำเภอที่เลือก: {selectedDistrict}
        </p>
      )}
<div className="flex items-center justify-center space-x-4">
  {selectedDay && (
    <p className="text-lg font-bold text-orange-500">
      วันที่เลือก: {dayOfWeekMapping[selectedDay] || selectedDay}
    </p>
  )}
  {searchParams.opening_time && (
    <p className="text-lg font-bold text-orange-500">
      เวลาเปิด: {formatTimeTo24Hour(searchParams.opening_time)} น.
    </p>
  )}
  {searchParams.closing_time && (
    <p className="text-lg font-bold text-orange-500">
      เวลาปิด: {formatTimeTo24Hour(searchParams.closing_time)} น.
    </p>
  )}
</div>


      </div>

      {/* Loading Spinner */}
      {loading && (
  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
    <Circles
      height="80"
      width="80"
      color="#FF7043"
      ariaLabel="loading-indicator"
    />
  </div>
)}

      {/* MapComponent Integration */}
      <div className={`w-full h-96 mb-6 ${loading ? "blur-sm" : ""}`}>
        {isClient && (
          <MapComponent
            isLoaded={isLoaded}
            userLocation={userLocation}
            mapCenter={mapCenter}
            searchResults={searchResults}
            nearbyPlaces={nearbyPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            clearSearch={clearSearch}
            fetchNearbyPlaces={fetchNearbyPlaces}
          />
        )}
      </div>

      {/* Display search query and results count */}
      <div className="mt-4">
        {searchParams.q && (
          <p className="text-lg font-bold text-center text-orange-500 mb-4">
            คำที่ค้นหา: &quot;{searchParams.q}&quot; (พบ {searchResults.length}{" "}
            ผลลัพธ์)
          </p>
        )}

           {/* หากไม่มีผลลัพธ์การค้นหา จะแสดงข้อความแจ้งเตือน */}
 {hasSearched && searchResults.length === 0 && nearbyPlaces.length === 0 && !loading && (
          <div className="text-center mt-8">
            <p className="text-xl font-semibold text-orange-500">
              ไม่พบสถานที่! ที่ตรงกับคำค้นหาของคุณ โปรดลองค้นหาใหม่อีกครั้ง
            </p>
            <p className="text-md text-gray-500">
              ลองค้นหาหรือเลือกตัวกรองใหม่เพื่อค้นหาสถานที่อื่น ๆ
            </p>
          </div>
        )}

        {/* Display search results using Slider */}
        {searchResults.length > 0 && nearbyPlaces.length === 0 && (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-orange-500 mb-4">
      ผลลัพธ์การค้นหา ({removeDuplicates(searchResults).length} สถานที่)
    </h2>

    {/* ตรวจสอบว่ามีเพียง 1 ผลลัพธ์ และแสดง card เดียว */}
    {removeDuplicates(searchResults).length === 1 ? (
      removeDuplicates(searchResults).map((place) => (
        <Link href={`/place/${place.id}`} key={place.id}>
          <div className="p-4 cursor-pointer">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full max-w-sm mx-auto">
              <Image
                src={place.images && place.images[0]?.image_url ? place.images[0].image_url : "/default-image.jpg"}
                alt={place.name}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
              </div>
            </div>
          </div>
        </Link>
      ))
    ) : (
      <Slider {...settings}>
        {removeDuplicates(searchResults).map((place) => (
          <Link href={`/place/${place.id}`} key={place.id}>
            <div className="p-4 cursor-pointer">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full">
                <Image
                  src={place.images && place.images[0]?.image_url ? place.images[0].image_url : "/default-image.jpg"}
                  alt={place.name}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </Slider>
    )}
  </div>
)}
      </div>

      {nearbyPlaces.length > 0 && searchResults.length === 0 && (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-orange-500 mb-4">
      สถานที่ใกล้เคียง ({nearbyPlaces.length} สถานที่)
    </h2>
    <Slider {...settings}>
      {removeDuplicates(nearbyPlaces).map((place) => (
        <Link href={`/place/${place.id}`} key={place.id}>
          <div className="p-4 cursor-pointer">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-95 transition duration-300 ease-in-out flex flex-col h-full">
              <Image
                src={place.images && place.images[0]?.image_url ? place.images[0].image_url : "/default-image.jpg"}
                alt={place.name}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                <p className="text-orange-500 font-bold flex items-center">
                  <FaRoute className="mr-2" />
                  ระยะห่าง {convertMetersToKilometers(place.distance)}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </Slider>
  </div>
)}
    </div>
  );
};

export default GeocodingSearchPage;
