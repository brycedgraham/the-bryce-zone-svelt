import React, { useEffect, useRef } from "react"

const GoodreadsQuotesWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://www.goodreads.com/quotes/widget/43072653-bryce-graham?v=2"
    script.type = "text/javascript"
    script.async = true

    if (widgetRef.current) {
      widgetRef.current.appendChild(script)
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.innerHTML = "" // Clean up on unmount
      }
    }
  }, [])

  return (
    <div
      style={{
        padding: "0.5rem",
        color: "#f7eed7",
      }}
    >
      <div 
        id="gr_quote_body" 
        ref={widgetRef}
        style={{
          color: "#f7eed7",
          lineHeight: 1.7,
        }}
      ></div>
      <div style={{ textAlign: "right", marginTop: "0.75rem" }}>
        <a
          href="https://www.goodreads.com/quotes"
          style={{
            color: "#d49a46",
            textDecoration: "none",
            fontSize: "11px",
            letterSpacing: "0.04em",
            fontFamily: "var(--font-sans)",
          }}
          rel="nofollow"
          target="_blank"
        >
          Goodreads Quotes Archive ↗
        </a>
      </div>
    </div>
  )
}

export default GoodreadsQuotesWidget