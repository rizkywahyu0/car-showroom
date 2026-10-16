import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const { name, image, currentPassword, newPassword } = body;

    const updateData: { name?: string; image?: string | null; password?: string } = {};

    if (name && typeof name === "string") {
      updateData.name = name.trim();
    }

    if (image !== undefined) {
      updateData.image = image ? String(image).trim() : null;
    }

    // Password change request
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Masukkan password saat ini untuk mengganti password baru." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password baru minimal 6 karakter." },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
      }

      const isCurrentValid = await verifyPassword(currentPassword, dbUser.password);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Password saat ini salah." },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }
}
