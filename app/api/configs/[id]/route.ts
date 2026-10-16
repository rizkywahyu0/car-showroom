import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const config = await prisma.savedCarConfig.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!config) {
      return NextResponse.json({ error: "Konfigurasi tidak ditemukan." }, { status: 404 });
    }

    const isSuper = user.role === "SUPERUSER" || user.role === "ADMIN";
    if (config.userId !== user.id && !isSuper) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Fetch single config error:", error);
    return NextResponse.json({ error: "Gagal mengambil konfigurasi." }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, notes } = body;

    const existing = await prisma.savedCarConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Konfigurasi tidak ditemukan." }, { status: 404 });
    }

    const isSuper = user.role === "SUPERUSER" || user.role === "ADMIN";
    if (existing.userId !== user.id && !isSuper) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.savedCarConfig.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(notes !== undefined ? { notes: notes ? String(notes).trim() : null } : {}),
      },
    });

    return NextResponse.json({ message: "Konfigurasi diperbarui.", config: updated });
  } catch (error) {
    console.error("Update config error:", error);
    return NextResponse.json({ error: "Gagal memperbarui konfigurasi." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.savedCarConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Konfigurasi tidak ditemukan." }, { status: 404 });
    }

    const isSuper = user.role === "SUPERUSER" || user.role === "ADMIN";
    if (existing.userId !== user.id && !isSuper) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.savedCarConfig.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Konfigurasi berhasil dihapus." });
  } catch (error) {
    console.error("Delete config error:", error);
    return NextResponse.json({ error: "Gagal menghapus konfigurasi." }, { status: 500 });
  }
}
