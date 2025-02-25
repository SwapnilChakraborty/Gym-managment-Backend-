import { getGymsWithLocation, findNearbyGyms } from "../services/mapService.js";

// 📌 Fetch all gyms with location data
export const getGyms = async (req, res) => {
  try {
    const gyms = await getGymsWithLocation();
    res.status(200).json({ success: true, gyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Find nearby gyms based on user coordinates
export const getNearbyGyms = async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: "Latitude and longitude are required." });
  }

  try {
    const nearbyGyms = await findNearbyGyms(parseFloat(latitude), parseFloat(longitude), parseInt(radius));
    res.status(200).json({ success: true, nearbyGyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
