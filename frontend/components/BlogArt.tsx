import type { ArtKey } from "@/lib/blog";

/**
 * Decorative, per-category SVG motif used behind blog cards and post heroes. Purely
 * presentational (aria-hidden); the gradient background is set in CSS via the
 * `blog-visual--{art}` class so each category reads as visually distinct.
 */
export default function BlogArt({ art }: { art: ArtKey }) {
  const common = {
    viewBox: "0 0 400 250",
    preserveAspectRatio: "xMidYMid slice" as const,
    className: "blog-art",
    "aria-hidden": true as const,
  };

  if (art === "staffing") {
    // Connected people / team nodes.
    return (
      <svg {...common}>
        <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none">
          <line x1="120" y1="90" x2="200" y2="150" />
          <line x1="280" y1="90" x2="200" y2="150" />
          <line x1="120" y1="90" x2="280" y2="90" />
          <line x1="120" y1="90" x2="90" y2="180" />
          <line x1="280" y1="90" x2="310" y2="180" />
          <line x1="200" y1="150" x2="90" y2="180" />
          <line x1="200" y1="150" x2="310" y2="180" />
        </g>
        <g fill="rgba(255,255,255,0.92)">
          {[
            [120, 90],
            [280, 90],
            [90, 180],
            [310, 180],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy - 6} r="7" />
              <path d={`M${cx - 11} ${cy + 14} a11 11 0 0 1 22 0 Z`} />
            </g>
          ))}
          <circle className="blog-art-pulse" cx="200" cy="150" r="9" />
        </g>
      </svg>
    );
  }

  if (art === "genai") {
    // Spark / generative bloom.
    return (
      <svg {...common}>
        <g className="blog-art-rays" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round">
          <line x1="200" y1="70" x2="200" y2="110" />
          <line x1="200" y1="140" x2="200" y2="180" />
          <line x1="130" y1="125" x2="170" y2="125" />
          <line x1="230" y1="125" x2="270" y2="125" />
          <line x1="155" y1="80" x2="180" y2="105" />
          <line x1="220" y1="145" x2="245" y2="170" />
          <line x1="245" y1="80" x2="220" y2="105" />
          <line x1="180" y1="145" x2="155" y2="170" />
        </g>
        <path className="blog-art-pulse" d="M200 100 L218 125 L200 150 L182 125 Z" fill="rgba(255,255,255,0.95)" />
      </svg>
    );
  }

  if (art === "cloud") {
    // Cloud + server racks + flow.
    return (
      <svg {...common}>
        <path
          d="M130 105 a28 28 0 0 1 55 -7 a24 24 0 0 1 52 7 a20 20 0 0 1 12 33 H120 a22 22 0 0 1 10 -33 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.4"
        />
        <g fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.45)" strokeWidth="1">
          <rect x="135" y="168" width="55" height="15" rx="2" />
          <rect x="210" y="168" width="55" height="15" rx="2" />
          <rect x="135" y="190" width="55" height="15" rx="2" />
          <rect x="210" y="190" width="55" height="15" rx="2" />
        </g>
        <g className="blog-art-dash" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3" strokeDasharray="4 4" fill="none">
          <line x1="200" y1="140" x2="162" y2="168" />
          <line x1="200" y1="140" x2="238" y2="168" />
        </g>
      </svg>
    );
  }

  // industry — bars / signal over a baseline.
  return (
    <svg {...common}>
      <line x1="60" y1="200" x2="340" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <g fill="rgba(255,255,255,0.28)">
        <rect x="80" y="150" width="34" height="50" rx="3" />
        <rect x="130" y="120" width="34" height="80" rx="3" />
        <rect x="180" y="95" width="34" height="105" rx="3" />
        <rect x="230" y="130" width="34" height="70" rx="3" />
        <rect x="280" y="80" width="34" height="120" rx="3" />
      </g>
      <path
        className="blog-art-trend"
        d="M97 165 L147 135 L197 108 L247 142 L297 92"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#fff">
        {[
          [97, 165],
          [147, 135],
          [197, 108],
          [247, 142],
          [297, 92],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />
        ))}
      </g>
    </svg>
  );
}
