interface PriceConfig {
  amount: number;
  priceId: string;
}

interface BasePlan {
  name: string;
  features: string[];
}

interface FreePlan extends BasePlan {
  price: 0;
}

interface PaidPlan extends BasePlan {
  price: {
    monthly: PriceConfig;
    yearly: PriceConfig;
  };
}

type Plan = FreePlan | PaidPlan;

export const PLANS: { FREE: FreePlan; BASIC: PaidPlan } = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['1 user', 'Basic features', 'Community support'],
  },
  BASIC: {
    name: 'Basic',
    price: {
      monthly: {
        amount: 15,
        priceId: 'price_1QCCl5JBPSgR8cUzOtdy8y1f',
      },
      yearly: {
        amount: 150,
        priceId: 'price_1QCvcaJBPSgR8cUzxgy6Htuo',
      }
    },
    features: [
      'All Free features',
      'Priority support',
      'Advanced analytics',
      'Custom solutions'
    ],
  },
};
