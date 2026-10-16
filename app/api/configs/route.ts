import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const viewAll = searchParams.get("all") === "true";

    const isSuper = user.role === "SUPERUSER" || user.role === "ADMIN";

    if (viewAll && isSuper) {
      const allConfigs = await prisma.savedCarConfig.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ configs: allConfigs, isSuperView: true });
    }

    const userConfigs = await prisma.savedCarConfig.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ configs: userConfigs, isSuperView: false });
  } catch (error) {
    console.error("Fetch configs error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data 3D build configuration." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      carModelId,
      carName,
      paintColorName,
      paintColorHex,
      paintFinish,
      equippedVelg,
      equippedTyre,
      equippedSpoiler,
      equippedHood,
      equippedBodykit,
      equippedBrake,
      notes,
    } = body;

    if (!name || !carModelId || !paintColorHex) {
      return NextResponse.json(
        { error: "Nama konfigurasi, model mobil, dan warna cat wajib diisi." },
        { status: 400 }
      );
    }

    // Check free tier limits (e.g. Free users max 5 saved builds)
    if (user.subscriptionTier === "FREE" && user.role !== "SUPERUSER" && user.role !== "ADMIN") {
      const count = await prisma.savedCarConfig.count({
        where: { userId: user.id },
      });
      if (count >= 5) {
        return NextResponse.json(
          {
            error:
              "Batas penyimpanan Free Tier (maksimal 5 build) telah tercapai. Upgrade ke PRO Racer untuk penyimpanan build tanpa batas!",
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    const newConfig = await prisma.savedCarConfig.create({
      data: {
        userId: user.id,
        name: name.trim(),
        carModelId,
        carName: carName || "Custom Supercar",
        paintColorName: paintColorName || "Custom Paint",
        paintColorHex,
        paintFinish: paintFinish || "Gloss",
        equippedVelg: typeof equippedVelg === "string" ? equippedVelg : JSON.stringify(equippedVelg || null),
        equippedTyre: typeof equippedTyre === "string" ? equippedTyre : JSON.stringify(equippedTyre || null),
        equippedSpoiler: typeof equippedSpoiler === "string" ? equippedSpoiler : JSON.stringify(equippedSpoiler || null),
        equippedHood: typeof equippedHood === "string" ? equippedHood : JSON.stringify(equippedHood || null),
        equippedBodykit: typeof equippedBodykit === "string" ? equippedBodykit : JSON.stringify(equippedBodykit || null),
        equippedBrake: typeof equippedBrake === "string" ? equippedBrake : JSON.stringify(equippedBrake || null),
        notes: notes ? String(notes).trim() : null,
      },
    });

    return NextResponse.json(
      { message: "3D Car configuration berhasil disimpan!", config: newConfig },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save config error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan konfigurasi mobil 3D." },
      { status: 500 }
    );
  }
}
