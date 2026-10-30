<script lang="ts">
  export interface Slide {
    src: string;
    title?: string;
    alt?: string;
    width?: number;
    height?: number;
  }

  interface Props {
    slides: Slide[];
    index: number;
    onclose: () => void;
  }

  let { slides, index = $bindable(-1), onclose }: Props = $props();

  let isZoomed = $state(false);
  let touchStartX = $state(0);
  let touchEndX = $state(0);
  let thumbnailStrip = $state<HTMLDivElement | null>(null);

  // Portal action: moves lightbox to document.body so it attaches to the true window
  // immune to any parent CSS transform, filter, or backdrop-filter containing blocks.
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        document.body.style.overflow = originalOverflow;
      },
    };
  }

  function prevSlide() {
    if (index > 0) {
      index -= 1;
    } else {
      index = slides.length - 1;
    }
    isZoomed = false;
  }

  function nextSlide() {
    if (index < slides.length - 1) {
      index += 1;
    } else {
      index = 0;
    }
    isZoomed = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (index < 0) return;
    if (e.key === "Escape") {
      onclose();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      nextSlide();
    } else if (touchEndX - touchStartX > 50) {
      prevSlide();
    }
  }

  // Auto-scroll active thumbnail into view
  $effect(() => {
    if (index >= 0 && thumbnailStrip) {
      const activeThumb = thumbnailStrip.children[index] as HTMLElement | undefined;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if index >= 0 && slides[index]}
  <div
    use:portal
    class="svelte-lightbox-overlay"
    onclick={onclose}
    role="dialog"
    aria-modal="true"
    aria-label="High-resolution image lightbox"
  >
    <!-- Top Header Bar -->
    <div class="lightbox-header" onclick={(e) => e.stopPropagation()}>
      <div class="lightbox-meta">
        <span class="slide-count">
          <strong>{index + 1}</strong> <span class="sep">/</span> {slides.length}
        </span>
        {#if slides[index].title}
          <span class="slide-title-header">{slides[index].title}</span>
        {/if}
      </div>

      <div class="lightbox-toolbar">
        <button
          class="tool-btn"
          onclick={() => (isZoomed = !isZoomed)}
          title={isZoomed ? "Reset Zoom" : "Zoom Image"}
          aria-label="Toggle zoom"
        >
          {#if isZoomed}
            <span class="btn-icon">🔍−</span>
          {:else}
            <span class="btn-icon">🔍+</span>
          {/if}
        </button>
        <button
          class="tool-btn close-btn"
          onclick={onclose}
          title="Close Lightbox (Esc)"
          aria-label="Close lightbox"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Main Canvas / Image Stage -->
    <div
      class="lightbox-stage"
      ontouchstart={handleTouchStart}
      ontouchend={handleTouchEnd}
    >
      <!-- Left Prev Button -->
      <button
        class="nav-arrow nav-prev"
        onclick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous photograph"
        title="Previous (Left Arrow)"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Center Image Container -->
      <div
        class="image-frame"
        class:is-zoomed={isZoomed}
        onclick={(e) => {
          // If clicked on backdrop outside image, close
          if (e.target === e.currentTarget) {
            onclose();
          }
        }}
      >
        <img
          src={slides[index].src}
          alt={slides[index].alt || "Wilderness photograph"}
          class="lightbox-image"
          onclick={(e) => {
            e.stopPropagation();
            isZoomed = !isZoomed;
          }}
          loading="eager"
        />

        {#if slides[index].title}
          <div class="image-caption" onclick={(e) => e.stopPropagation()}>
            <p>{slides[index].title}</p>
          </div>
        {/if}
      </div>

      <!-- Right Next Button -->
      <button
        class="nav-arrow nav-next"
        onclick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next photograph"
        title="Next (Right Arrow)"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Bottom Thumbnail Carousel -->
    <div
      class="lightbox-footer"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="thumbnail-strip" bind:this={thumbnailStrip} role="region" aria-label="Photo thumbnails">
        {#each slides as slide, i}
          <button
            class="thumb-tile"
            class:is-active={i === index}
            onclick={() => {
              index = i;
              isZoomed = false;
            }}
            aria-label={`View photo ${i + 1}`}
          >
            <img src={slide.src} alt={slide.title || `Thumbnail ${i + 1}`} loading="lazy" />
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .svelte-lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    background-color: rgba(5, 9, 6, 0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    animation: lightboxFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    overflow: hidden;
  }

  @keyframes lightboxFadeIn {
    from {
      opacity: 0;
      transform: scale(0.985);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Header Bar */
  .lightbox-header {
    height: 60px;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(180deg, rgba(6, 10, 7, 0.92) 0%, rgba(6, 10, 7, 0.3) 80%, transparent 100%);
    z-index: 20;
    flex-shrink: 0;
  }

  .lightbox-meta {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    color: #e5dfcf;
    font-family: var(--font-sans);
    font-size: 0.92rem;
  }

  .slide-count {
    color: #d49a46;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .slide-count .sep {
    color: #8fa08e;
    margin: 0 2px;
  }

  .slide-title-header {
    color: #c7d8be;
    font-size: 0.88rem;
    max-width: 450px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lightbox-toolbar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .tool-btn {
    background: rgba(22, 36, 26, 0.85);
    border: 1px solid rgba(138, 171, 133, 0.25);
    color: #f7eed7;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 1.15rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tool-btn:hover {
    background: #d49a46;
    color: #0e1711;
    border-color: #d49a46;
    transform: translateY(-1px);
  }

  .tool-btn.close-btn {
    font-size: 1.2rem;
  }

  /* Stage Viewport */
  .lightbox-stage {
    position: relative;
    flex: 1;
    width: 100%;
    height: calc(100vh - 150px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .image-frame {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    cursor: default;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lightbox-image {
    max-width: 92vw;
    max-height: calc(100vh - 170px);
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85);
    cursor: zoom-in;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .image-frame.is-zoomed .lightbox-image {
    transform: scale(1.45);
    cursor: zoom-out;
    max-height: none;
    max-width: none;
  }

  .image-caption {
    margin-top: 0.75rem;
    background: rgba(14, 24, 17, 0.88);
    border: 1px solid rgba(138, 171, 133, 0.25);
    border-radius: 6px;
    padding: 0.35rem 1rem;
    color: #f7eed7;
    font-family: var(--font-serif, "Lora", Georgia, serif);
    font-size: 0.9rem;
    text-align: center;
    max-width: 700px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .image-caption p {
    margin: 0;
  }

  /* Nav Arrows */
  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(18, 30, 22, 0.75);
    color: #f7eed7;
    border: 1px solid rgba(138, 171, 133, 0.25);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 30;
    transition: all 0.2s ease;
    padding: 0;
  }

  .nav-arrow:hover {
    background: #d49a46;
    color: #0e1711;
    border-color: #d49a46;
    transform: translateY(-50%) scale(1.08);
  }

  .nav-arrow.nav-prev {
    left: 1.5rem;
  }

  .nav-arrow.nav-next {
    right: 1.5rem;
  }

  /* Footer & Thumbnail Strip */
  .lightbox-footer {
    height: 80px;
    background: linear-gradient(0deg, rgba(6, 10, 7, 0.95) 0%, rgba(6, 10, 7, 0.5) 80%, transparent 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
    z-index: 20;
  }

  .thumbnail-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    max-width: 90vw;
    padding: 4px;
    scrollbar-width: thin;
    scrollbar-color: #2b4231 transparent;
  }

  .thumb-tile {
    width: 60px;
    height: 44px;
    border-radius: 4px;
    border: 2px solid transparent;
    padding: 0;
    background: #111a13;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.5;
    transition: all 0.2s ease;
  }

  .thumb-tile:hover {
    opacity: 0.85;
  }

  .thumb-tile.is-active {
    opacity: 1;
    border-color: #d49a46;
    box-shadow: 0 0 10px rgba(212, 154, 70, 0.5);
    transform: scale(1.05);
  }

  .thumb-tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .lightbox-header {
      padding: 0 1rem;
      height: 52px;
    }
    .slide-title-header {
      display: none;
    }
    .nav-arrow {
      width: 42px;
      height: 42px;
    }
    .nav-arrow.nav-prev {
      left: 0.5rem;
    }
    .nav-arrow.nav-next {
      right: 0.5rem;
    }
    .lightbox-image {
      max-width: 96vw;
      max-height: calc(100vh - 150px);
    }
    .thumb-tile {
      width: 48px;
      height: 36px;
    }
  }
</style>
