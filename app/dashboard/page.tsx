import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAssignedVideos } from "@/lib/videoAssignment";
import Navbar from "@/components/Navbar";
import DownloadButton from "@/components/DownloadButton";
import ProfileEditor from "@/components/ProfileEditor";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Auto-redirect Super Admin to the /admin page
  if ((session.user as any).role === "ADMIN") {
    redirect("/admin");
  }

  // Fetch full user data to pass to Profile Editor
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, whatsapp: true, tiktok: true }
  });

  const { hasAccess, videos } = await getAssignedVideos(session.user.id);

  return (
    <main className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 z-0 crt pointer-events-none"></div>
      <div className="absolute inset-0 z-0 scanline pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="container py-20 flex-1">
          <h1 className="text-glow-green" style={{ fontSize: '3rem', marginBottom: '20px', textTransform: 'uppercase' }}>
            Member Dashboard
          </h1>
          <p style={{ color: '#aaa', marginBottom: '40px', fontSize: '1.2rem' }}>
            Welcome, {session.user.name}. Your exclusive video pool awaits.
          </p>

          {/* User Profile Editor */}
          {dbUser && (
            <ProfileEditor user={{ email: dbUser.email, whatsapp: dbUser.whatsapp, tiktok: dbUser.tiktok }} />
          )}

          {!hasAccess ? (
            <div style={{ marginTop: '20px' }}>
              <div style={{ padding: '40px', background: 'rgba(255, 0, 127, 0.1)', border: '1px solid #ff007f', textAlign: 'center', marginBottom: '60px' }}>
                <h2 className="text-glow-pink" style={{ color: '#ff007f', fontSize: '2rem', marginBottom: '20px' }}>No Active Subscription</h2>
                <p>You currently do not have an active package or it has expired.</p>
              </div>

              {/* Pricing Section Moved Here */}
              <section id="pricing" style={{ padding: '40px 20px', backgroundColor: 'rgba(5, 5, 5, 0.8)', borderTop: '1px solid #39ff14' }}>
                <div className="container text-center">
                  <h2 className="text-glow-pink" style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#ff007f', textTransform: 'uppercase' }}>Membership Tiers</h2>
                  <p style={{ marginBottom: '60px', color: '#aaa' }}>Save 20% when you choose annual billing.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '0 auto', maxWidth: '1000px' }}>

                    {/* Tier 1 */}
                    <div style={{ border: '1px solid #333', padding: '40px 20px', position: 'relative', background: '#0a0a0a', transition: 'all 0.3s' }}>
                      <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Starter</h3>
                      <div style={{ fontSize: '0.9rem', color: '#39ff14', marginBottom: '20px', letterSpacing: '1px' }}>1 VIDEO / DAY</div>
                      <div style={{ marginBottom: '30px' }}>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights per user</p>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Daily refresh at 00:00 WIB</p>
                      </div>
                      <form action="/api/checkout" method="POST">
                        <input type="hidden" name="tier" value="1" />
                        <input type="hidden" name="isYearly" value="false" />
                        <button type="submit" className="btn-retro w-full">Subscribe</button>
                      </form>
                    </div>

                    {/* Tier 2 */}
                    <div style={{ border: '1px solid #39ff14', padding: '40px 20px', position: 'relative', background: 'rgba(57, 255, 20, 0.05)', boxShadow: '0 0 15px rgba(0,243,255,0.1)' }}>
                      <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#39ff14', color: '#000', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>RECOMMENDED</div>
                      <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Pro</h3>
                      <div style={{ fontSize: '0.9rem', color: '#39ff14', marginBottom: '20px', letterSpacing: '1px' }}>2 VIDEOS / DAY</div>
                      <div style={{ marginBottom: '30px' }}>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights per user</p>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Daily refresh at 00:00 WIB</p>
                      </div>
                      <form action="/api/checkout" method="POST">
                        <input type="hidden" name="tier" value="2" />
                        <input type="hidden" name="isYearly" value="false" />
                        <button type="submit" className="btn-retro w-full" style={{ background: 'rgba(57, 255, 20, 0.1)' }}>Subscribe</button>
                      </form>
                    </div>

                    {/* Tier 3 */}
                    <div style={{ border: '1px solid #333', padding: '40px 20px', position: 'relative', background: '#0a0a0a' }}>
                      <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Agency</h3>
                      <div style={{ fontSize: '0.9rem', color: '#ff007f', marginBottom: '20px', letterSpacing: '1px' }}>3 VIDEOS / DAY</div>
                      <div style={{ marginBottom: '30px' }}>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights per user</p>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Daily refresh at 00:00 WIB</p>
                      </div>
                      <form action="/api/checkout" method="POST">
                        <input type="hidden" name="tier" value="3" />
                        <input type="hidden" name="isYearly" value="false" />
                        <button type="submit" className="btn-retro  w-full">Subscribe</button>
                      </form>
                    </div>

                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div>
              {videos.length === 0 ? (
                <div style={{ padding: '40px', background: 'rgba(57, 255, 20, 0.1)', border: '1px solid #39ff14', textAlign: 'center' }}>
                  <h3 className="text-glow-green" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Videos Available D:</h3>
                  <p>Our pool is currently empty. Please wait for the admin to restock or check back later!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                  {videos.map((vid: any, i: number) => (
                    <div key={vid.id} style={{ border: '1px solid #333', padding: '20px', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '1.2rem', color: '#39ff14', marginBottom: '15px' }}>Video {i + 1}</div>

                      {/* Video Preview or embed if available */}
                      {vid.previewUrl ? (
                        <div style={{ width: '100%', height: '200px', backgroundColor: '#000', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <a href={vid.previewUrl} target="_blank" rel="noreferrer" style={{ color: '#aaa', textDecoration: 'underline' }}>View Preview Link</a>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '200px', backgroundColor: '#111', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#555' }}>No Preview</span>
                        </div>
                      )}

                      <DownloadButton url={vid.url} videoId={vid.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
