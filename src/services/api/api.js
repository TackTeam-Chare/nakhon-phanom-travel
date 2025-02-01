import axios from "axios";

const TAT_API_KEY = process.env.TAT_API_KEY;
const TAT_BASE_URL = "https://tatdataapi.io/api/v2/places";

export const fetchTouristAttractions = async () => {
    try {
      const response = await axios.get("api/tourist-attractions");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching tourist attractions:", error);
      return [];
    }
  };

export const fetchRealTimeTouristEvents = async () => {
  try {
    const response = await axios.get("/api/events");
    return response.data || [];
    // if (Array.isArray(response.data)) {
    //   return response.data;
    // }
    // return [];
  } catch (error) {
    console.error("Error fetching real-time tourist events:", error);
    return [];
  }
};

export const fetchEventById = async (id) => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching event details:", error);
      return null;
    }
  };

  export const fetchTouristAttractionsById = async (id) => {
  try {
    const response = await axios.get(`/api/tourist-attractions/${id}`, {
      headers: {
        "x-api-key": TAT_API_KEY,
        "Accept-Language": "th",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching place data:", error);
    return null;
  }
};
