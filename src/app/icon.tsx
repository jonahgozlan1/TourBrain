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
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path
            d="M10.5 7.5c-.6 0-1 .4-1 1v15c0 .8.9 1.3 1.6.8l12.5-7.5c.6-.4.6-1.2 0-1.6l-12.5-7.7c-.3-.2-.7-.3-1.1-.3Z"
            fill="#2dd4bf"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
