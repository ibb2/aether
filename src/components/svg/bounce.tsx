import * as React from 'react'
const Bounce = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" {...props}>
        <path fill="#1a1d25" d="M0 0h200v200H0z" />
        <defs>
            <linearGradient id="e" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#b8bdc8" />
                <stop offset="50%" stopColor="#d0d3da" />
                <stop offset="100%" stopColor="#a8adb8" />
            </linearGradient>
            <linearGradient id="f" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#969ba8" />
                <stop offset="100%" stopColor="#abaeb8" />
            </linearGradient>
            <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#85899a" />
                <stop offset="100%" stopColor="#9a9ea8" />
            </linearGradient>
            <linearGradient id="a" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#363a45" />
                <stop offset="100%" stopColor="#2a2d38" />
            </linearGradient>
            <linearGradient id="b" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#2a2e38" />
                <stop offset="100%" stopColor="#323640" />
            </linearGradient>
            <linearGradient id="c" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#232730" />
                <stop offset="100%" stopColor="#2a2e38" />
            </linearGradient>
            <filter id="d" width="140%" height="140%" x="-20%" y="-20%">
                <feGaussianBlur in="SourceAlpha" stdDeviation={1} />
                <feOffset dy={1} result="offsetblur" />
                <feComponentTransfer>
                    <feFuncA slope={0.2} type="linear" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g>
            <animateTransform
                additive="sum"
                attributeName="transform"
                calcMode="spline"
                dur="2s"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                repeatCount="indefinite"
                type="translate"
                values="0,0; 0,-4; 0,0"
            />
            <g opacity={0.6}>
                <path fill="url(#a)" d="m100 120-30-15 30-15 30 15Z" />
                <path fill="url(#b)" d="m100 120-30-15v15l30 15Z" />
                <path fill="url(#c)" d="M100 120v15l30-15v-15Z" />
                <circle cx={70} cy={105} r={4} fill="url(#b)" />
                <circle cx={130} cy={105} r={4} fill="url(#c)" />
                <circle cx={100} cy={90} r={4} fill="url(#a)" />
                <circle cx={100} cy={135} r={4} fill="url(#b)" />
                <circle cx={70} cy={120} r={4} fill="url(#b)" />
                <circle cx={130} cy={120} r={4} fill="url(#c)" />
                <animate
                    attributeName="opacity"
                    calcMode="spline"
                    dur="2s"
                    keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                    repeatCount="indefinite"
                    values="0.6;0.4;0.6"
                />
            </g>
            <g filter="url(#d)">
                <path fill="url(#e)" d="M100 80 70 65l30-15 30 15Z" />
                <path fill="url(#f)" d="M100 80 70 65v15l30 15Z" />
                <path fill="url(#g)" d="M100 80v15l30-15V65Z" />
                <circle cx={70} cy={65} r={4} fill="url(#f)" />
                <circle cx={130} cy={65} r={4} fill="url(#g)" />
                <circle cx={100} cy={50} r={4} fill="url(#e)" />
                <circle cx={100} cy={95} r={4} fill="url(#f)" />
                <circle cx={70} cy={80} r={4} fill="url(#f)" />
                <circle cx={130} cy={80} r={4} fill="url(#g)" />
            </g>
            <path
                fill="none"
                stroke="#fff"
                strokeWidth={0.5}
                d="M85 58q15 7 30 0"
                opacity={0.2}
            />
        </g>
    </svg>
)
export default Bounce
