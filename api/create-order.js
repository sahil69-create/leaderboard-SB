const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, name, sourceWebsite, sourcePage } = req.body || {};
    const amountInRupees = Number(amount);
    if (!Number.isInteger(amountInRupees) || amountInRupees < 1 || amountInRupees > 1000000) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }
    if (typeof name !== 'string' || !name.trim() || typeof sourceWebsite !== 'string') {
      return res.status(400).json({ error: 'Donor details are required' });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: 'Payment gateway is not configured yet' });
    }

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInRupees * 100,
        currency: 'INR',
        receipt: `donation_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        notes: { donor_name: name.trim().slice(0, 80), source_website: sourceWebsite.slice(0, 200), source_page: String(sourcePage || '').slice(0, 500) }
      })
    });
    const order = await response.json();
    if (!response.ok) return res.status(502).json({ error: order.error?.description || 'Razorpay order creation failed' });
    return res.status(200).json({ key: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Unable to create payment order' });
  }
};
