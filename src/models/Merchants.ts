// models/Merchant.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMerchant extends Document {
  // Basic Info
  name: string;
  slug: string; // URL-friendly identifier
  merchantId: string; // Short, human-readable ID (e.g., "MERCH001")
  description?: string;
  phone?: string;
  email?: string;

  // Owner & Staff
  owner: mongoose.Types.ObjectId; // References User
  staff?: mongoose.Types.ObjectId[]; // Admin users who can manage this merchant

  // Address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Business Settings
  isActive: boolean;
  businessHours: {
    day: string; // "monday", "tuesday", etc.
    open: string; // "09:00"
    close: string; // "22:00"
    isClosed: boolean;
  }[];

  // Payment & Integration Settings
  paymentConfig: {
    fiuuPublicKey?: string;
    fiuuPrivateKey?: string; // Should be encrypted
  };

  printServerApi?: string;

  // Branding
  logo?: string;
  coverImage?: string;

  // Plan
  plan: "free" | "basic" | "premium";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const merchantSchema = new Schema<IMerchant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    merchantId: {
      type: String,
      required: false,
      unique: true,
      uppercase: true,
      sparse: true, // Only include non-null values in the unique index
    },
    description: String,
    phone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staff: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: "Malaysia" },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    businessHours: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        open: String, // "09:00"
        close: String, // "22:00"
        isClosed: { type: Boolean, default: false },
      },
    ],

    paymentConfig: {
      fiuuPublicKey: String,
      fiuuPrivateKey: String, // Should be encrypted
    },

    printServerApi: String, 
    

    logo: String,
    coverImage: String,

    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
  },
  {
    timestamps: true,
  }
);

// Generate short merchant ID before saving
//is a hook, called "hook" because it literally "hooks into" the normal flow and adds extra functionality!
//Before you save this merchant to the database, run this function first!"
merchantSchema.pre("save", async function (next) {
  //Does this merchant have an ID badge yet? No? Then make one!
  if (!this.merchantId) {
    this.merchantId = await generateMerchantId();
  }

  //ok, now can sav to database
  next();
});

// Helper function to generate short ID
async function generateMerchantId(): Promise<string> {
  const prefix = "MERCH";
  let counter = 1;
  let id = `${prefix}${counter.toString().padStart(3, "0")}`; // MERCH001

  while (await mongoose.models.Merchant?.findOne({ merchantId: id })) {
    counter++;
    id = `${prefix}${counter.toString().padStart(3, "0")}`;
  }

  return id;
}

// Indexes
merchantSchema.index({ slug: 1 });
merchantSchema.index({ owner: 1 });
merchantSchema.index({ merchantId: 1 });

const Merchant =
  mongoose.models.Merchant ||
  mongoose.model<IMerchant>("Merchant", merchantSchema);

export default Merchant;
