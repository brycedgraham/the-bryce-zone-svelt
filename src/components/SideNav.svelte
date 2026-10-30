<script lang="ts">
  import { router } from "../lib/router.svelte";
  import "./navigation/SideNav.css";

  let isOpen = $state(false);

  const navItems = [
    { to: "/", label: "Home Base", icon: "🌲" },
    { to: "/Toolbox", label: "Toolbox", icon: "🪵" },
    { to: "/Experience", label: "Experience", icon: "📜" },
    { to: "/Photography", label: "Photography", icon: "📷" },
    { to: "/BirdWatch", label: "Bird Watch", icon: "🐦" },
    { to: "/FavoriteBooks", label: "Favorite Books", icon: "📖" },
  ];

  function isActive(path: string): boolean {
    const current = router.currentPath.toLowerCase().replace(/\/$/, "") || "/";
    const target = path.toLowerCase().replace(/\/$/, "") || "/";
    if (target === "/") return current === "/";
    return current === target || current.startsWith(target + "/");
  }

  function handleNavClick() {
    isOpen = false;
  }
</script>

<!-- Mobile menu toggle button -->
<button
  class="mobile-menu-btn"
  onclick={() => (isOpen = !isOpen)}
  aria-label="Toggle navigation menu"
  aria-expanded={isOpen}
>
  <span class="hamburger" class:open={isOpen}></span>
</button>

<!-- Sidebar -->
<nav class="sidebar" class:open={isOpen} aria-label="Main Navigation">
  <div class="sidebar-header">
    <div class="sidebar-brand-emblem">
      <span class="brand-leaf-icon" aria-hidden="true">🌿</span>
      <div class="brand-text-block">
        <span class="brand-kicker">Field Journal</span>
        <h2>Bryce Graham</h2>
      </div>
    </div>
  </div>

  <ul class="nav-list">
    {#each navItems as item (item.to)}
      <li>
        <a
          href={item.to}
          class={isActive(item.to) ? "active" : ""}
          onclick={handleNavClick}
        >
          <span class="nav-icon" aria-hidden="true">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
          {#if isActive(item.to)}
            <span class="active-dot" aria-hidden="true"></span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>

  <div class="sidebar-footer">
    <div class="field-notes-badge">
      <span class="badge-title">The Naturalist's Study</span>
      <span class="badge-subtitle">Woodland & Digital Craft</span>
    </div>
  </div>
</nav>

<!-- Backdrop overlay for mobile drawer -->
{#if isOpen}
  <div
    class="sidebar-overlay"
    onclick={() => (isOpen = false)}
    onkeydown={(e) => e.key === "Escape" && (isOpen = false)}
    role="button"
    tabindex="-1"
    aria-label="Close sidebar overlay"
  ></div>
{/if}
