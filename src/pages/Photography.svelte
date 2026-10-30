<script lang="ts">
  import FlickrLightbox from "../components/FlickrLightbox.svelte";

  const apiKey = import.meta.env.VITE_FLICKR_API_KEY || "f9f0e2a4521bcd27d66dc1a26760b665";
</script>

<div class="photography-page">
  <div class="photo-header-wrap">
    <div class="photo-kicker">
      <span aria-hidden="true">📷</span>
      <span>Visual Journal & Field Light</span>
    </div>
    <h1 class="photo-title">
      Wilderness & Nature Photography
    </h1>

    <blockquote class="photo-quote">
      "Logic will get you from A to Z; imagination will get you everywhere."
      <cite>— Albert Einstein</cite>
    </blockquote>

    <div class="photo-hint-pill">
      <span aria-hidden="true">🔍</span> Tap or click any image to view in high-resolution field lightbox
    </div>

    <div class="expedition-callout-card">
      <div class="callout-content">
        <span class="callout-icon" aria-hidden="true">🐦</span>
        <div class="callout-text">
          <span class="callout-title">Interactive Field Minigame</span>
          <p class="callout-desc">Track and snap wild birds in the forest with a live telephoto viewfinder lens.</p>
        </div>
      </div>
      <a href="/BirdWatch" class="callout-btn">
        Start Bird Watch ➔
      </a>
    </div>
  </div>

  <div class="gallery-wrapper-card">
    <FlickrLightbox
      api_key={apiKey}
      user_id="181987773@N05"
      album_id="72157709095461753"
      initialBatchSize={30}
      batchSize={15}
    />
  </div>
</div>

<style>
  .photography-page {
    max-width: 1280px;
    margin: 0 auto;
    animation: fadeIn 0.4s ease;
  }

  .photo-header-wrap {
    text-align: center;
    margin-bottom: 2.5rem;
    padding: 1.5rem 1rem 0;
  }

  .photo-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-sans);
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c7d8be;
    background: rgba(30, 48, 35, 0.6);
    border: 1px solid rgba(138, 171, 133, 0.25);
    padding: 0.35rem 0.95rem;
    border-radius: 9999px;
    margin-bottom: 1.25rem;
    font-weight: 600;
  }

  .photo-title {
    font-family: var(--font-display, "Cinzel", serif);
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    margin: 0 0 1rem;
    background: linear-gradient(135deg, #f7eed7 0%, #e0aa53 50%, #8db888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .photo-quote {
    font-family: var(--font-serif, "Lora", Georgia, serif);
    font-size: 1.12rem;
    font-style: italic;
    color: #f0ece1;
    max-width: 700px;
    margin: 0 auto 1.5rem;
    padding: 1.4rem 1.75rem;
    background: rgba(24, 38, 28, 0.85);
    border-left: 4px solid #d49a46;
    border-radius: 8px;
    border-top: 1px solid rgba(138, 171, 133, 0.18);
    border-right: 1px solid rgba(138, 171, 133, 0.18);
    border-bottom: 1px solid rgba(138, 171, 133, 0.18);
    box-shadow: 0 8px 24px rgba(4, 9, 6, 0.35);
    line-height: 1.65;
    text-align: left;
  }

  .photo-quote cite {
    display: block;
    margin-top: 0.5rem;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    color: #e0aa53;
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .photo-hint-pill {
    font-size: 0.85rem;
    color: #9ebd9b;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-sans);
    background: rgba(22, 35, 26, 0.6);
    padding: 0.3rem 0.85rem;
    border-radius: 6px;
    border: 1px solid rgba(138, 171, 133, 0.16);
    margin-bottom: 1.25rem;
  }

  .expedition-callout-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    max-width: 680px;
    margin: 0 auto;
    background: rgba(20, 34, 25, 0.8);
    border: 1px solid rgba(212, 154, 70, 0.35);
    border-radius: 12px;
    padding: 0.85rem 1.25rem;
    text-align: left;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
  }

  .callout-content {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .callout-icon {
    font-size: 1.5rem;
    background: rgba(212, 154, 70, 0.15);
    padding: 0.4rem 0.55rem;
    border-radius: 8px;
    border: 1px solid rgba(212, 154, 70, 0.3);
  }

  .callout-title {
    display: block;
    font-family: var(--font-display, "Cinzel", serif);
    font-size: 0.95rem;
    font-weight: 700;
    color: #f7eed7;
    margin-bottom: 0.15rem;
  }

  .callout-desc {
    margin: 0;
    font-size: 0.82rem;
    color: #a3c4a2;
    line-height: 1.4;
  }

  .callout-btn {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    background: #d49a46;
    color: #0b140d;
    font-weight: 700;
    font-size: 0.82rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s ease, transform 0.15s ease;
  }

  .callout-btn:hover {
    background: #e5aa55;
    transform: translateY(-1px);
  }

  @media (max-width: 820px) {
    .expedition-callout-card {
      display: none !important;
    }
  }

  .gallery-wrapper-card {
    background: rgba(18, 29, 21, 0.6);
    border: 1px solid rgba(138, 171, 133, 0.18);
    border-radius: 16px;
    padding: 1.75rem;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 8px 30px rgba(5, 10, 7, 0.35);
    backdrop-filter: blur(8px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .gallery-wrapper-card {
      padding: 1rem;
    }
  }
</style>
