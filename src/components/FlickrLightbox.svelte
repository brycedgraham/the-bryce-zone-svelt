<script lang="ts">
  import { onMount } from "svelte";
  import Lightbox, { type Slide } from "./Lightbox.svelte";

  interface PhotoItem extends Slide {
    thumbnail: string;
    caption: string;
  }

  interface Props {
    api_key: string;
    user_id?: string;
    album_id?: string;
    limit?: number;
    searchTerm?: string;
    initialBatchSize?: number;
    batchSize?: number;
    className?: string;
  }

  let {
    api_key,
    user_id = "",
    album_id = "",
    limit,
    searchTerm = "",
    initialBatchSize = 30,
    batchSize = 15,
    className = "",
  }: Props = $props();

  let allImages = $state<PhotoItem[]>([]);
  let displayedCount = $state(initialBatchSize);
  let activeIndex = $state(-1);
  let loading = $state(true);
  let loadingMore = $state(false);
  let error = $state<string | null>(null);

  let loadMoreSentinel: HTMLDivElement | null = $state(null);
  let observer: IntersectionObserver | null = null;

  let displayedImages = $derived(allImages.slice(0, displayedCount));
  let hasMore = $derived(displayedCount < allImages.length);

  function generateApiUrl(): string {
    const extras = [
      "url_l",
      "url_m",
      "url_sq",
      "license",
      "date_upload",
      "date_taken",
      "icon_server",
      "original_format",
      "last_update",
      "geo",
      "tags",
      "machine_tags",
      "o_dims",
      "views",
      "media",
      "path_alias",
      "owner_name",
    ].join(",");

    const params = new URLSearchParams({
      method: user_id || album_id || searchTerm ? "flickr.photosets.getPhotos" : "flickr.photos.getRecent",
      format: "json",
      api_key: api_key || "",
      user_id: user_id || "",
      photoset_id: album_id || "",
      text: searchTerm || "",
      per_page: (limit || 500).toString(),
      nojsoncallback: "1",
      extras,
    });

    return `https://api.flickr.com/services/rest/?${params.toString()}`;
  }

  async function fetchPhotos() {
    try {
      loading = true;
      error = null;

      const res = await fetch(generateApiUrl());
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.photoset || !data.photoset.photo) {
        throw new Error(data.message || "No photoset found in response");
      }

      const photos: PhotoItem[] = data.photoset.photo
        .sort((a: any, b: any) => {
          return new Date(b.datetaken).getTime() - new Date(a.datetaken).getTime();
        })
        .map((p: any) => ({
          src: p.url_l || p.url_m || "https://s.yimg.com/pw/images/en-us/photo_unavailable.png",
          thumbnail: p.url_m || p.url_sq,
          caption: `${p.title || "Untitled"}: Photo by ${p.ownername || "Bryce Graham"}`,
          width: Number(p.width_l) || 1024,
          height: Number(p.height_l) || 768,
          title: p.title || "Wilderness photograph",
          alt: p.title || "Wilderness photograph",
        }));

      allImages = photos;
      displayedCount = Math.min(initialBatchSize, photos.length);
    } catch (e) {
      console.error("Error fetching Flickr photos:", e);
      error = e instanceof Error ? e.message : "Failed to load photos from Flickr";
    } finally {
      loading = false;
    }
  }

  function loadMore() {
    if (loadingMore || !hasMore) return;
    loadingMore = true;
    setTimeout(() => {
      displayedCount = Math.min(displayedCount + batchSize, allImages.length);
      loadingMore = false;
    }, 250);
  }

  $effect(() => {
    if (!loadMoreSentinel) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    observer.observe(loadMoreSentinel);

    return () => {
      if (observer) observer.disconnect();
    };
  });

  onMount(() => {
    fetchPhotos();
  });
</script>

<div class={`flickr-gallery-container ${className}`}>
  {#if loading}
    <div class="gallery-status-panel">
      <div class="field-spinner"></div>
      <p class="status-msg">Unpacking wilderness exposures...</p>
    </div>
  {:else if error}
    <div class="gallery-error-panel">
      <h3>Notice from the Field</h3>
      <p>{error}</p>
      <button class="retry-btn" onclick={fetchPhotos}>Retry Connection</button>
    </div>
  {:else if allImages.length === 0}
    <div class="gallery-empty-panel">
      <p>No photos found in album.</p>
    </div>
  {:else}
    <div class="gallery-meta-bar">
      <span>Showing {displayedImages.length} of {allImages.length} photographs</span>
    </div>

    <!-- Responsive Justified Masonry Grid -->
    <div class="photo-grid" role="region" aria-label="Photo gallery">
      {#each displayedImages as img, idx (img.src + idx)}
        <div
          class="photo-card"
          onclick={() => (activeIndex = idx)}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              activeIndex = idx;
            }
          }}
          role="button"
          tabindex="0"
          aria-label={`View photo: ${img.title}`}
        >
          <img
            src={img.thumbnail}
            alt={img.alt}
            loading="lazy"
            class="photo-thumb"
          />
          <div class="photo-overlay">
            <span class="photo-title">{img.title}</span>
            <span class="photo-action-hint">View in lightbox ↗</span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Infinite Scroll Sentinel -->
    {#if hasMore}
      <div bind:this={loadMoreSentinel} class="load-more-sentinel">
        {#if loadingMore}
          <div class="field-spinner small"></div>
          <p class="status-msg small">Developing further exposures...</p>
        {/if}
      </div>
    {/if}

    <!-- Lightbox Modal -->
    <Lightbox
      slides={allImages}
      bind:index={activeIndex}
      onclose={() => (activeIndex = -1)}
    />
  {/if}
</div>

<style>
  .flickr-gallery-container {
    width: 100%;
  }

  .gallery-status-panel,
  .gallery-empty-panel {
    text-align: center;
    padding: 4rem 2rem;
    color: #9ebd9b;
  }

  .gallery-error-panel {
    padding: 2.5rem 2rem;
    background-color: rgba(42, 28, 24, 0.85);
    border: 1px solid rgba(212, 107, 70, 0.4);
    border-radius: 12px;
    text-align: center;
    max-width: 600px;
    margin: 2rem auto;
  }

  .gallery-error-panel h3 {
    color: #f3cc83;
    margin-bottom: 0.75rem;
    font-family: var(--font-display, "Cinzel", serif);
  }

  .gallery-error-panel p {
    color: #d6cfbe;
    margin-bottom: 1.25rem;
  }

  .retry-btn {
    padding: 0.65rem 1.5rem;
    background-color: #d49a46;
    color: #121f15;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: background-color 0.2s ease;
  }

  .retry-btn:hover {
    background-color: #f3cc83;
  }

  .field-spinner {
    display: inline-block;
    width: 44px;
    height: 44px;
    border: 3px solid rgba(212, 154, 70, 0.2);
    border-top-color: #d49a46;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  .field-spinner.small {
    width: 32px;
    height: 32px;
    border-width: 2.5px;
  }

  .status-msg {
    margin-top: 1rem;
    color: #9ebd9b;
    font-family: var(--font-serif, "Lora", serif);
    font-style: italic;
    font-size: 0.95rem;
  }

  .status-msg.small {
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .gallery-meta-bar {
    margin-bottom: 1.25rem;
    color: #9ebd9b;
    font-size: 0.88rem;
    font-family: var(--font-sans);
    letter-spacing: 0.02em;
  }

  /* Responsive Photo Grid */
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }

  .photo-card {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 8px;
    background: #111a13;
    border: 1px solid rgba(138, 171, 133, 0.16);
    cursor: pointer;
    outline: none;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.2s ease;
  }

  .photo-card:hover,
  .photo-card:focus-visible {
    transform: translateY(-4px);
    border-color: rgba(212, 163, 89, 0.6);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5);
  }

  .photo-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .photo-card:hover .photo-thumb {
    transform: scale(1.05);
  }

  .photo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 18, 12, 0.88) 0%, rgba(10, 18, 12, 0.2) 50%, transparent 100%);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1rem;
    transition: opacity 0.25s ease;
  }

  .photo-card:hover .photo-overlay,
  .photo-card:focus-visible .photo-overlay {
    opacity: 1;
  }

  .photo-title {
    color: #f7eed7;
    font-family: var(--font-serif, "Lora", serif);
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 0.25rem;
  }

  .photo-action-hint {
    color: #e0aa53;
    font-size: 0.75rem;
    font-family: var(--font-sans);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .load-more-sentinel {
    text-align: center;
    padding: 2.5rem 1rem;
    min-height: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .photo-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }
  }
</style>
