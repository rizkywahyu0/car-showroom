import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const viewAll = searchParams.get("all") === "true";
    const isSuper = user.role === "SUPERUSER" || user.role === "ADMIN";

    if (viewAll && isSuper) {
      // Super user global financial analytics (parallelized queries)
      const [
        totalBalanceAgg,
        transactionsAgg,
        topupAgg,
        subsAgg,
        allTransactions,
      ] = await Promise.all([
        prisma.user.aggregate({
          _sum: { balance: true },
          _count: { id: true },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.transaction.aggregate({
          where: { type: "TOPUP" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: "SUBSCRIPTION" },
          _sum: { amount: true },
        }),
        prisma.transaction.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

      return NextResponse.json({
        stats: {
          totalPlatformBalance: totalBalanceAgg._sum.balance || 0,
          totalUsers: totalBalanceAgg._count.id || 0,
          totalTransactionsCount: transactionsAgg._count.id || 0,
          totalTopupVolume: topupAgg._sum.amount || 0,
          totalSubsVolume: subsAgg._sum.amount || 0,
        },
        transactions: allTransactions,
        isSuperView: true,
      });
    }

    // Regular user balance & transactions (parallelized)
    const [dbUser, userTransactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      balance: dbUser?.balance || 0,
      transactions: userTransactions,
      isSuperView: false,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data balance & transaksi." },
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
    const { amount, paymentMethod } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Nominal top up tidak valid. Minimal $5.00." },
        { status: 400 }
      );
    }

    if (numAmount > 10000) {
      return NextResponse.json(
        { error: "Maksimal satu kali top up adalah $10,000.00." },
        { status: 400 }
      );
    }

    // Top up execution in atomic transaction
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: numAmount,
          },
        },
        select: {
          id: true,
          balance: true,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "TOPUP",
          amount: numAmount,
          description: `Top-up Saldo Garasi via ${paymentMethod || "Virtual Wallet"} (+${numAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })})`,
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      message: `Top up sebesar $${numAmount.toFixed(2)} berhasil diproses!`,
      newBalance: updatedUser.balance,
      transaction,
    });
  } catch (error) {
    console.error("Top up error:", error);
    return NextResponse.json(
      { error: "Gagal memproses top up saldo." },
      { status: 500 }
    );
  }
}
