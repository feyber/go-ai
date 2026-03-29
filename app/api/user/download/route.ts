import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { videoId } = await req.json();

    // Find the UserVideo record for this user and video
    const userVideo = await prisma.userVideo.findFirst({
      where: {
        userId: session.user.id,
        videoId: videoId
      },
      include: {
        video: true
      }
    });

    if (!userVideo) return NextResponse.json({ error: "Video assignment not found" }, { status: 404 });

    // Update downloadedAt timestamp if not already set
    if (!userVideo.downloadedAt) {
      await prisma.userVideo.update({
        where: { id: userVideo.id },
        data: { downloadedAt: new Date() }
      });
    }

    const videoUrl = userVideo.video.url;

    // Check if this is an R2-stored video (prefixed with r2://)
    if (videoUrl.startsWith("r2://")) {
      const r2Key = videoUrl.replace("r2://", "");
      
      // Fetch the file from R2
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
      });

      const r2Response = await r2Client.send(command);

      if (!r2Response.Body) {
        return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
      }

      // Determine file extension for the download filename
      const ext = r2Key.substring(r2Key.lastIndexOf(".")) || ".mp4";
      const downloadFilename = `GO-AI_Video${ext}`;

      // Stream the file to the user with Content-Disposition: attachment
      // This header forces the browser to SAVE the file instead of opening it
      const stream = r2Response.Body as ReadableStream;
      
      return new Response(stream as any, {
        headers: {
          "Content-Type": r2Response.ContentType || "video/mp4",
          "Content-Disposition": `attachment; filename="${downloadFilename}"`,
          "Content-Length": r2Response.ContentLength?.toString() || "",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Legacy: for non-R2 videos (old Google Drive links), return the URL for redirect
    return NextResponse.json({ 
      success: true, 
      downloadedAt: userVideo.downloadedAt || new Date(),
      redirectUrl: videoUrl 
    });
  } catch (error) {
    console.error("Failed to process download", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
