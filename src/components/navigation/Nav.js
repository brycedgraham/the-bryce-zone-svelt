import React from "react"
import ListLink from "./ListLink"

const Nav = () => (
  <nav>
    <ul style={{ listStyle: `none`, float: `right` }}>
      <ListLink to="/">Home</ListLink>
      <ListLink to="/Toolbox/">Toolbox</ListLink>
      <ListLink to="/Photography/">Photography</ListLink>
      <ListLink to="/FavoriteBooks/">Favorite Books</ListLink>
    </ul>
  </nav>
)

export default Nav
