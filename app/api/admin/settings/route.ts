import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "OPERATOR")) {
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const operators = (process.env.OPERATOR_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const userEmail = session?.user?.email?.toLowerCase() || "";
    
    if (!superAdmins.includes(userEmail) && !operators.includes(userEmail)) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
      // let's allow read access for everyone so dashboard can fetch it? Wait, dashboard should fetch cleanly internally without API, but if it uses API it needs public read access. Or we can just read prisma directly in server components.
      // So this API is mostly for Admin, but if we just make GET public, it's safer for client components if they need it. Let's keep it public for GET.
    }
  }

  const rawSettings = await prisma.setting.findMany();
  const settings = rawSettings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // Default values if not set
  if (!settings.enable_basic) settings.enable_basic = "true";
  if (!settings.enable_pro) settings.enable_pro = "true";
  if (!settings.enable_ultimate) settings.enable_ultimate = "true";

  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session?.user?.email?.toLowerCase() || "";

  if (!session?.user || ((session.user as any).role !== "ADMIN" && !superAdmins.includes(userEmail))) {
    return NextResponse.json({ error: "Unauthorized. Super Admin only." }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Convert object to array of {key, value}
    const updates = Object.keys(data).map(key => ({
      key,
      value: String(data[key])
    }));

    // Upsert all
    for (const update of updates) {
      await prisma.setting.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value }
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
