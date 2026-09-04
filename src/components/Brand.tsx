export function Symbol({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 16H43L13 48H48"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinejoin="bevel"
      />
      <path d="m53 5 5 5-5 5-5-5Z" fill="currentColor" />
    </svg>
  );
}

export function Brand() {
  return (
    <img
      className="brand"
      src={`${import.meta.env.BASE_URL}brand/zuaros-logo-light.svg`}
      alt="Zuaros"
      width="178"
      height="40"
    />
  );
}

export function Arrow({
  diagonal = false,
  className = "",
}: {
  diagonal?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} />
    </svg>
  );
}

export function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    code: "m11 9-6 7 6 7m10-14 6 7-6 7M18 5l-4 22",
    pulse: "M2 17h6l4-10 7 19 4-12h7",
    nodes: "M7 7h18v18H7ZM7 7l18 18M25 7 7 25M16 3v6M16 23v6M3 16h6m14 0h6",
    game: "M12 11h8m-13 0h-1l-3 13 4 2 5-5h8l5 5 4-2-3-13h-1M8 16h6m-3-3v6m12-4v2m-3 1v2",
  };
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.code} />
    </svg>
  );
}
