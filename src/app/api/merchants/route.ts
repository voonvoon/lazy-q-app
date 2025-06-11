// app/api/merchants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchants";
import { generateSlug, ensureUniqueSlug } from "@/lib/utils";

// CREATE merchant
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse request body
    const {
      name,
      description,
      phone,
      email,
      address,
      businessHours,
      paymentConfig,
      logo,
      coverImage,
      plan = "free"
    } = await request.json();

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = generateSlug(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    // Create merchant
    const merchant = await Merchant.create({
      name,
      slug: uniqueSlug,
      description,
      phone,
      email,
      owner: session.user.id,
      address,
      businessHours,
      paymentConfig,
      logo,
      coverImage,
      plan,
      // merchantId will auto-generate
    });

    return NextResponse.json(
      { 
        success: true, 
        merchant: {
          id: merchant._id,
          name: merchant.name,
          slug: merchant.slug,
          merchantId: merchant.merchantId,
          address: merchant.address,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating merchant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET merchants (for current user)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const merchants = await Merchant.find({ owner: session.user.id })
      .select('name slug merchantId address isActive plan createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ merchants });

  } catch (error) {
    console.error("Error fetching merchants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}