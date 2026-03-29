import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const operators = (process.env.OPERATOR_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || "";
  const isSuperAdmin = superAdmins.includes(userEmail) || (session.user as any).role === "ADMIN";
  const isOperator = operators.includes(userEmail);

  if (!isSuperAdmin && !isOperator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File terlalu besar. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExt) {
      return NextResponse.json({ error: "Format tidak valid. Hanya MP4, MOV, WEBM, MKV." }, { status: 400 });
    }

    const ext = fileName.substring(fileName.lastIndexOf("."));
    const key = `videos/${uuidv4()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "video/mp4",
      })
    );

    // Return the R2 URL only — DB save happens later via the "Tambah Video" button
    return NextResponse.json({ success: true, url: `r2://${key}` });
  } catch (error) {
    console.error("Upload to R2 failed:", error);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}
