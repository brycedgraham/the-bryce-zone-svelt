<script lang="ts">
  interface Props {
    siteTitle?: string;
  }
  let { siteTitle = "The Bryce Zone" }: Props = $props();
</script>

<header class="site-header">
  <div class="header-content">
    <h1 class="site-title">
      <a href="/">
        <span class="site-title-icon" aria-hidden="true">🌲</span>
        <span>{siteTitle}</span>
      </a>
    </h1>
    <span class="site-tagline hidden-mobile">
      Field Notes • Code • Craft
    </span>
    <div class="header-accent"></div>
  </div>
</header>
