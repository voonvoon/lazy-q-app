import mongoose, { Document, Schema } from "mongoose";
//Document = Mongoose's base interface! addd _id, save(), remove(), toJson(), etc.
export interface IUser extends Document {
  email: string;
  name: string;
  password?: string; // Optional for OAuth users
  phone?: string;
  avatar?: string;
  role: "customer" | "admin" | "super_admin";

  // Multi-tenant support
  restaurants?: mongoose.Types.ObjectId[]; // Restaurants user has access to
  currentRestaurant?: mongoose.Types.ObjectId; // Active restaurant context

  // Customer-specific fields
  addresses?: {
    street?: string; // Add ? to make optional
    city?: string; // Add ? to make optional
    state?: string; // Add ? to make optional
    zipCode?: string; // Add ? to make optional
    isDefault: boolean;
  }[];

  // Auth.js fields
  emailVerified?: Date;
  image?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include in queries by default, should be hidden unless explicitly requested
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ["customer", "admin", "super_admin"],
      default: "customer",
    },

    // Multi-tenant support
    restaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    currentRestaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    // Customer addresses
    addresses: [
      {
        street: String, // Optional by default
        city: String, // Optional by default
        state: String, // Optional by default
        zipCode: String, // Optional by default
        isDefault: { type: Boolean, default: false },
      },
    ],

    // Auth.js compatibility
    emailVerified: Date,
    image: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
//Like a book's index - jump to exact page instead of reading whole book
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ restaurants: 1 });

// Prevent duplicate models in development
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
