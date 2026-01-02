// Minimal Express server example to create Stripe Checkout sessions.
// Usage:
// 1. npm install express stripe cors
// 2. Set env var STRIPE_SECRET_KEY to your Stripe test secret key
// 3. node serverless/stripe-checkout-server.js

const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4242;
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) console.warn('Warning: STRIPE_SECRET_KEY is not set. This server will not work until you provide it.');
const stripe = stripeKey ? Stripe(stripeKey) : null;

app.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe key not configured' });
    const { amount, currency = 'aud', invoiceId = 'INV-000' } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required (in cents)' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency, product_data: { name: `Invoice ${invoiceId}` }, unit_amount: amount }, quantity: 1 }],
      success_url: `${req.headers.origin || 'http://localhost:8000'}/Parris%20Tech%20Services/index.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:8000'}/Parris%20Tech%20Services/index.html?payment=cancelled`,
      metadata: { invoiceId }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create session' });
  }
});

app.listen(PORT, () => console.log(`Stripe checkout example server listening on ${PORT}`));
