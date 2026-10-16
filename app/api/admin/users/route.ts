import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (currentUser.role !== "SUPERUSER" && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya super user yang dapat mengakses halaman ini." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        balance: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            savedConfigs: true,
            orders: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data user management." },
      { status: 500 }
    );
  }
}
