const PapersIcon = ({
  height,
  width,
  className = "",
}: {
  height?: number | string;
  width?: number | string;
  className?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || "25"}
      height={height || "30"}
      viewBox="0 0 25 30"
      className={className}
      fill="none"
    >
      <rect
        x="0.85"
        y="4.43359"
        width="19.3"
        height="24.3"
        rx="1.65"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <path
        d="M4.5 4.58359V3.08359C4.5 1.97902 5.39543 1.08359 6.5 1.08359H22.5C23.6046 1.08359 24.5 1.97902 24.5 3.08359V24.0836C24.5 25.1882 23.6046 26.0836 22.5 26.0836H20"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <line
        x1="2.5"
        y1="7.98359"
        x2="18.5"
        y2="7.98359"
        stroke="currentColor"
        strokeWidth="0.2"
      />
      <path
        d="M2.5 7.98349H18.5"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 9.98349H8.5"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 10.9835H10.5"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 11.9835H6.5"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 12.9835H12.5"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 13.9835L14.5 14.0836"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 15.0836H11.5"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 16.1837L13.5 16.0836"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 17.1837L9.5 17.0836"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.50012 18.1837L11.5 18.0836"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.5 19.1891L10.5 19.0836"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.47998 21.2018L7.5 21.0836"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.45898 22.1476H9.50062"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.42981 23.1529H11.5005"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.39172 24.1573H11.5006"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
      <path
        d="M2.34564 25.2408L12.3454 25.3118"
        stroke="currentColor"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default PapersIcon;
