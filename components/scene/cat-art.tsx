export function CatArt({
  body = "#e7a65a",
  belly = "#fff1d1",
  sleeping = false,
}: {
  body?: string;
  belly?: string;
  sleeping?: boolean;
}) {
  return (
    <svg viewBox="0 0 160 160" aria-hidden="true" className="cat-art">
      <ellipse cx="80" cy="147" rx="51" ry="10" fill="#254a5526" />
      <g
        className="cat-breathe"
        stroke="#424259"
        strokeWidth="3.5"
        strokeLinejoin="round"
      >
        <path
          className="cat-tail"
          d="M119 126q37 2 26-32-5-13-11-9-5 3 1 15 6 18-21 12"
          fill={body}
        />
        <ellipse cx="81" cy="112" rx="39" ry="34" fill={body} />
        <ellipse cx="79" cy="116" rx="23" ry="24" fill={belly} stroke="none" />
        <path d="M46 54 36 10q19 1 35 24M91 34q15-24 33-24l-6 48" fill={body} />
        <path
          d="m47 36-4-15 17 17m41 1 15-17-4 17"
          fill="#ee9ba0"
          stroke="none"
        />
        <path
          d="M125 68c0 29-20 38-45 38S33 92 33 67s18-37 46-37 46 13 46 38Z"
          fill={body}
        />
        <path d="m72 32 3 15m8-15 0 13m9-13-3 15" stroke="#be784c" />
        <ellipse cx="81" cy="85" rx="24" ry="15" fill={belly} stroke="none" />
        <g className="cat-eyes" stroke="#35364b" fill="#35364b">
          {sleeping ? (
            <path d="m49 69 9 3 8-4m30 0 8 4 9-3" fill="none" />
          ) : (
            <>
              <ellipse cx="57" cy="68" rx="5" ry="8" />
              <ellipse cx="103" cy="68" rx="5" ry="8" />
              <circle cx="59" cy="65" r="1.8" fill="white" stroke="none" />
              <circle cx="105" cy="65" r="1.8" fill="white" stroke="none" />
            </>
          )}
        </g>
        <path d="m76 80 10 0-5 6Z" fill="#db7b86" stroke="none" />
        <path d="M81 85v5m-8 0q4 6 8 0 4 6 8 0" fill="none" strokeWidth="2" />
        <path
          d="m43 82-20-3m20 10-19 5m94-12 19-3m-20 10 19 5"
          strokeWidth="2"
        />
        <ellipse cx="59" cy="139" rx="16" ry="10" fill={body} />
        <ellipse cx="99" cy="139" rx="16" ry="10" fill={body} />
      </g>
    </svg>
  );
}
