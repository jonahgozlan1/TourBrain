import { ImageResponse } from "next/og";

export const alt =
  "Tourbase — messy tour docs become a clean show list.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#141414",
          color: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 650,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Tourbase
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 720,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.35,
            color: "#adadad",
          }}
        >
          Messy tour docs become a clean show list.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 22,
            color: "#2dd4bf",
          }}
        >
          Upload · Review · Ask
        </div>
      </div>
    ),
    { ...size },
  );
}
