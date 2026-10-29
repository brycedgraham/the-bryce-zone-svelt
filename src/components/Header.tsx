import { Link } from "react-router-dom"
import React from "react"

interface HeaderProps {
  siteTitle?: string
}

const Header = ({ siteTitle = "The Bryce Zone" }: HeaderProps) => (
  <header className="site-header">
    <div className="header-content">
      <h1 className="site-title">
        <Link to="/">
          <span className="site-title-icon" aria-hidden="true">🌲</span>
          <span>{siteTitle}</span>
        </Link>
      </h1>
      <span className="site-tagline hidden-mobile">
        Field Notes • Code • Craft
      </span>
      <div className="header-accent"></div>
    </div>
  </header>
)

export default Header