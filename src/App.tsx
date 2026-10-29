import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/index"
import Toolbox from "./pages/Toolbox"
import Photography from "./pages/Photography"
import FavoriteBooks from "./pages/FavoriteBooks"
import EducationExperience from "./pages/EducationExperience"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Toolbox" element={<Toolbox />} />
          <Route path="toolbox" element={<Navigate to="/Toolbox" replace />} />
          <Route path="Experience" element={<EducationExperience />} />
          <Route path="experience" element={<Navigate to="/Experience" replace />} />
          <Route path="Photography" element={<Photography />} />
          <Route path="photography" element={<Navigate to="/Photography" replace />} />
          <Route path="FavoriteBooks" element={<FavoriteBooks />} />
          <Route path="favoritebooks" element={<Navigate to="/FavoriteBooks" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
