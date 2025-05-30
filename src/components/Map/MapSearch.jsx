"use client"
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  Circle
} from "@react-google-maps/api";
import NextImage from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaInfoCircle, FaDirections, FaRoute, FaTag } from "react-icons/fa";

const MapSearch = ({
  isLoaded,
  userLocation,
  mapCenter,
  searchResults,
  nearbyPlaces,
  selectedPlace,
  onSelectPlace,
  fetchNearbyPlaces,
}) => {
  const mapRef = useRef(null);
  const [clickLocation, setClickLocation] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [directions, setDirections] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);

  // ฟังก์ชันจัดการเมื่อคลิกบนแผนที่
  const handleMapClick = (event) => {
    
    // ดึงพิกัดที่ผู้ใช้คลิกบนแผนที่
    const { latLng } = event; 
    const clickedLat = latLng.lat(); // ดึงค่า latitude จากพิกัดที่คลิก
    const clickedLng = latLng.lng(); // ดึงค่า longitude จากพิกัดที่คลิก
  
    // บันทึกตำแหน่งที่คลิกลงใน state
    setClickLocation({ lat: clickedLat, lng: clickedLng });
  
    // เรียก API เพื่อดึงข้อมูลสถานที่ใกล้เคียงจากพิกัดที่คลิก
    fetchNearbyPlaces(clickedLat, clickedLng, radius);
  };

  const calculateRoutes = useCallback((origin, destination) => {
    // ตรวจสอบว่า Google Maps API ถูกโหลดแล้วหรือยัง
    if (!isLoaded || !window.google || !window.google.maps) return;
  
    // สร้าง instance ของ DirectionsService เพื่อคำนวณเส้นทาง
    const directionsService = new window.google.maps.DirectionsService();
  
    // คำนวณเส้นทางระหว่าง origin และ destination
    directionsService.route(
      {
        origin, // จุดเริ่มต้นของเส้นทาง (userLocation)
        destination: { 
          lat: Number(destination.latitude), // ละติจูดของจุดหมายปลายทาง
          lng: Number(destination.longitude) // ลองจิจูดของจุดหมายปลายทาง
        },
        travelMode: google.maps.TravelMode.DRIVING, // โหมดการเดินทาง (ขับรถ)
      },
      (result, status) => {
        // ถ้าคำนวณเส้นทางสำเร็จ ให้บันทึกผลลัพธ์ลงใน state
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`); // แสดงข้อผิดพลาดใน console
        }
      }
    );
  }, [isLoaded]); // ฟังก์ชันนี้จะถูกสร้างใหม่เมื่อ isLoaded เปลี่ยนแปลง

  useEffect(() => {
    // เมื่อ mapRef และตำแหน่งผู้ใช้พร้อม จะย้ายตำแหน่งแผนที่ไปยังตำแหน่งของผู้ใช้
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
    }
  }, [userLocation]); // useEffect จะทำงานเมื่อ userLocation เปลี่ยนแปลง
  

  useEffect(() => {
    // ถ้าข้อมูลพร้อมและมีสถานที่ใกล้เคียงหรือผลลัพธ์การค้นหา จะคำนวณเส้นทาง
    if (
      isLoaded &&
      userLocation &&
      (searchResults.length > 0 || nearbyPlaces.length > 0)
    ) {
      calculateRoutes(userLocation, searchResults, nearbyPlaces);
    }
  }, [isLoaded, userLocation, searchResults, nearbyPlaces, calculateRoutes]); // useEffect จะทำงานเมื่อค่าใดๆ ใน dependency เปลี่ยน

  if (!isLoaded) {
    return null;  // ถ้ายังโหลด Google Maps API ไม่เสร็จ จะไม่แสดงผลอะไรเลย
  }

  const mapStyles = [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ color: "#fef3e2" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#b3d9ff" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#ffa726" }, { lightness: 40 }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffcc80" }],
    },
    {
      featureType: "poi",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffebcc" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#fff5e6" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#f9a825" }, { lightness: 50 }],
    },
  ];


  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={mapCenter}
      zoom={14}
      options={{
        styles: mapStyles,
        zoomControl: true,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        disableDefaultUI: false,
        clickableIcons: false,
      }}
      onClick={handleMapClick} 
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
        {/* วงกลมแสดงตำแหน่งปัจจุบันของผู้ใช้ */}
        {userLocation && (
        <>
          <Marker
            position={userLocation}
            icon={{
              url: "/icons/user.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            animation={google.maps.Animation.BOUNCE}
          />
          <Circle
            center={userLocation}
            radius={radius}
            options={{
              fillColor: "#4FC3F7",
              fillOpacity: 0.2,
              strokeColor: "#0288D1",
              strokeOpacity: 0.5,
              strokeWeight: 2,
            }}
          />
        </>
      )}
       {/* วงกลมแสดงตำแหน่งที่คลิกบนแผนที่ */}
       {clickLocation && (
             <>
          <Marker
            position={clickLocation}
            icon={{
              url: "/icons/tap.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            animation={google.maps.Animation.BOUNCE}
          />
        <Circle
          center={clickLocation}
          radius={radius}
          options={{
            fillColor: "#FF8A65",
            fillOpacity: 0.1,
            strokeColor: "#FF7043",
            strokeOpacity: 0.3,
            strokeWeight: 2,
          }}
        />
         </>
      )}

      {searchResults.map((place) => {
        const lat = Number(place.latitude);
        const lng = Number(place.longitude);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          console.warn(`Invalid coordinates for place ID: ${place.id}`);
          return null;
        }

        return (
          <Marker
            key={place.id}
            position={{ lat: Number(place.latitude), lng: Number(place.longitude) }}
            icon={{
              url: place.images[0]?.image_url || "/icons/place-nearby.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            animation={hoveredMarkerId === place.id ? google.maps.Animation.BOUNCE : null}
            onMouseOver={() => setHoveredMarkerId(place.id)}
            onMouseOut={() => setHoveredMarkerId(null)}
            onClick={() => {
              onSelectPlace(place);
              calculateRoutes(userLocation, place);
            }}
          />
        );
      })}

      {nearbyPlaces.map((place) => {
        const lat = Number(place.latitude);
        const lng = Number(place.longitude);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          console.warn(`Invalid coordinates for place ID: ${place.id}`);
          return null;
        }

        return (
          <Marker
            key={place.id}
            position={{ lat, lng }}
            icon={{
              url:
                place.images?.[0]?.image_url
                  ? place.images[0].image_url
                  : "/icons/place-nearby.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            animation={
              hoveredMarkerId === place.id ? google.maps.Animation.BOUNCE : undefined
            }
            onMouseOver={() => setHoveredMarkerId(place.id)}
            onMouseOut={() => setHoveredMarkerId(null)}
            onClick={() => {
              onSelectPlace(place);
              calculateRoutes(userLocation, place);
            }}
          />
        );
      })}

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: "#FF7043",
              strokeOpacity: 0.8,
              strokeWeight: 6,
            },
            suppressMarkers: true, // ปิดการแสดง markers บนเส้นทาง
          }}
        />
      )}

      {selectedPlace && (
        <InfoWindow
          position={{
            lat: Number(selectedPlace.latitude),
            lng: Number(selectedPlace.longitude),
          }}
          onCloseClick={() => onSelectPlace(null)}
        >
          <div className="flex flex-col md:flex-row items-center max-w-md p-4 bg-white rounded-lg shadow-lg text-gray-800 space-y-4 md:space-y-0 md:space-x-4">
            <NextImage
              src={
                selectedPlace.images?.[0]?.image_url
                  ? selectedPlace.images[0].image_url
                  : "/icons/place-nearby.png"
              }
              alt={selectedPlace.name}
              width={150}
              height={100}
              className="object-cover rounded-md shadow"
            />

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-orange-500" />
                {selectedPlace.name}
              </h3>

              <p className="text-sm text-orange-500 font-semibold flex items-center mb-2">
                <FaTag className="mr-2" />
                {selectedPlace.category_name}
              </p>
              {/* <p className="text-orange-500 font-bold flex items-center">
                <FaRoute className="mr-2" />
                ระยะห่าง {convertMetersToKilometers(selectedPlace.distance)} กิโลเมตร
              </p> */}

              <div className="flex space-x-2 mt-4">
                <Link
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center space-x-2"
                >
                  <FaDirections className="inline-block" />
                  <span>นำทาง</span>
                </Link>

                <Link
                  href={`/place/${selectedPlace.id}`}
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
    </GoogleMap>
  );
};

export default MapSearch;
