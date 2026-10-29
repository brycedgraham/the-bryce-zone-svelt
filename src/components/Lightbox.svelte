<script lang="ts">
  import { onMount } from "svelte";

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

  function prevSlide() {
    if (index > 0) {
      index -= 1;
      isZoomed = false;
    } else {
      index = slides.length - 1;
      isZoomed = false;
    }
  }

  function nextSlide() {
    if (index < slides.length - 1) {
      index += 1;
      isZoomed = false;
    } else {
      index = 0;
      isZoomed = false;
    }
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
</script>

<svelte:window onkeydown={handleKeydown} />

{#if index >= 0 && slides[index]}
  <div
    class="svelte-lightbox-overlay"
    onclick={onclose}
    role="dialog"
    aria-modal="true"
    aria-label="High-resolution image lightbox"
  >
    <!-- Top Bar Controls -->
    <div class="lightbox-top-bar" onclick={(e) => e.stopPropagation()}>
      <div class="lightbox-counter">
        <span>{index + 1}</span> / <span>{slides.length}</span>
      </div>

      <div class="lightbox-actions">
        <button
          class="lightbox-btn"
          onclick={() => (isZoomed = !isZoomed)}
          title={isZoomed ? "Zoom Out" : "Zoom In"}
          aria-label="Toggle zoom"
        >
          {isZoomed ? "−" : "+"}
        </button>
        <button
          class="lightbox-btn close-btn"
          onclick={onclose}
          title="Close Lightbox (Esc)"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Main Viewport Area -->
    <div
      class="lightbox-stage"
      onclick={(e) => e.stopPropagation()}
      ontouchstart={handleTouchStart}
      ontouchend={handleTouchEnd}
    >
      <!-- Navigation Prev -->
      <button
        class="lightbox-nav-btn prev"
        onclick={prevSlide}
        aria-label="Previous photograph"
        title="Previous"
      >
        ‹
      </button>

      <!-- Center Image -->
      <div class="lightbox-image-wrap" class:zoomed={isZoomed}>
        <img
          src={slides[index].src}
          alt={slides[index].alt || "Wilderness photograph"}
          class="lightbox-main-img"
          onclick={() => (isZoomed = !isZoomed)}
          loading="eager"
        />
        {#if slides[index].title}
          <div class="lightbox-caption">
            <p>{slides[index].title}</p>
          </div>
        {/if}
      </div>

      <!-- Navigation Next -->
      <button
        class="lightbox-nav-btn next"
        onclick={nextSlide}
        aria-label="Next photograph"
        title="Next"
      >
        ›
      </button>
    </div>

    <!-- Bottom Thumbnail Strip -->
    <div
      class="lightbox-thumbnails"
      onclick={(e) => e.stopPropagation()}
      role="region"
      aria-label="Photo thumbnails"
    >
      {#each slides as slide, i}
        <button
          class="thumb-item"
          class:active={i === index}
          onclick={() => {
            index = i;
            isZoomed = false;
          }}
          aria-label={`Go to photo ${i + 1}`}
        >
          <img src={slide.src} alt={slide.title || `Thumbnail ${i + 1}`} loading="lazy" />
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .svelte-lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: rgba(9, 15, 11, 0.94);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lightbox-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: linear-gradient(to bottom, rgba(10, 16, 12, 0.85), transparent);
    z-index: 10;
  }

  .lightbox-counter {
    color: #c7d8be;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
  }

  .lightbox-actions {
    display: flex;
    gap: 0.75rem;
  }

  .lightbox-btn {
    background: rgba(26, 42, 31, 0.8);
    border: 1px solid rgba(138, 171, 133, 0.3);
    color: #f7eed7;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lightbox-btn:hover {
    background: #d49a46;
    color: #101c13;
    border-color: #d49a46;
  }

  .lightbox-stage {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    overflow: hidden;
  }

  .lightbox-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(20, 34, 25, 0.7);
    color: #f0ece1;
    border: 1px solid rgba(138, 171, 133, 0.25);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 2.25rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
  }

  .lightbox-nav-btn:hover {
    background: #d49a46;
    color: #0e1711;
    border-color: #d49a46;
  }

  .lightbox-nav-btn.prev {
    left: 1.5rem;
  }

  .lightbox-nav-btn.next {
    right: 1.5rem;
  }

  .lightbox-image-wrap {
    max-width: 90vw;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lightbox-image-wrap.zoomed {
    transform: scale(1.4);
    cursor: zoom-out;
  }

  .lightbox-main-img {
    max-width: 100%;
    max-height: 68vh;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
    cursor: zoom-in;
    user-select: none;
  }

  .lightbox-caption {
    margin-top: 0.75rem;
    background: rgba(18, 30, 22, 0.85);
    padding: 0.4rem 1rem;
    border-radius: 6px;
    border: 1px solid rgba(138, 171, 133, 0.2);
    color: #e5dfcf;
    font-size: 0.88rem;
    font-family: var(--font-sans);
    text-align: center;
    max-width: 600px;
  }

  .lightbox-thumbnails {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: linear-gradient(to top, rgba(10, 16, 12, 0.9), transparent);
    overflow-x: auto;
    justify-content: center;
    scrollbar-width: thin;
    scrollbar-color: #2b4231 transparent;
  }

  .thumb-item {
    background: transparent;
    border: 2px solid transparent;
    border-radius: 6px;
    padding: 0;
    cursor: pointer;
    width: 64px;
    height: 48px;
    overflow: hidden;
    flex-shrink: 0;
    opacity: 0.55;
    transition: all 0.2s ease;
  }

  .thumb-item:hover {
    opacity: 0.85;
  }

  .thumb-item.active {
    opacity: 1;
    border-color: #d49a46;
    box-shadow: 0 0 8px rgba(212, 154, 70, 0.4);
  }

  .thumb-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .lightbox-nav-btn {
      width: 40px;
      height: 40px;
      font-size: 1.75rem;
    }
    .lightbox-nav-btn.prev {
      left: 0.5rem;
    }
    .lightbox-nav-btn.next {
      right: 0.5rem;
    }
    .lightbox-thumbnails {
      justify-content: flex-start;
      padding: 0.75rem 1rem;
    }
    .thumb-item {
      width: 52px;
      height: 40px;
    }
  }
</style>
