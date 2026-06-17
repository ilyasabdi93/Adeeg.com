const stripe = require('stripe')('sk_test_51TjRhXLbf9NDFZBsB0l9LODknUOowF237es2m09Vz5sonYUStjpM7Ik32WBjU7UezwBOyDnO7zZZZbSwmIjos4OZ00g48ww4VK');

export default async function handler(req, res) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Portfolio CV - PDF',
          },
          unit_amount: 500,
        },
        quantity: 1,
      },
    ],
    success_url: `${req.headers.origin}/?success=true`,
    cancel_url: `${req.headers.origin}/`,
  });

  res.json({ sessionId: session.id });
}
