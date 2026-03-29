import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAssignedVideos } from "@/lib/videoAssignment";
import Navbar from "@/components/Navbar";
import DownloadButton from "@/components/DownloadButton";
import ProfileEditor from "@/components/ProfileEditor";
import { prisma } from "@/lib/prisma";
import VideoList from "@/components/VideoList";
import TikTokTracker from "@/components/TikTokTracker";

import FreeClaimCard from "@/components/user/FreeClaimCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Auto-redirect Super Admin to the /admin page
  if ((session.user as any).role === "ADMIN") {
    redirect("/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, whatsapp: true, tiktok: true, whatsappVerified: true, videoCategory: true, hasClaimedFreeVideos: true }
  });

  const rawSettings = await prisma.setting.findMany();
  const settings = rawSettings.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const enableBasic = settings.enable_basic !== "false";
  const enablePro = settings.enable_pro !== "false";
  const enableUltimate = settings.enable_ultimate !== "false";

  const { hasAccess, videos, pendingVideo, activeSubscription } = await getAssignedVideos(session.user.id);

  let activePlanName = "None";
  if (activeSubscription) {
    if (activeSubscription.tier === 1) activePlanName = "Basic";
    else if (activeSubscription.tier === 2) activePlanName = "Pro";
    else if (activeSubscription.tier === 3) activePlanName = "Ultimate";
    else if (activeSubscription.tier >= 10) activePlanName = `PAYG ${activeSubscription.tier}`;
  } else if (videos.length > 0) {
    activePlanName = "PAY-AS-YOU-GO";
  }

  // Define if the cards should be locked
  // Pro locks Basic. Basic DOES NOT lock Pro (upgrade path open).
  const isBasicLocked = activeSubscription?.tier === 2 || activeSubscription?.tier === 3;
  const isProLocked = activeSubscription?.tier === 3; 
  const isUltimateLocked = false;
  const isPaygLocked = !activeSubscription || activeSubscription.tier >= 10;

  // Calculate expiration color
  let expireColor = '#39ff14'; // default green
  if (activeSubscription?.expiresAt) {
    const expiresAtDate = new Date(activeSubscription.expiresAt);
    const timeDiff = expiresAtDate.getTime() - new Date().getTime();
    const daysRemaining = timeDiff / (1000 * 3600 * 24);
    if (daysRemaining <= 7) {
      expireColor = '#ff4444'; // red if 7 days or less
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 z-0 crt pointer-events-none"></div>
      <div className="absolute inset-0 z-0 scanline pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="container pb-20 flex-1" style={{ paddingTop: '120px' }}>
          <h1 className="text-glow-green" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '10px', textTransform: 'uppercase', wordBreak: 'break-word' }}>
            Member Dashboard
          </h1>
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
              Welcome, {session.user.name}.
            </p>
            <div style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Active Plan:</span> 
              <span style={{ 
                color: activePlanName !== "None" ? '#39ff14' : '#ff007f', 
                background: activePlanName !== "None" ? 'rgba(57,255,20,0.1)' : 'rgba(255,0,127,0.1)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: `1px solid ${activePlanName !== "None" ? '#39ff14' : '#ff007f'}`,
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>{activePlanName}</span>
            </div>
            {activeSubscription && activeSubscription.tier < 10 && activeSubscription.expiresAt && (
              <div style={{ color: '#aaa', fontSize: '1rem', marginTop: '5px' }}>
                Masa berlaku / Plan expired: <span style={{ color: expireColor, fontWeight: 'bold' }}>
                  {new Date(activeSubscription.expiresAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* User Profile Editor & Free Claim Card */}
          {dbUser && (
            <>
              {(!dbUser.hasClaimedFreeVideos) && (
                <FreeClaimCard 
                  hasClaimedFreeVideos={dbUser.hasClaimedFreeVideos} 
                  hasWhatsapp={!!dbUser.whatsapp} 
                />
              )}
              <ProfileEditor 
                user={{ email: dbUser.email, whatsapp: dbUser.whatsapp, tiktok: dbUser.tiktok, whatsappVerified: dbUser.whatsappVerified?.toISOString() ?? null, videoCategory: dbUser.videoCategory }} 
                activeTier={activeSubscription?.tier || 0}
              />
            </>
          )}

          {!hasAccess ? (
            <div style={{ marginTop: '20px' }}>
              <div style={{ padding: '40px', background: 'rgba(255, 0, 127, 0.1)', border: '1px solid #ff007f', textAlign: 'center', marginBottom: '60px' }}>
                <h2 className="text-glow-pink" style={{ color: '#ff007f', fontSize: '2rem', marginBottom: '20px' }}>No Active Subscription</h2>
                <p>You currently do not have an active package or it has expired.</p>
              </div>

              {/* Pricing Section MOVED OUT */}
            </div>
          ) : (
            <div>
              {videos.length === 0 ? (
                <div style={{ padding: '40px', background: 'rgba(57, 255, 20, 0.1)', border: '1px solid #39ff14', textAlign: 'center' }}>
                  <h3 className="text-glow-green" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Videos Available D:</h3>
                  <p>Our pool is currently empty. Please wait for the admin to restock or check back later!</p>
                </div>
              ) : (
                <VideoList initialVideos={videos} />
              )}
            </div>
          )}

          {/* Independent TikTok Post Tracker */}
          <TikTokTracker />
          {/* Pricing Section Always Visible Below */}
          <section id="pricing" style={{ padding: '60px 20px', marginTop: '60px', backgroundColor: 'rgba(5, 5, 5, 0.8)', borderTop: '2px solid #39ff14', borderRadius: '12px' }}>
            <div className="container text-center">
              <h2 className="text-glow-pink" style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#ff007f', textTransform: 'uppercase' }}>Top-up & Memberships</h2>
              <p style={{ marginBottom: '60px', color: '#aaa' }}>Need more videos? Buy a PAY-AS-YOU-GO pack, ready instantly.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', margin: '0 auto', maxWidth: '1200px', marginBottom: '40px' }}>

                {/* Tier 1 - Basic */}
                {enableBasic && (
                <div style={{ 
                  border: '1px solid #333', 
                  padding: '40px 20px', 
                  position: 'relative', 
                  background: '#0a0a0a', 
                  transition: 'all 0.3s',
                  opacity: isBasicLocked ? 0.4 : 1,
                  filter: isBasicLocked ? 'grayscale(100%)' : 'none',
                  pointerEvents: isBasicLocked ? 'none' : 'auto'
                }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Basic</h3>
                  <div style={{ fontSize: '0.9rem', color: '#39ff14', marginBottom: '10px', letterSpacing: '1px' }}>1 VIDEO / DAY</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: 'bold' }}>Rp 99.000 <span style={{ fontSize: '0.8rem', color: '#aaa' }}>/ mo</span></div>
                  <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights per user</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Daily refresh at 00:00 WIB</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Valid for 1 Month</p>
                  </div>
                  {activeSubscription?.tier === 1 ? (
                    <div style={{ border: '1px solid #333', color: '#888', background: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}>
                      SUBSCRIBED
                    </div>
                  ) : isBasicLocked ? (
                    <div style={{ border: '1px solid #222', color: '#444', background: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}>
                      LOCKED
                    </div>
                  ) : (
                    <form action="/api/checkout" method="POST">
                      <input type="hidden" name="tier" value="1" />
                      <input type="hidden" name="isYearly" value="false" />
                      <button type="submit" className="btn-retro w-full">Subscribe</button>
                    </form>
                  )}
                </div>
                )}

                {/* Tier 2 - Pro */}
                {enablePro && (
                <div style={{ 
                  border: '1px solid #39ff14', 
                  padding: '40px 20px', 
                  position: 'relative', 
                  background: 'rgba(57, 255, 20, 0.05)', 
                  boxShadow: '0 0 15px rgba(0,243,255,0.1)',
                  opacity: isProLocked ? 0.4 : 1,
                  filter: isProLocked ? 'grayscale(100%)' : 'none',
                  pointerEvents: isProLocked ? 'none' : 'auto'
                }}>
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#39ff14', color: '#000', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>RECOMMENDED</div>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Pro</h3>
                  <div style={{ fontSize: '0.9rem', color: '#39ff14', marginBottom: '10px', letterSpacing: '1px' }}>2 VIDEOS / DAY</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: 'bold' }}>Rp 199.000 <span style={{ fontSize: '0.8rem', color: '#aaa' }}>/ mo</span></div>
                  <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights per user</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Daily refresh at 00:00 WIB</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Valid for 1 Month</p>
                  </div>
                  {activeSubscription?.tier === 2 ? (
                    <div style={{ border: '1px solid #39ff14', color: '#39ff14', background: 'rgba(57,255,20,0.1)', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px', boxShadow: 'inset 0 0 10px rgba(57,255,20,0.2)' }}>
                      SUBSCRIBED
                    </div>
                  ) : isProLocked ? (
                    <div style={{ border: '1px solid #222', color: '#444', background: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}>
                      LOCKED
                    </div>
                  ) : (
                    <form action="/api/checkout" method="POST">
                      <input type="hidden" name="tier" value="2" />
                      <input type="hidden" name="isYearly" value="false" />
                      <button type="submit" className="btn-retro w-full" style={{ background: 'rgba(57, 255, 20, 0.1)' }}>Subscribe</button>
                    </form>
                  )}
                </div>
                )}

                {/* Tier 3 - Ultimate */}
                {enableUltimate && (
                <div style={{ 
                  border: '1px solid #ffb700', 
                  padding: '40px 20px', 
                  position: 'relative', 
                  background: 'linear-gradient(135deg, rgba(255,183,0,0.1) 0%, rgba(10,10,10,1) 100%)', 
                  boxShadow: '0 0 15px rgba(255,183,0,0.15)',
                  opacity: isUltimateLocked ? 0.4 : 1,
                  filter: isUltimateLocked ? 'grayscale(100%)' : 'none',
                  pointerEvents: isUltimateLocked ? 'none' : 'auto'
                }}>
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#ffb700', color: '#000', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>VIP</div>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Ultimate</h3>
                  <div style={{ fontSize: '0.9rem', color: '#ffb700', marginBottom: '10px', letterSpacing: '1px' }}>3 VIDEOS / DAY</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: 'bold' }}>Rp 549.000 <span style={{ fontSize: '0.8rem', color: '#aaa' }}>/ mo</span></div>
                  <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Bisa memilih kategori video</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>CS Prioritas</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights per user</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Valid for 1 Month</p>
                  </div>
                  {activeSubscription?.tier === 3 ? (
                    <div style={{ border: '1px solid #ffb700', color: '#ffb700', background: 'rgba(255,183,0,0.1)', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px', boxShadow: 'inset 0 0 10px rgba(255,183,0,0.2)' }}>
                      SUBSCRIBED
                    </div>
                  ) : isUltimateLocked ? (
                    <div style={{ border: '1px solid #222', color: '#444', background: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}>
                      LOCKED
                    </div>
                  ) : (
                    <form action="/api/checkout" method="POST">
                      <input type="hidden" name="tier" value="3" />
                      <input type="hidden" name="isYearly" value="false" />
                      <button type="submit" className="btn-retro w-full" style={{ background: 'rgba(255, 183, 0, 0.1)', borderColor: '#ffb700', color: '#ffb700' }}>Subscribe</button>
                    </form>
                  )}
                </div>
                )}

              </div>

              {/* PAYG Layout - Centered below Subs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', margin: '0 auto', maxWidth: '800px' }}>

                {/* PAYG - 10 */}
                <div style={{ 
                  flex: '1 1 280px',
                  maxWidth: '400px',
                  border: '1px solid #ff007f',  
                  padding: '40px 20px', 
                  position: 'relative', 
                  background: '#0a0a0a',
                  opacity: isPaygLocked ? 0.4 : 1,
                  filter: isPaygLocked ? 'grayscale(100%)' : 'none',
                  pointerEvents: isPaygLocked ? 'none' : 'auto'
                }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>PAY-AS-YOU-GO</h3>
                  <div style={{ fontSize: '0.9rem', color: '#ff007f', marginBottom: '10px', letterSpacing: '1px' }}>10 VIDEOS INSTANT</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: 'bold' }}>Rp 50.000 <span style={{ fontSize: '0.8rem', color: '#aaa' }}>/ one-time</span></div>
                  <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No expiration</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Available instantly</p>
                  </div>
                  {isPaygLocked ? (
                    <div style={{ border: '1px solid #222', color: '#444', background: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}>
                      REQUIRES SUB
                    </div>
                  ) : (
                    <form action="/api/checkout" method="POST">
                      <input type="hidden" name="tier" value="10" />
                      <input type="hidden" name="isYearly" value="false" />
                      <button type="submit" className="btn-retro w-full" style={{ color: '#ff007f', borderColor: '#ff007f' }}>Buy 10 Videos</button>
                    </form>
                  )}
                </div>

                {/* PAYG - 30 */}
                <div style={{ 
                  flex: '1 1 280px',
                  maxWidth: '400px',
                  border: '1px solid #ff007f', 
                  padding: '40px 20px', 
                  position: 'relative', 
                  background: '#0a0a0a',
                  opacity: isPaygLocked ? 0.4 : 1,
                  filter: isPaygLocked ? 'grayscale(100%)' : 'none',
                  pointerEvents: isPaygLocked ? 'none' : 'auto'
                }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>PAY-AS-YOU-GO</h3>
                  <div style={{ fontSize: '0.9rem', color: '#ff007f', marginBottom: '10px', letterSpacing: '1px' }}>30 VIDEOS INSTANT</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: 'bold' }}>Rp 150.000 <span style={{ fontSize: '0.8rem', color: '#aaa' }}>/ one-time</span></div>
                  <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No expiration</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Exclusive rights</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Available instantly</p>
                  </div>
                  {isPaygLocked ? (
                    <div style={{ border: '1px solid #222', color: '#444', background: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }}>
                      REQUIRES SUB
                    </div>
                  ) : (
                    <form action="/api/checkout" method="POST">
                      <input type="hidden" name="tier" value="30" />
                      <input type="hidden" name="isYearly" value="false" />
                      <button type="submit" className="btn-retro w-full" style={{ color: '#ff007f', borderColor: '#ff007f' }}>Buy 30 Videos</button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
