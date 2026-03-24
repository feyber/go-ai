import { PrismaClient } from '@prisma/client';

async function simulateWebhook() {
  const prisma = new PrismaClient();
  
  console.log("Mencari transaksi pending terbaru...");
  const pending = await prisma.subscription.findFirst({
    where: { status: 'pending' },
    orderBy: { startedAt: 'desc' }
  });

  if (!pending) {
    console.log("❌ Tidak ada transaksi pending yang ditemukan. Silakan checkout dulu di web.");
    process.exit(1);
  }

  console.log(`Menemukan Order ID: ${pending.orderId} dengan jumlah Rp${pending.amount}`);
  console.log("Mensimulasikan Webhook Pakasir (completed)...");

  const payload = {
    project: "go-ai", // Sesuai dengan PAKASIR_SLUG di .env
    status: "completed",
    order_id: pending.orderId,
    amount: pending.amount,
    payment_method: "dummy"
  };

  try {
    const res = await fetch('http://localhost:3000/api/webhook/pakasir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Response Webhook Server:", res.status, data);

    if (res.status === 200) {
      console.log("✅ Berhasil! Silakan refresh halaman dashboard Anda.");
    }
  } catch (error) {
    console.error("Gagal mengirim webhook:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateWebhook();
