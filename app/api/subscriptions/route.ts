import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const SUBSCRIPTION_PLANS = [
  {
    tier: "FREE",
    name: "Rookie Driver",
    price: 0,
    interval: "Free Forever",
    badge: "FREE TIER",
    description: "Akses visualizer 3D standar dan garasi dasar untuk memulai modifikasi.",
    features: [
      "Akses 3 Model Mobil Ikonik (911 GT3, M4, GR86)",
      "Penyimpanan maksimal 5 build konfigurasi 3D",
      "Pilihan 8 Palet Warna Studio Standar",
      "Kompatibilitas Modular Wheels Enkei RPF1",
      "Dukungan Komunitas",
    ],
  },
  {
    tier: "PRO",
    name: "Pro Track Racer",
    price: 19,
    interval: "$19 / bulan",
    badge: "MOST POPULAR",
    popular: true,
    description: "Koleksi modifikasi tak terbatas, color picker bebas, dan akses part eksklusif.",
    features: [
      "Penyimpanan build konfigurasi 3D TANPA BATAS",
      "Full Color Picker Dinamis (Hex Picker & Custom Finishes)",
      "Finishing Khusus: Carbon Fiber, Metallic Flake, Matte Stealth",
      "Export telemetry data dan snapshot HD render",
      "Diskon 10% untuk pemesanan suku cadang asli",
      "Priority Customer Support 24/7",
    ],
  },
  {
    tier: "APEX",
    name: "Apex VIP Supercar",
    price: 49,
    interval: "$49 / bulan",
    badge: "ULTIMATE MOTORSPORT",
    description: "Pengalaman studio 3D tertinggi dengan kemampuan import model custom sendiri.",
    features: [
      "Semua fitur PRO Track Racer",
      "Fitur Unggah Custom 3D Model Sendiri (.GLB / .GLTF / .FBX)",
      "Turntable Auto-centering & Custom Scale Studio",
      "Bonus bulanan Saldo Garasi $50.00 langsung ke akun",
      "Akses awal ke rilis model mobil & bodykit terbaru",
      "VIP Paddock Club Discord & Private Tuning Advisory",
    ],
  },
];

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const viewStats = searchParams.get("stats") === "true";
    const isSuper = user.role === "SUPERUSER" || user.role === "ADMIN";

    if (viewStats && isSuper) {
      // Super user subscription telemetry (parallelized)
      const [totalUsers, freeCount, proCount, apexCount, subscribers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionTier: "FREE" } }),
        prisma.user.count({ where: { subscriptionTier: "PRO" } }),
        prisma.user.count({ where: { subscriptionTier: "APEX" } }),
        prisma.user.findMany({
          where: {
            subscriptionTier: { in: ["PRO", "APEX"] },
          },
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
      ]);

      const mrr = proCount * 19 + apexCount * 49;

      return NextResponse.json({
        plans: SUBSCRIPTION_PLANS,
        stats: {
          totalUsers,
          freeCount,
          proCount,
          apexCount,
          activeSubscribersCount: proCount + apexCount,
          estimatedMRR: mrr,
        },
        subscribers,
        isSuperView: true,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        balance: true,
      },
    });

    return NextResponse.json({
      plans: SUBSCRIPTION_PLANS,
      currentTier: dbUser?.subscriptionTier || "FREE",
      currentStatus: dbUser?.subscriptionStatus || "ACTIVE",
      userBalance: dbUser?.balance || 0,
      isSuperView: false,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data subscription." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { targetTier } = body;

    const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.tier === targetTier);
    if (!selectedPlan) {
      return NextResponse.json({ error: "Paket langganan tidak valid." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    if (dbUser.subscriptionTier === targetTier) {
      return NextResponse.json(
        { error: `Anda sudah berada di paket ${selectedPlan.name}.` },
        { status: 400 }
      );
    }

    // If downgrading to FREE (in atomic transaction)
    if (targetTier === "FREE") {
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: "FREE",
            subscriptionStatus: "ACTIVE",
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "SUBSCRIPTION",
            amount: 0,
            description: `Perubahan paket ke ${selectedPlan.name} (Free Tier)`,
            status: "COMPLETED",
          },
        }),
      ]);

      return NextResponse.json({
        message: "Paket berhasil dialihkan ke Free Tier.",
        user: updatedUser,
      });
    }

    // If upgrading to a paid plan, check balance
    if (dbUser.balance < selectedPlan.price) {
      const needed = selectedPlan.price - dbUser.balance;
      return NextResponse.json(
        {
          error: `Saldo tidak mencukupi untuk langganan ${selectedPlan.name} ($${selectedPlan.price.toFixed(2)}). Anda butuh tambahan saldo $${needed.toFixed(2)}. Silakan Top Up terlebih dahulu.`,
          insufficientBalance: true,
          requiredAmount: selectedPlan.price,
          currentBalance: dbUser.balance,
        },
        { status: 400 }
      );
    }

    // Deduct balance and update subscription
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: selectedPlan.price,
          },
          subscriptionTier: targetTier,
          subscriptionStatus: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          balance: true,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "SUBSCRIPTION",
          amount: -selectedPlan.price,
          description: `Aktivasi Langganan: ${selectedPlan.name} (-$${selectedPlan.price.toFixed(2)})`,
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      message: `Selamat! Anda berhasil mengaktifkan paket ${selectedPlan.name}!`,
      user: updatedUser,
      transaction,
    });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Gagal memproses langganan." },
      { status: 500 }
    );
  }
}
