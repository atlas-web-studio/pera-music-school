import mongoose from "mongoose";

const trialSessionRequestSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      trim: true,
      default: "",
    },
    studentAge: {
      type: String,
      trim: true,
      default: "",
    },
    grade: {
      type: String,
      trim: true,
      default: "",
    },
    school: {
      type: String,
      trim: true,
      default: "",
    },
    parentName: {
      type: String,
      trim: true,
      default: "",
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
    address: {
      type: String,
      trim: true,
      default: "",
    },
    trialDate: {
      type: String,
      trim: true,
      default: "",
    },
    teacher: {
      type: String,
      trim: true,
      default: "",
    },
    instrument: {
      type: String,
      trim: true,
      default: "",
    },
    lessonLength: {
      type: String,
      trim: true,
      default: "",
    },
    lessonTime: {
      type: String,
      trim: true,
      default: "",
    },
    hasPreviousLessons: {
      type: String,
      trim: true,
      default: "",
    },
    previousInstruments: {
      type: String,
      trim: true,
      default: "",
    },
    previousLessonYears: {
      type: String,
      trim: true,
      default: "",
    },
    previousTeacherSchool: {
      type: String,
      trim: true,
      default: "",
    },
    musicReadingLevel: {
      type: String,
      trim: true,
      default: "",
    },
    practicesAnotherInstrument: {
      type: String,
      trim: true,
      default: "",
    },
    participation: {
      type: [String],
      default: [],
    },
    programInterests: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      trim: true,
      default: "",
    },
    availability: {
      type: String,
      trim: true,
      default: "",
    },
    goals: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["NEW", "READ", "ARCHIVED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

const TrialSessionRequest =
  mongoose.models.TrialSessionRequest ||
  mongoose.model("TrialSessionRequest", trialSessionRequestSchema);

export default TrialSessionRequest;
