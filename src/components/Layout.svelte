<script lang="ts">
  import type { Snippet } from "svelte";
  import Header from "./Header.svelte";
  import SideNav from "./SideNav.svelte";
  import "./layout.css";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
  const currentYear = new Date().getFullYear();
</script>

<div class="app-container">
  <SideNav />
  <div class="main-wrapper">
    <Header siteTitle="The Bryce Zone" />
    <main class="main-content">
      {#if children}
        {@render children()}
      {/if}
    </main>
    <footer class="site-footer">
      <p>
        © {currentYear} • Built with{" "}
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">Vite</a>
        {" "}and{" "}
        <a href="https://svelte.dev" target="_blank" rel="noopener noreferrer">Svelte 5</a>
      </p>
    </footer>
  </div>
</div>
