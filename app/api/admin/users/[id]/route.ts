import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (currentUser.role !== "SUPERUSER" && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya super user yang dapat mengubah data user." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { role, balance, subscriptionTier, subscriptionStatus, balanceAdjustmentReason } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const dataToUpdate: Record<string, string | number> = {};

    if (role && typeof role === "string") {
      dataToUpdate.role = role.toUpperCase();
    }

    if (subscriptionTier && typeof subscriptionTier === "string") {
      dataToUpdate.subscriptionTier = subscriptionTier.toUpperCase();
    }

    if (subscriptionStatus && typeof subscriptionStatus === "string") {
      dataToUpdate.subscriptionStatus = subscriptionStatus.toUpperCase();
    }

    let updatedUser;

    if (typeof balance === "number" && Math.abs(balance - targetUser.balance) > 0.01) {
      const diff = balance - targetUser.balance;
      dataToUpdate.balance = Math.max(0, balance);

      const [resUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: dataToUpdate,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            updatedAt: true,
          },
        }),
        prisma.transaction.create({
          data: {
            userId: id,
            type: "ADMIN_ADJUST",
            amount: diff,
            description: balanceAdjustmentReason || `Penyesuaian saldo oleh Admin (${diff >= 0 ? "+" : ""}$${diff.toFixed(2)})`,
            status: "COMPLETED",
          },
        }),
      ]);
      updatedUser = resUser;
    } else {
      if (typeof balance === "number") {
        dataToUpdate.balance = Math.max(0, balance);
      }
      updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          balance: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({
      message: "Data user berhasil diperbarui.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (currentUser.role !== "SUPERUSER" && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya super user yang dapat menghapus user." },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun Anda sendiri saat ini." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User berhasil dihapus." });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus user." },
      { status: 500 }
    );
  }
}
