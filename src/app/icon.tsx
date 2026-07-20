import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M8 9h16"
            stroke="#f5f5f5"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          <path
            d="M16 9v15"
            stroke="#f5f5f5"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          <circle cx="8" cy="9" r="2.35" fill="#f5f5f5" />
          <circle cx="16" cy="9" r="2.35" fill="#2dd4bf" />
          <circle cx="24" cy="9" r="2.35" fill="#f5f5f5" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
