import Gym from "../models/Gym.js";

// Add a gym (Vendor)
export const addGym = async (req, res) => {
  try {
    const { name, location, pricing, capacity } = req.body;
    const gym = new Gym({ name, location, pricing, capacity, vendorId: req.user._id });

    await gym.save();
    res.status(201).json(gym);
  } catch (error) {
    res.status(500).json({ message: "Error adding gym", error });
  }
};

// List all gyms (Customer)
export const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({});
    res.status(200).json(gyms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gyms", error });
  }
};

// Update gym details (Vendor)
export const updateGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    if (gym.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this gym" });
    }

    gym.name = req.body.name || gym.name;
    gym.location = req.body.location || gym.location;
    gym.pricing = req.body.pricing || gym.pricing;
    gym.capacity = req.body.capacity || gym.capacity;

    const updatedGym = await gym.save();
    res.status(200).json(updatedGym);
  } catch (error) {
    res.status(500).json({ message: "Error updating gym", error });
  }
};

// Remove a gym (Admin)
export const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    await gym.deleteOne();
    res.status(200).json({ message: "Gym deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting gym", error });
  }
};
