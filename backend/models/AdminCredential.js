import mongoose from "mongoose";

const adminCredentialSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AdminCredential =
  mongoose.models.AdminCredential ||
  mongoose.model("AdminCredential", adminCredentialSchema);

export default AdminCredential;
