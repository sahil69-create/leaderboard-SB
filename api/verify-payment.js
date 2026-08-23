const crypto = require('crypto');

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, phone, sourceWebsite, sourcePage } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !name || !email || !sourceWebsite) {
      return res.status(400).json({ error: 'Incomplete payment details' });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: 'Payment verification is not configured yet' });
    }

    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (!safeEqual(expected, razorpay_signature)) return res.status(400).json({ error: 'Invalid payment signature' });

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok || payment.order_id !== razorpay_order_id || payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment is not captured or does not match the order' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ error: 'Donation storage is not configured yet' });
    }
    const table = process.env.SUPABASE_DONATIONS_TABLE || 'donations';
    const storageResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        donor_name: String(name).trim().slice(0, 80),
        donor_email: String(email).trim().slice(0, 120),
        donor_phone: String(phone || '').replace(/\D/g, '').slice(0, 15),
        payment_id: String(razorpay_payment_id).slice(0, 100),
        order_id: String(razorpay_order_id).slice(0, 100),
        amount: Math.round(Number(payment.amount) / 100),
        source_website: String(sourceWebsite).slice(0, 200),
        source_page: String(sourcePage || '').slice(0, 500),
        paid_at: new Date().toISOString()
      })
    });
    if (!storageResponse.ok) return res.status(502).json({ error: 'Payment verified but donor record could not be saved' });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Unable to verify payment' });
  }
};
