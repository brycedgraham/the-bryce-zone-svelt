import React from "react"
import { Link } from "react-router-dom"
import "./Home.css"
import GoodreadsQuotesWidget from "../components/GoodreadsQuotesWidget"

const Home = () => (
  <div className="home-page">
    {/* Hero Section */}
    <section className="hero-section">
      <div className="hero-kicker">
        <span className="kicker-leaf">🌿</span>
        <span>Field Journal & Portfolio</span>
      </div>
      <h1 className="hero-title">
        Hello, I'm <span className="highlight">Bryce Graham</span>
      </h1>
      <p className="hero-subtitle">
        Software Craftsman • Systems Engineer • Naturalist & Photographer
      </p>
      <p className="hero-description">
        Welcome to my digital lodge—a quiet clearing at the intersection of robust 
        software engineering, technical curiosity, and backcountry exploration.
      </p>
    </section>

    {/* About Section */}
    <section className="about-section">
      <div className="about-grid">
        <div className="about-card">
          <div className="card-icon" aria-hidden="true">🌲</div>
          <h3>Software Craft</h3>
          <p>
            Building resilient architectures, robust APIs, and enterprise systems 
            with modern .NET, React, and cloud infrastructure.
          </p>
        </div>
        <div className="about-card">
          <div className="card-icon" aria-hidden="true">🌿</div>
          <h3>Visual Storytelling</h3>
          <p>
            Exploring the outdoors through the camera lens, capturing natural light, 
            mountain vistas, and quiet wilderness textures.
          </p>
        </div>
        <div className="about-card">
          <div className="card-icon" aria-hidden="true">🪵</div>
          <h3>The Digital Workbench</h3>
          <p>
            Continuous curiosity—tinkering with tools, diving into scientific 
            literature, and cultivating practical engineering habits.
          </p>
        </div>
      </div>
    </section>

    {/* Quick Links */}
    <section className="links-section">
      <div className="section-heading-wrap">
        <span className="section-kicker">Network & Source</span>
        <h2>Connect With Me</h2>
      </div>
      <div className="social-links">
        <a 
          href="https://www.linkedin.com/in/bryce-graham-34590a49/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link linkedin"
        >
          <div className="social-icon">
            <img src="/images/LinkImages/LinkedIn.png" alt="LinkedIn logo" />
          </div>
          <div className="social-info">
            <span className="social-name">LinkedIn</span>
            <span className="social-description">Professional career & history</span>
          </div>
        </a>
        <a 
          href="https://github.com/brycedgraham/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link github"
        >
          <div className="social-icon">
            <img src="/images/LinkImages/GitHub.png" alt="GitHub logo" />
          </div>
          <div className="social-info">
            <span className="social-name">GitHub</span>
            <span className="social-description">Open source & repositories</span>
          </div>
        </a>
      </div>
    </section>

    {/* Explore Section */}
    <section className="explore-section">
      <div className="section-heading-wrap">
        <span className="section-kicker">Field Guide</span>
        <h2>Explore This Site</h2>
      </div>
      <div className="explore-grid">
        <Link to="/Toolbox" className="explore-card">
          <div className="explore-icon-wrapper">
            <span className="explore-icon" aria-hidden="true">🪵</span>
          </div>
          <h3>Toolbox</h3>
          <p>Languages, frameworks, databases, and workbench utilities I build with.</p>
          <span className="explore-arrow" aria-hidden="true">Explore Tools →</span>
        </Link>
        <Link to="/Photography" className="explore-card">
          <div className="explore-icon-wrapper">
            <span className="explore-icon" aria-hidden="true">📷</span>
          </div>
          <h3>Photography</h3>
          <p>Visual gallery of landscapes, macro shots, and adventures in the wild.</p>
          <span className="explore-arrow" aria-hidden="true">View Gallery →</span>
        </Link>
        <Link to="/FavoriteBooks" className="explore-card">
          <div className="explore-icon-wrapper">
            <span className="explore-icon" aria-hidden="true">📖</span>
          </div>
          <h3>Favorite Books</h3>
          <p>A curated library of literature, science, sci-fi, and philosophical works.</p>
          <span className="explore-arrow" aria-hidden="true">Browse Shelf →</span>
        </Link>
      </div>
    </section>

    {/* Quotes Section */}
    <section className="quotes-section">
      <div className="section-heading-wrap">
        <span className="section-kicker">Literary Inscriptions</span>
        <h2>Words That Inspire</h2>
      </div>
      <div className="quotes-card-wrapper">
        <GoodreadsQuotesWidget />
      </div>
    </section>
  </div>
)

export default Home