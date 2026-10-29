<script lang="ts">
  import GoodreadsQuotesWidget from "../components/GoodreadsQuotesWidget.svelte";
  import "./Home.css";
</script>

<div class="home-page">
  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-kicker">
      <span class="kicker-leaf">🌿</span>
      <span>Field Journal & Portfolio</span>
    </div>
    <h1 class="hero-title">
      Hello, I'm <span class="highlight">Bryce Graham</span>
    </h1>
    <p class="hero-subtitle">
      Software Craftsman • Systems Engineer • Naturalist & Photographer
    </p>
    <p class="hero-description">
      Welcome to my digital lodge—a quiet clearing at the intersection of robust 
      software engineering, technical curiosity, and backcountry exploration.
    </p>
  </section>

  <!-- About Section -->
  <section class="about-section">
    <div class="about-grid">
      <div class="about-card">
        <div class="card-icon" aria-hidden="true">🌲</div>
        <h3>Software Craft</h3>
        <p>
          Building resilient architectures, robust APIs, and enterprise systems 
          with modern .NET, cloud infrastructure, and modern frontend stacks.
        </p>
      </div>
      <div class="about-card">
        <div class="card-icon" aria-hidden="true">🌿</div>
        <h3>Visual Storytelling</h3>
        <p>
          Exploring the outdoors through the camera lens, capturing natural light, 
          mountain vistas, and quiet wilderness textures.
        </p>
      </div>
      <div class="about-card">
        <div class="card-icon" aria-hidden="true">🪵</div>
        <h3>The Digital Workbench</h3>
        <p>
          Continuous curiosity—tinkering with tools, diving into scientific 
          literature, and cultivating practical engineering habits.
        </p>
      </div>
    </div>
  </section>

  <!-- Quick Links -->
  <section class="links-section">
    <div class="section-heading-wrap">
      <span class="section-kicker">Network & Source</span>
      <h2>Connect With Me</h2>
    </div>
    <div class="social-links">
      <a 
        href="https://www.linkedin.com/in/bryce-graham-34590a49/"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link linkedin"
      >
        <div class="social-icon">
          <img src="/images/LinkImages/LinkedIn.png" alt="LinkedIn logo" />
        </div>
        <div class="social-info">
          <span class="social-name">LinkedIn</span>
          <span class="social-description">Professional career & history</span>
        </div>
      </a>
      <a 
        href="https://github.com/brycedgraham/"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link github"
      >
        <div class="social-icon">
          <img src="/images/LinkImages/GitHub.png" alt="GitHub logo" />
        </div>
        <div class="social-info">
          <span class="social-name">GitHub</span>
          <span class="social-description">Open source & repositories</span>
        </div>
      </a>
    </div>
  </section>

  <!-- Explore Section -->
  <section class="explore-section">
    <div class="section-heading-wrap">
      <span class="section-kicker">Field Guide</span>
      <h2>Explore This Site</h2>
    </div>
    <div class="explore-grid">
      <a href="/Toolbox" class="explore-card">
        <div class="explore-icon-wrapper">
          <span class="explore-icon" aria-hidden="true">🪵</span>
        </div>
        <h3>Toolbox</h3>
        <p>Languages, frameworks, databases, and workbench utilities I build with.</p>
        <span class="explore-arrow" aria-hidden="true">Explore Tools →</span>
      </a>
      <a href="/Photography" class="explore-card">
        <div class="explore-icon-wrapper">
          <span class="explore-icon" aria-hidden="true">📷</span>
        </div>
        <h3>Photography</h3>
        <p>Visual gallery of landscapes, macro shots, and adventures in the wild.</p>
        <span class="explore-arrow" aria-hidden="true">View Gallery →</span>
      </a>
      <a href="/FavoriteBooks" class="explore-card">
        <div class="explore-icon-wrapper">
          <span class="explore-icon" aria-hidden="true">📖</span>
        </div>
        <h3>Favorite Books</h3>
        <p>A curated library of literature, science, sci-fi, and philosophical works.</p>
        <span class="explore-arrow" aria-hidden="true">Browse Shelf →</span>
      </a>
    </div>
  </section>

  <!-- Quotes Section -->
  <section class="quotes-section">
    <div class="section-heading-wrap">
      <span class="section-kicker">Literary Inscriptions</span>
      <h2>Words That Inspire</h2>
    </div>
    <div class="quotes-card-wrapper">
      <GoodreadsQuotesWidget />
    </div>
  </section>
</div>
