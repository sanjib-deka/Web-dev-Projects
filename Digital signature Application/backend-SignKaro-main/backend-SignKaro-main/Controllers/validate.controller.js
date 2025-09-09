import validate from "../models/validate.sign.model.js";






// activateSeal FUNCTION
export const activateSeal = async (req, res) => {
  try {
    const { sealNumber, name, email, ipAdress, geoLocation, reason } = req.body;

    // Check for missing required fields (geoLocation is optional)
    if (!sealNumber || !email || !ipAdress || !reason) {
      return res.status(400).json({ message: "sealNumber, email, ipAdress, and reason are required" });
    }

    // Check if sealNumber already exists
    const existingSeal = await validate.findOne({ sealNumber });
    if (existingSeal) {
      return res.status(400).json({ message: "sealNumber already exists" });
    }

    // Create new seal
    const seal = await validate.create({
      sealNumber,
      name,
      email,
      ipAdress,
      geoLocation,
      reason
    });

    // Send success response with correct fields
    return res.status(201).json({
      seal: {
        sealNumber: seal.sealNumber,
        name: seal.name,
        email: seal.email,
        ipAdress: seal.ipAdress,
        geoLocation: seal.geoLocation,
        reason: seal.reason,
        createdAt: seal.createdAt,
        time: seal.createdAt ? new Date(seal.createdAt).toLocaleTimeString() : ""
      }
    });

  } catch (error) {
    console.error("activate Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




// verify seal


export const verifySeal = async (req, res) => {
  try {
    const { sealNumber } = req.body;
    // Find seal by sealNumber
    const existingSeal = await validate.findOne({ sealNumber });
    if (!existingSeal) {
      return res.status(400).json({ message: "Invalid sealNumber" });
    }

    // Send success response
    return res.status(200).json({
      message: "Seal verified successfully",
      seal: {
        id: existingSeal._id,
        sealNumber: existingSeal.sealNumber,
        name: existingSeal.name,
        email: existingSeal.email,
        ipAdress: existingSeal.ipAdress,
        geoLocation: existingSeal.geoLocation,
        reason: existingSeal.reason,
        createdAt: existingSeal.createdAt,
        time: existingSeal.createdAt ? new Date(existingSeal.createdAt).toLocaleTimeString() : ""
      },
    });
  } catch (error) {
    console.error("verifySeal Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};