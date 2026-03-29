import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AdminTabsView from "@/components/admin/AdminTabsView";
import ResetPoolButton from "@/components/admin/ResetPoolButton";
import VideoUploadForm from "@/components/admin/VideoUploadForm";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // System Roles via ENV
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const operators = (process.env.OPERATOR_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || "";

  // Original fallback if the user is literally 'ADMIN' in DB, but new flow prefers env variables checking
  const isSuperAdmin = superAdmins.includes(userEmail) || (session.user as any).role === "ADMIN";
  const isOperator = operators.includes(userEmail);

  if (!isSuperAdmin && !isOperator) {
    return <div className="p-8">Access Denied: You are not an Admin or Operator.</div>;
  }

  const poolCount = await prisma.video.count({ where: { isAssigned: false } });
  const usedCount = await prisma.video.count({ where: { isAssigned: true } });
  
  // Fetch Category Stats for the "Surprise" detail
  const categoryStats = await prisma.video.groupBy({
    by: ['category'],
    _count: { _all: true },
    where: { isAssigned: false },
    orderBy: { _count: { category: 'desc' } },
    take: 5
  });

  const totalVideos = poolCount + usedCount;
  const loadPercentage = totalVideos > 0 ? (usedCount / totalVideos) * 100 : 0;

  return (
    <main className="min-h-screen flex flex-col relative">
      <Navbar />
      <div className="container pb-20 flex-1 relative z-10" style={{ paddingTop: '120px' }}>
        <h1 className="text-glow-blue" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '40px', wordBreak: 'break-word' }}>
          System {isSuperAdmin ? 'Admin' : 'Operator'}
        </h1>

        <div className="admin-grid responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '30px' }}>

          <div style={{ padding: '40px 30px', background: 'rgba(10, 10, 10, 0.95)', borderTop: '3px solid #333', borderBottom: '1px solid #222', borderLeft: '1px solid #222', borderRight: '1px solid #222', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Video Pool Status</h2>
              <ResetPoolButton />
            </div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around', textAlign: 'center', marginBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '3.5rem', color: '#39ff14', fontWeight: '800', lineHeight: '1' }}>{poolCount}</div>
                <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>Available</div>
              </div>
              <div style={{ borderLeft: '1px solid #333', paddingLeft: '20px' }}>
                <div style={{ fontSize: '3.5rem', color: '#ff007f', fontWeight: '800', lineHeight: '1' }}>{usedCount}</div>
                <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>Assigned</div>
              </div>
            </div>

            {/* Surprise Detailed Stats */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '25px', marginTop: '20px' }}>
              <style>{`
                @keyframes pulse-green {
                  0% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.7); }
                  70% { box-shadow: 0 0 0 10px rgba(57, 255, 20, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0); }
                }
                .pulse-dot {
                  width: 8px;
                  height: 8px;
                  background: #39ff14;
                  border-radius: 50%;
                  animation: pulse-green 2s infinite;
                }
              `}</style>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', background: 'rgba(57,255,20,0.05)', padding: '10px 15px', borderRadius: '6px', border: '1px solid rgba(57,255,20,0.1)' }}>
                <div className="pulse-dot"></div>
                <div style={{ fontSize: '0.75rem', color: '#39ff14', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Live System Status: Operational
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span>Inventory Load</span>
                  <span>{loadPercentage.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${loadPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #39ff14, #00f3ff)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock Composition:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categoryStats.length > 0 ? categoryStats.map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '8px 12px', borderRadius: '4px', border: '1px solid #1a1a1a' }}>
                      <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{stat.category || 'Uncategorized'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#39ff14', fontWeight: 'bold' }}>{stat._count._all} vids</span>
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>No categorised stock available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '30px', background: 'rgba(10, 10, 10, 0.95)', borderTop: '3px solid #ff007f', borderBottom: '1px solid #222', borderLeft: '1px solid #222', borderRight: '1px solid #222', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 className="text-glow-pink" style={{ fontSize: '1.4rem', color: '#ff007f', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>Add New Videos</h2>
            <VideoUploadForm />
          </div>

        </div>

        {/* Tabbed Admin View - Hidden for operators */}
        {isSuperAdmin && (
          <AdminTabsView />
        )}
      </div>
    </main>
  );
}
