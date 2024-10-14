import Carousel from "../components/Carousel"
import NearbyPlaces from "../components/Places/NearbyPlaces"
import CurrentlyOpenTouristEntities from "../components/Places/CurrentlyOpen"
import RealTimeSeasonalAttractions from "../components/Places/RealTime"
import RealTimePlaces from "@/components/Places/RealTimePlaces"

export const metadata = {
  title: "เว็บไซต์เเนะนำการท่องเที่ยวจังหวัดนครพนม",
  description:
    "เว็บแอปพลิเคชันแนะนำการท่องเที่ยวและร้านค้าในบริเวณใกล้เคียง สถานที่ท่องเที่ยวในจังหวัดนครพนม Web Application Recommends Travel And Shops In Nearby Tourist Attractions In Nakhon Phanom Province"
}

export default function Home() {
  return (
    <>
      {/* <BackgroundVideo /> */}
      <div>
        <Carousel />
      </div>
      <div>
        <RealTimeSeasonalAttractions />
      </div>
      <div>
        <NearbyPlaces />
      </div>
      <div>
        <CurrentlyOpenTouristEntities />
      </div>
      <div>
        <RealTimePlaces />
      </div>
    </>
  )
}
