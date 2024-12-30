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

export const PLANS: { BASIC: FreePlan; PLUS: PaidPlan; PROFFESSIONAL: PaidPlan } = {
  BASIC: {
    name: 'Basic',
    price: 0,
    features: ['1 user', '0.5 GB storage (1 MB per file)'],
  },
  PLUS: {
    name: 'Plus',
    price: {
      monthly: {
        amount: 4.99,
        priceId: 'price_1QCCl5JBPSgR8cUzOtdy8y1f',
      },
      yearly: {
        amount: 49.99,
        priceId: 'price_1QCvcaJBPSgR8cUzxgy6Htuo',
      }
    },
    features: [
      'All Basic features',
      '2 GB storage (1 MB per file)',
      'Version History',
      'Collaboration',
      'Knowledge-graph'
    ],
  },
  PROFFESSIONAL: {
    name: 'Pro',
    price: {
      monthly: {
        amount: 9.99,
        priceId: 'price_1QCCl5JBPSgR8cUzOtdy8y1f',
      },
      yearly: {
        amount: 99.99,
        priceId: 'price_1QCvcaJBPSgR8cUzxgy6Htuo',
      }
    },
    features: [
      'All Plus features',
      '10 GB storage (5 MB per file)',
      'Advanced search (OCR, handwriting, etc.)',
      'Publishing',
    ],
  },
};
