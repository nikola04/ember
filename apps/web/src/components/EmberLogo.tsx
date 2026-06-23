interface EmberLogoProps {
    size?: number;
    animate?: boolean;
}

export function EmberLogo({ size = 25, animate = true }: EmberLogoProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={animate ? 'animate-glow' : undefined} aria-hidden>
            <path
                d="M12 2.5c2.4 3 1.8 5.4 1 7 1-0.6 1.7-1.6 2-2.9 1.7 1.7 3 4 3 6.7a6 6 0 0 1-12 0c0-2.3 1.1-4 2.4-5.3.2 1.4.9 2.1 1.7 2.3-1.2-2.6-0.6-5.2 1.9-7.8Z"
                fill="#e35d3a"
            />
            <path
                d="M12 13c1.6 1.1 2.4 2.6 2.4 4.1a2.4 2.4 0 0 1-4.8.2c0-1 .5-1.9 1.3-2.6.1.8.5 1.2 1 1.3-.5-1.1-.3-2.2.1-3Z"
                fill="#fbd0bb"
            />
        </svg>
    );
}
