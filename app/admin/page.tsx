import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Navbar from "@/components/Navbar";
import AdminTabsView from "@/components/admin/AdminTabsView";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Check authorization based on JWT role injection
  if ((session.user as any).role !== "ADMIN") {
    return <div className="p-8">Access Denied: You are not an Admin.</div>;
  }

  const handleAddVideos = async (formData: FormData) => {
    "use server";
    const linksRaw = formData.get("links") as string;
    if (!linksRaw) return;

    const urls = linksRaw.split("\n").map(l => l.trim()).filter(Boolean);

    await prisma.video.createMany({
      data: urls.map(u => ({ url: u }))
    });

    revalidatePath("/admin");
  };

  const poolCount = await prisma.video.count({ where: { isAssigned: false } });
  const usedCount = await prisma.video.count({ where: { isAssigned: true } });

  return (
    <main className="min-h-screen flex flex-col relative">
      <Navbar />
      <div className="container py-20 flex-1 relative z-10">
        <h1 className="text-glow-blue" style={{ fontSize: '3rem', marginBottom: '40px' }}>System Admin</h1>

        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>

          <div style={{ padding: '40px 30px', background: 'rgba(10, 10, 10, 0.95)', borderTop: '3px solid #333', borderBottom: '1px solid #222', borderLeft: '1px solid #222', borderRight: '1px solid #222', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>Video Pool Status</h2>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '3.5rem', color: '#39ff14', fontWeight: '800', lineHeight: '1' }}>{poolCount}</div>
                <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>Available</div>
              </div>
              <div style={{ borderLeft: '1px solid #333', paddingLeft: '20px' }}>
                <div style={{ fontSize: '3.5rem', color: '#ff007f', fontWeight: '800', lineHeight: '1' }}>{usedCount}</div>
                <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>Assigned</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '30px', background: 'rgba(10, 10, 10, 0.95)', borderTop: '3px solid #ff007f', borderBottom: '1px solid #222', borderLeft: '1px solid #222', borderRight: '1px solid #222', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 className="text-glow-pink" style={{ fontSize: '1.4rem', color: '#ff007f', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>Add New Videos</h2>
            <form action={handleAddVideos}>
              <textarea
                name="links"
                rows={4}
                placeholder="Paste video URLs here, one per line (Google Drive or direct links)"
                style={{ width: '100%', padding: '15px', background: '#0f0f0f', color: '#fff', border: '1px solid #333', marginBottom: '20px', borderRadius: '6px', resize: 'vertical', fontSize: '0.95rem', outline: 'none' }}
              />
              <button type="submit" className="btn-retro  w-full" style={{ padding: '14px', borderRadius: '6px', letterSpacing: '2px' }}>Add to Pool</button>
            </form>
          </div>

        </div>

        {/* Tabbed Admin View */}
        <AdminTabsView />
      </div>
    </main>
  );
}
