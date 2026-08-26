// api/checkout.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { orderId, amount, customerId, customerName, customerEmail, customerPhone } = req.body;

        if (!orderId || !amount || !customerId || !customerPhone) {
            return res.status(400).json({ error: 'Missing required order details' });
        }

        const clientId = process.env.CASHFREE_CLIENT_ID;
        const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return res.status(500).json({ 
                error: 'Cashfree API Credentials are missing in Vercel. Set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET environment variables.' 
            });
        }

        // Sandbox check: if credentials begin with TEST or sandbox keywords, target sandbox
        const isSandbox = clientId.toLowerCase().includes('test') || clientSecret.toLowerCase().includes('test');
        const baseUrl = isSandbox 
            ? 'https://sandbox.cashfree.com/pg' 
            : 'https://api.cashfree.com/pg';

        const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10); // Format to 10 digits
        
        const payload = {
            order_id: orderId,
            order_amount: Number(amount),
            order_currency: 'INR',
            customer_details: {
                customer_id: customerId,
                customer_name: customerName ? customerName.slice(0, 100) : 'Guest Customer',
                customer_email: customerEmail || 'guest@gudiyamart.com',
                customer_phone: sanitizedPhone
            },
            order_meta: {
                return_url: `https://gudiyamart.vercel.app/?cf_order_id=${orderId}`
            }
        };

        const cashfreeResponse = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': clientId,
                'x-client-secret': clientSecret
            },
            body: JSON.stringify(payload)
        });

        const data = await cashfreeResponse.json();

        if (!cashfreeResponse.ok) {
            console.error('Cashfree PG Gateway error output:', data);
            return res.status(cashfreeResponse.status).json({ 
                error: data.message || 'Cashfree payment gateway order creation failed.' 
            });
        }

        return res.status(200).json({
            paymentSessionId: data.payment_session_id,
            orderId: data.order_id,
            mode: isSandbox ? 'sandbox' : 'production'
        });

    } catch (err) {
        console.error('Vercel serverless function crash:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
