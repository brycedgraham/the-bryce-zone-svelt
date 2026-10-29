<script lang="ts">
  import "./Book.css";

  interface Props {
    path: string;
    title: string;
    quote: string;
    goodreads?: string;
  }

  let { path, title, quote, goodreads }: Props = $props();

  let isHovered = $state(false);
  let showQuote = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && showQuote) {
      showQuote = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="book-container">
  <div
    class="book-card"
    class:hovered={isHovered}
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    onclick={() => (showQuote = !showQuote)}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showQuote = !showQuote;
      }
    }}
    role="button"
    tabindex="0"
    aria-label={`View quote from ${title}`}
  >
    <div class="book-cover">
      <img src={path} alt={title} loading="lazy" />
      <div class="book-overlay">
        <div class="book-title">{title}</div>
        <div class="book-hint">Click for quote</div>
      </div>
    </div>
  </div>

  {#if showQuote}
    <div
      class="quote-modal"
      onclick={() => (showQuote = false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        class="quote-content"
        onclick={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          class="quote-close"
          onclick={() => (showQuote = false)}
          aria-label="Close quote"
        >
          ×
        </button>
        <h3 id="modal-title">{title}</h3>
        <blockquote>{quote}</blockquote>
      </div>
    </div>
  {/if}

  {#if goodreads}
    <a href={goodreads} target="_blank" rel="noopener noreferrer">
      View on Goodreads
    </a>
  {/if}
</div>
