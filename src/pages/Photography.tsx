import React from "react"
import FlickrLightBox from "../components/FlickrLightbox"

const Photography = () => (
  <div className="photography-page" style={{ maxWidth: "1280px", margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
    <div style={{ textAlign: "center", marginBottom: "2.5rem", padding: "1.5rem 1rem 0" }}>
      <div 
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.8rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#c7d8be",
          background: "rgba(30, 48, 35, 0.6)",
          border: "1px solid rgba(138, 171, 133, 0.25)",
          padding: "0.35rem 0.95rem",
          borderRadius: "9999px",
          marginBottom: "1.25rem",
          fontWeight: 600,
        }}
      >
        <span aria-hidden="true">📷</span>
        <span>Visual Journal & Field Light</span>
      </div>
      <h1 
        style={{
          fontFamily: "var(--font-display, 'Cinzel', serif)",
          fontSize: "2.75rem",
          margin: "0 0 1rem",
          background: "linear-gradient(135deg, #f7eed7 0%, #e0aa53 50%, #8db888 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        Wilderness & Nature Photography
      </h1>

      <blockquote 
        style={{
          fontFamily: "var(--font-serif, 'Lora', Georgia, serif)",
          fontSize: "1.12rem",
          fontStyle: "italic",
          color: "#f0ece1",
          maxWidth: "700px",
          margin: "0 auto 1.5rem",
          padding: "1.4rem 1.75rem",
          background: "rgba(24, 38, 28, 0.85)",
          borderLeft: "4px solid #d49a46",
          borderRadius: "8px",
          borderTop: "1px solid rgba(138, 171, 133, 0.18)",
          borderRight: "1px solid rgba(138, 171, 133, 0.18)",
          borderBottom: "1px solid rgba(138, 171, 133, 0.18)",
          boxShadow: "0 8px 24px rgba(4, 9, 6, 0.35)",
          lineHeight: 1.65,
        }}
      >
        "Logic will get you from A to Z; imagination will get you everywhere."
        <cite 
          style={{ 
            display: "block", 
            marginTop: "0.5rem", 
            fontFamily: "var(--font-sans)", 
            fontSize: "0.88rem", 
            color: "#e0aa53", 
            fontStyle: "normal",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          — Albert Einstein
        </cite>
      </blockquote>

      <div 
        style={{ 
          fontSize: "0.85rem", 
          color: "#9ebd9b", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "0.4rem",
          fontFamily: "var(--font-sans)",
          background: "rgba(22, 35, 26, 0.6)",
          padding: "0.3rem 0.85rem",
          borderRadius: "6px",
          border: "1px solid rgba(138, 171, 133, 0.16)",
        }}
      >
        <span aria-hidden="true">🔍</span> Tap or click any image to view in high-resolution field lightbox
      </div>
    </div>

    <div 
      style={{
        background: "rgba(18, 29, 21, 0.6)",
        border: "1px solid rgba(138, 171, 133, 0.18)",
        borderRadius: "16px",
        padding: "1.75rem",
        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 8px 30px rgba(5, 10, 7, 0.35)",
        backdropFilter: "blur(8px)",
      }}
    >
      <FlickrLightBox
        api_key={import.meta.env.VITE_FLICKR_API_KEY || "f9f0e2a4521bcd27d66dc1a26760b665"}
        user_id="181987773@N05"
        album_id="72157709095461753"
        initialBatchSize={30}
        batchSize={15}
      />
    </div>
  </div>
)

export default Photography