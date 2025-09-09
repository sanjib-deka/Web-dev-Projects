import mongoose from "mongoose";

const validateSchema = new mongoose.Schema({
    sealNumber: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    ipAdress: {
        type: String,
        required: true,
    },
    geoLocation: {
        type: String,
        required: false,
    },
    reason: {
        type: String,
        required: true,
    }
}, { timestamps: true }); // Keep timestamps if you want createdAt/updatedAt

const validate = mongoose.model("validate", validateSchema);

export default validate;