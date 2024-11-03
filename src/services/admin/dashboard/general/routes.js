import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 5000
});

// Intercept request to include Authorization header if token is available
api.interceptors.request.use(config => {
    const token = Cookies.get("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

// Unified search for all criteria
export const searchTouristEntitiesUnified = async (params) => {
  try {
    const token = Cookies.get("token");
    const response = await api.get("/admin/general/search", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = Array.isArray(response.data) ? response.data : [];

    return data.map((place) => ({
      ...place,
      images: place.images
        ? place.images.map((image) => ({
            image_path: image.image_path,
            image_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${image.image_path}`,
          }))
        : [], // Default to an empty array if no images
    }));
  } catch (error) {
    console.error("Error fetching tourist entities with unified search:", error);
    throw error;
  }
};

// Fetch all filters (seasons, districts, categories)
export const fetchAllFilters = async () => {
  try {
    const token = Cookies.get("token");
    const response = await api.get("/admin/general/filters", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all filters:", error);
    throw error;
  }
};
