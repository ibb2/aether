interface BasePlan {
    name: string
    features: string[]
    lookupKey: string
}

interface FreePlan extends BasePlan {
    price: 0
}

interface PaidPlan extends BasePlan {
    yearly: boolean
}

export type Plan = FreePlan | PaidPlan

export const PLANS: {
    BASIC: FreePlan
    PLUS: PaidPlan
    PLUS_YEARLY: PaidPlan
    PROFFESSIONAL: PaidPlan
    PROFFESSIONAL_YEARLY: PaidPlan
} = {
    BASIC: {
        name: 'Basic',
        price: 0,
        features: ['1 user', '0.5 GB storage (1 MB per file)'],
        lookupKey: '',
    },
    PLUS: {
        name: 'Plus',
        yearly: false,
        lookupKey: 'plus_monthly',
        features: [
            'All Basic features',
            '2 GB storage (1 MB per file)',
            'Version History',
            'Collaboration',
            'Knowledge-graph',
        ],
    },
    PLUS_YEARLY: {
        name: 'Plus',
        yearly: true,
        lookupKey: 'plus_yearly',
        features: [
            'All Basic features',
            '2 GB storage (1 MB per file)',
            'Version History',
            'Collaboration',
            'Knowledge-graph',
        ],
    },
    PROFFESSIONAL: {
        name: 'Pro',
        yearly: false,
        lookupKey: 'pro_monthly',
        features: [
            'All Plus features',
            '10 GB storage (5 MB per file)',
            'Advanced search (OCR, handwriting, etc.)',
            'Publishing',
        ],
    },
    PROFFESSIONAL_YEARLY: {
        name: 'Pro',
        yearly: true,
        lookupKey: 'pro_yearly',
        features: [
            'All Plus features',
            '10 GB storage (5 MB per file)',
            'Advanced search (OCR, handwriting, etc.)',
            'Publishing',
        ],
    },
}
