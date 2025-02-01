"use client";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { FaMapMarkerAlt, FaInfoCircle, FaDirections, FaRoute, FaTag } from "react-icons/fa"; 
import {
  GoogleMap,
  MarkerF,
  InfoWindow,
  Circle,
  DirectionsRenderer
} from "@react-google-maps/api";
import NextImage from "next/image";
import Link from "next/link";

const MapNearbyPlaces = ({ center, places, mainPlace, isLoaded }) => {
  const mapRef = useRef(null);
  // const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(mainPlace); 
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const calculateRoutes = useCallback(() => {
    // ตรวจสอบว่ามีข้อมูลตำแหน่งผู้ใช้และสถานที่ที่เลือก รวมถึง Google Maps API ถูกโหลดเรียบร้อยหรือไม่
    if (!userLocation || !selectedEntity || !window.google || !window.google.maps) return;
  
    // สร้างอินสแตนซ์ของ DirectionsService จาก Google Maps API
    const directionsService = new window.google.maps.DirectionsService();
  
    // เรียกใช้ฟังก์ชัน route เพื่อคำนวณเส้นทาง
    directionsService.route(
      {
        origin: userLocation, // จุดเริ่มต้นคือพิกัดของผู้ใช้
        destination: {
          lat: Number(selectedEntity.latitude), // พิกัดละติจูดของสถานที่ที่เลือก (แปลงเป็นตัวเลข)
          lng: Number(selectedEntity.longitude), // พิกัดลองจิจูดของสถานที่ที่เลือก (แปลงเป็นตัวเลข)
        },
        travelMode: google.maps.TravelMode.DRIVING, // กำหนดโหมดการเดินทางเป็น "ขับรถ"
      },
      (result, status) => {
        // ตรวจสอบสถานะการคำนวณเส้นทาง
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result); // บันทึกผลลัพธ์เส้นทางใน state เพื่อใช้แสดงผลบนแผนที่
        } else {
          console.error(`Error fetching directions: ${status}`); // แสดงข้อผิดพลาดใน console หากเกิดปัญหา
        }
      }
    );
  }, [userLocation, isLoaded, selectedEntity]); // useCallback จะเรียกใหม่เมื่อใดก็ตามที่ userLocation, isLoaded หรือ selectedEntity เปลี่ยนแปลง

  useEffect(() => {
    // ตรวจสอบว่าเบราว์เซอร์รองรับ Geolocation หรือไม่
    if (navigator.geolocation) {
      // ใช้ navigator.geolocation เพื่อดึงตำแหน่งปัจจุบันของผู้ใช้
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // กำหนดตำแหน่งผู้ใช้ใน state โดยบันทึก latitude และ longitude
          setUserLocation({
            lat: position.coords.latitude, // เก็บละติจูดของผู้ใช้
            lng: position.coords.longitude, // เก็บลองจิจูดของผู้ใช้
          });
        },
        // จัดการข้อผิดพลาด ถ้าไม่สามารถดึงตำแหน่งได้
        (error) => console.error("Error fetching location:", error),
        { enableHighAccuracy: true } // กำหนดให้ใช้ตำแหน่งที่มีความแม่นยำสูง
      );
    }
  }, []); // useEffect นี้ทำงานเพียงครั้งเดียวเมื่อ component ถูก mount
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    // เรียกฟังก์ชัน calculateRoutes เมื่อ selectedEntity หรือ calculateRoutes เปลี่ยนแปลง
    calculateRoutes();
  }, [selectedEntity, calculateRoutes]); // ฟังก์ชันจะทำงานใหม่เมื่อค่า selectedEntity หรือ calculateRoutes เปลี่ยนไป
  

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  const handleMarkerClick = (entity) => {
    setSelectedEntity(entity); // เปลี่ยนปลายทางเป็นสถานที่ที่คลิก
    if (mapRef.current) {
      mapRef.current.panTo({ lat: Number(entity.latitude), lng: Number(entity.longitude) }); // ซูมไปยังสถานที่
      mapRef.current.setZoom(16); // ปรับระดับการซูม
    }
  };
  const convertMetersToKilometers = (meters) => {
    return (meters / 1000).toFixed(2);
  };

  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] rounded-lg shadow-md overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={userLocation || center}
        zoom={14}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ color: "#fef3e2" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#b3d9ff" }]
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#ffa726" }, { lightness: 40 }]
            },
            {
              featureType: "road",
              elementType: "geometry.fill",
              stylers: [{ color: "#ffcc80" }]
            },
            {
              featureType: "poi",
              elementType: "geometry.fill",
              stylers: [{ color: "#ffebcc" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry.fill",
              stylers: [{ color: "#fff5e6" }]
            },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#f9a825" }, { lightness: 50 }]
            }
          ]
        }}
        onLoad={onMapLoad}
      >
          {/* Marker for User Location */}
          {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{ url: "/icons/user.png", scaledSize: new window.google.maps.Size(50, 50) }}
            title="Your Location"
            animation={google.maps.Animation.BOUNCE} 
          />
        )}
        {/* Main Place Marker */}
        <MarkerF
          position={center}
          title={mainPlace.name}
          icon={{
            url: mainPlace.images?.[0] ? mainPlace.images[0].image_url : "/icons/user.png",
            scaledSize: new window.google.maps.Size(50, 50)
          }}
          animation={google.maps.Animation.BOUNCE} 
          onClick={() => setSelectedEntity(mainPlace)}
        />

        {/* Markers for Nearby Places */}
        {places.map((entity) => (
          <MarkerF
            key={entity.id}
            position={{
              lat: Number(entity.latitude),
              lng: Number(entity.longitude)
            }}
            title={entity.name}
            icon={{
              url: entity.images?.[0] ? entity.images[0].image_url : "/icons/place-nearby.png",
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            onMouseOver={() => setHoveredMarkerId(entity.id)}
            onMouseOut={() => setHoveredMarkerId(null)}
            animation={
              hoveredMarkerId === entity.id
                ? google.maps.Animation.BOUNCE
                : undefined
            }
            onClick={() => handleMarkerClick(entity)}
          />
        ))}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#FF7043",
                strokeOpacity: 0.8,
                strokeWeight: 6
              },
              suppressMarkers: true 
            }}
          />
        )}

{selectedEntity && (
  <InfoWindow
    position={{
      lat: Number(selectedEntity.latitude),
      lng: Number(selectedEntity.longitude)
    }}
    onCloseClick={() => setSelectedEntity(null)}
  >
    <div className="flex flex-col md:flex-row items-center max-w-md p-4 bg-white rounded-lg shadow-lg text-gray-800 space-y-4 md:space-y-0 md:space-x-4">
      {/* รูปภาพสถานที่ */}
      <NextImage
        src={
          selectedEntity.images?.[0]?.image_url
            ? selectedEntity.images[0].image_url
            : "/place-nearby.png"
        }
        alt={selectedEntity.name}
        width={150}
        height={100}
        className="object-cover rounded-md shadow"
      />

      {/* ข้อมูลสถานที่ */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-orange-500" />
          {selectedEntity.name}
        </h3>

        <p className="text-sm text-orange-500 font-semibold flex items-center mb-2">
          <FaTag className="mr-2" />
          {selectedEntity.category_name}
        </p>
        {/* <p className="text-orange-500 font-bold flex items-center">
          <FaRoute className="mr-2" />
          ระยะห่าง {convertMetersToKilometers(selectedEntity.distance)} กิโลเมตร
        </p> */}

        <div className="flex space-x-2 mt-4">
          {/* ปุ่มนำทางไปยัง Google Maps */}
          <Link
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.latitude},${selectedEntity.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center space-x-2"
          >
            <FaDirections className="inline-block" />
            <span>นำทาง</span>
          </Link>

          <Link
            href={`/place/${selectedEntity.id}`}
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center space-x-2"
          >
            <FaInfoCircle className="inline-block" />
            <span>ดูข้อมูลเพิ่มเติม</span>
          </Link>
        </div>
      </div>
    </div>
  </InfoWindow>
)}

        <Circle
          center={center}
          radius={5000}
          options={{
            fillColor: "#FF8A65",
            fillOpacity: 0.1,
            strokeColor: "#FF7043",
            strokeOpacity: 0.3,
            strokeWeight: 2
          }}
        />
      </GoogleMap>
    </div>
  );
};

export default MapNearbyPlaces;
