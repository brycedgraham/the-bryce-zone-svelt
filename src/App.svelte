<script lang="ts">
  import Layout from "./components/Layout.svelte";
  import Home from "./pages/Home.svelte";
  import Toolbox from "./pages/Toolbox.svelte";
  import EducationExperience from "./pages/EducationExperience.svelte";
  import Photography from "./pages/Photography.svelte";
  import FavoriteBooks from "./pages/FavoriteBooks.svelte";
  import { router } from "./lib/router.svelte";

  let currentPath = $derived(router.currentPath);
</script>

<Layout>
  {#if currentPath === "/" || currentPath === ""}
    <Home />
  {:else if currentPath === "/Toolbox"}
    <Toolbox />
  {:else if currentPath === "/Experience"}
    <EducationExperience />
  {:else if currentPath === "/Photography"}
    <Photography />
  {:else if currentPath === "/FavoriteBooks"}
    <FavoriteBooks />
  {:else}
    <Home />
  {/if}
</Layout>
