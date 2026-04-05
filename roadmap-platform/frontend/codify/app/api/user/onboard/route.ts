import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // Here you could save the full onboarding data if needed, 
        // but the requirement is to record THAT the user has onboarded.

        await prisma.user.update({
            where: { email: session.user.email },
            data: { onboarded: true },
        });

        return NextResponse.json({ message: "Onboarding completed" }, { status: 200 });
    } catch (error) {
        console.error("Onboarding API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
