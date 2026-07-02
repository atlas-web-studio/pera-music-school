import mongoose from "mongoose";

const workApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    instruments: {
      type: [String],
      required: true,
      default: [],
    },
    status: {
      type: String,
      enum: ["NEW", "READ", "ARCHIVED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

const WorkApplication = mongoose.model(
  "WorkApplication",
  workApplicationSchema
);

export default WorkApplication;