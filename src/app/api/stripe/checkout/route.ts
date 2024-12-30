import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { users } from '@/db/drizzle/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { priceId, isYearly } = await req.json();
    const session = await auth();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get or create stripe customer
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, user.id));
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        isYearly: isYearly ? 'true' : 'false',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
