import Carousel from "../components/Carousel"
import NearbyPlaces from "../components/Places/NearbyPlaces"
import CurrentlyOpenTouristEntities from "../components/Places/CurrentlyOpen"
import RealTimeSeasonalAttractions from "../components/Places/RealTime"
import Attractions from "@/components/Places/Attractions"
import Accommodations from "@/components/Places/Accommodations"
import Restaurants from "@/components/Places/Restaurants"
import SouvenirShops from "@/components/Places/SouvenirShops"
import RealTimeEvents from "@/components/Places/RealTimeEvents"

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
        <RealTimeEvents />
      </div>
      <div>
        <NearbyPlaces />
      </div>
      <div>
        <CurrentlyOpenTouristEntities />
      </div>
      <div>
        <Attractions />
      </div>
      <div>
        <Accommodations />
      </div>
      <div>
        <Restaurants />
      </div>
      <div>
        <SouvenirShops />
      </div>
    </>
  )
}
