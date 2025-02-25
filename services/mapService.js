import axios from "axios";
import dotenv from "dotenv";
import Gym from "../models/Gym.js"; // Import Gym model

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 📌 Fetch all gyms with location data
export const getGymsWithLocation = async () => {
  try {
    const gyms = await Gym.find({}, "name address latitude longitude");
    return gyms;
  } catch (error) {
    console.error("❌ Error fetching gyms:", error);
    throw new Error("Failed to fetch gym locations");
  }
};

// 📌 Find Nearby Gyms Using Reverse Geolocation
export const findNearbyGyms = async (latitude, longitude, radius = 5000) => {
  try {
    const gyms = await Gym.find({
      latitude: { $exists: true },
      longitude: { $exists: true },
    });

    // Filter gyms within the given radius
    const nearbyGyms = gyms.filter((gym) => {
      const distance = haversineDistance(
        { lat: latitude, lon: longitude },
        { lat: gym.latitude, lon: gym.longitude }
      );
      return distance <= radius / 1000; // Convert meters to km
    });

    return nearbyGyms;
  } catch (error) {
    console.error("❌ Error finding nearby gyms:", error);
    throw new Error("Failed to find nearby gyms");
  }
};

// 📌 Calculate Distance Using Haversine Formula
const haversineDistance = (coords1, coords2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

const toRad = (value) => (value * Math.PI) / 180;
