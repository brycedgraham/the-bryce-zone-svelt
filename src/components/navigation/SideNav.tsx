import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import "./SideNav.css"

const Nav = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { to: "/", label: "Home Base", icon: "🌲" },
    { to: "/Toolbox", label: "Toolbox", icon: "🪵" },
    { to: "/Experience", label: "Experience", icon: "📜" },
    { to: "/Photography", label: "Photography", icon: "📷" },
    { to: "/FavoriteBooks", label: "Favorite Books", icon: "📖" },
  ]

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    const current = location.pathname.toLowerCase().replace(/\/$/, "")
    const target = path.toLowerCase().replace(/\/$/, "")
    return current === target || current.startsWith(target + "/")
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <span className={`hamburger ${isOpen ? "open" : ""}`}></span>
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Main Navigation">
        <div className="sidebar-header">
          <div className="sidebar-brand-emblem">
            <span className="brand-leaf-icon" aria-hidden="true">🌿</span>
            <div className="brand-text-block">
              <span className="brand-kicker">Field Journal</span>
              <h2>Bryce Graham</h2>
            </div>
          </div>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={isActive(item.to) ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive(item.to) && <span className="active-dot" aria-hidden="true"></span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="field-notes-badge">
            <span className="badge-title">The Naturalist's Study</span>
            <span className="badge-subtitle">Woodland & Digital Craft</span>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true" 
        />
      )}
    </>
  )
}

export default Nav