// api/verify.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({ error: 'Missing required orderId parameter' });
        }

        const clientId = process.env.CASHFREE_CLIENT_ID;
        const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return res.status(500).json({ 
                error: 'Cashfree API Credentials are missing in Vercel environment variables.' 
            });
        }

        const isSandbox = clientId.toLowerCase().includes('test') || clientSecret.toLowerCase().includes('test');
        const baseUrl = isSandbox 
            ? 'https://sandbox.cashfree.com/pg' 
            : 'https://api.cashfree.com/pg';

        const cashfreeResponse = await fetch(`${baseUrl}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': clientId,
                'x-client-secret': clientSecret
            }
        });

        const data = await cashfreeResponse.json();

        if (!cashfreeResponse.ok) {
            console.error('Cashfree PG check order failed:', data);
            return res.status(cashfreeResponse.status).json({ 
                error: data.message || 'Failed to check order status from Cashfree.' 
            });
        }

        return res.status(200).json({
            orderId: data.order_id,
            amount: data.order_amount,
            orderStatus: data.order_status, // 'PAID', 'ACTIVE', 'FAILED'
            paymentMethod: data.payment_session_id ? 'Cashfree Web' : 'None',
            transactionId: data.cf_order_id ? `CF_${data.cf_order_id}` : 'None'
        });

    } catch (err) {
        console.error('Vercel verification API crash:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
