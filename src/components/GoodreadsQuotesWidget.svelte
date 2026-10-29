<script lang="ts">
  import { onMount } from "svelte";

  let widgetRef: HTMLDivElement | null = $state(null);

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://www.goodreads.com/quotes/widget/43072653-bryce-graham?v=2";
    script.type = "text/javascript";
    script.async = true;

    if (widgetRef) {
      widgetRef.appendChild(script);
    }

    return () => {
      if (widgetRef) {
        widgetRef.innerHTML = "";
      }
    };
  });
</script>

<div style="padding: 0.5rem; color: #f7eed7;">
  <div id="gr_quote_body" bind:this={widgetRef} style="color: #f7eed7; line-height: 1.7;"></div>
  <div style="text-align: right; margin-top: 0.75rem;">
    <a
      href="https://www.goodreads.com/quotes"
      style="color: #d49a46; text-decoration: none; font-size: 11px; letter-spacing: 0.04em; font-family: var(--font-sans);"
      rel="nofollow noopener noreferrer"
      target="_blank"
    >
      Goodreads Quotes Archive ↗
    </a>
  </div>
</div>
