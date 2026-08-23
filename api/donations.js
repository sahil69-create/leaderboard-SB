module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'Donation storage is not configured yet' });

  try {
    const table = process.env.SUPABASE_DONATIONS_TABLE || 'donations';
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?select=donor_name,amount,paid_at,source_website&order=amount.desc,paid_at.desc`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
    });
    if (!response.ok) return res.status(502).json({ error: 'Unable to load donations' });
    const rows = await response.json();
    return res.status(200).json(rows.map((row, index) => ({
      id: index + 1,
      name: row.donor_name,
      location: 'Verified donor',
      amount: Number(row.amount),
      title: index === 0 ? 'King of Sharm' : '',
      paidAt: row.paid_at,
      sourceWebsite: row.source_website
    })));
  } catch (error) {
    console.error('Donation list error:', error);
    return res.status(500).json({ error: 'Unable to load donations' });
  }
};
