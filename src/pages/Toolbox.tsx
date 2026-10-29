import React from "react"
import "./toolbox.css"

interface Skill {
  name: string
  icon?: string
}

interface SkillCategory {
  title: string
  icon: string
  skills: Skill[]
}

const Toolbox = () => {
  const skillCategories: SkillCategory[] = [
    {
      title: "Languages & Frameworks",
      icon: "🌲",
      skills: [
        { name: "C#" },
        { name: "TypeScript" },
        { name: "JavaScript" },
        { name: "React" },
        { name: "ASP.NET Core" },
        { name: "Linux" },
        { name: "Docker" },
        { name: "HTML5" },
        { name: "CSS3 / Modern CSS" },
      ],
    },
    {
      title: "Databases & Storage",
      icon: "🪨",
      skills: [
        { name: "PostgreSQL" },
        { name: "MySQL" },
        { name: "MSSQL / SQL Server" },
        { name: "Oracle DB" },
        { name: "Elasticsearch" },
      ],
    },
    {
      title: "Tools & Workbench",
      icon: "🛠️",
      skills: [
        { name: "VS Code" },
        { name: "Visual Studio" },
        { name: "DBeaver" },
        { name: "HeidiSQL" },
        { name: "Postman" },
        { name: "Terminal / Bash" },
      ],
    },
    {
      title: "Cloud & Infrastructure",
      icon: "⛰️",
      skills: [
        { name: "AWS" },
        { name: "IIS" },
        { name: "Azure DevOps / TFS" },
        { name: "Docker Containers" },
      ],
    },
    {
      title: "Version Control & Workflow",
      icon: "🧭",
      skills: [
        { name: "Git" },
        { name: "GitHub" },
        { name: "GitLab" },
        { name: "SVN" },
      ],
    },
    {
      title: "APIs & Systems Integration",
      icon: "🌿",
      skills: [
        { name: "RESTful APIs" },
        { name: "JSON / XML" },
        { name: "Swagger / OpenAPI" },
        { name: "CI/CD Pipelines" },
        { name: "PowerShell" },
      ],
    },
  ]

  return (
    <div className="toolbox-page">
      <div className="toolbox-header">
        <div className="page-kicker">
          <span className="page-kicker-icon" aria-hidden="true">🪵</span>
          <span>The Artisan's Workbench</span>
        </div>
        <h1>Technical Toolbox & Craft</h1>
        <blockquote className="toolbox-quote">
          "It is a mistake to think you can solve any major problems just with potatoes."
          <cite>— Douglas Adams</cite>
        </blockquote>
        <p className="toolbox-intro">
          A comprehensive catalog of tools, languages, and dependable frameworks 
          honed across years of production engineering.
        </p>
      </div>

      <div className="skills-grid">
        {skillCategories.map((category) => (
          <div key={category.title} className="skill-category">
            <div className="category-header">
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
              <h2>{category.title}</h2>
            </div>
            <div className="skills-list">
              {category.skills.map((skill) => (
                <div key={skill.name} className="skill-badge">
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="toolbox-footer">
        <p>
          🌲 Honoring clean craftsmanship, durable architecture, and continuous learning from the roots up.
        </p>
      </div>
    </div>
  )
}

export default Toolbox