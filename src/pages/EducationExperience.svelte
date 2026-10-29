<script lang="ts">
  import "./EducationExperience.css";

  interface Experience {
    company: string;
    role: string;
    location: string;
    period: string;
    description: string[];
    stack?: string;
  }

  interface Education {
    school: string;
    degree?: string;
    location: string;
    period: string;
    gpa: string;
    highlights?: string[];
  }

  const experiences: Experience[] = [
    {
      company: "Idaho National Laboratory",
      role: "Software Developer II",
      location: "Idaho Falls, ID",
      period: "Oct. 2021 - Present",
      description: [
        "Lead developer on Acquisition Transformation Initiative. Designed, built, and integrated a new procurement software for purchasing laboratory materials through partnered vendors.",
        "Built multi-part API service to obtain and build form documents. Circumvented feature limitations in external applications through creative problem solving.",
        "Maintenance and feature enhancements to various internal lab applications as part of the Integration Services team.",
      ],
      stack: "C#, .NET Core, MVC, React, Python, Oracle, SQL Server",
    },
    {
      company: "CVO Solutions, Seikosoft LLC",
      role: "Software Developer II",
      location: "Idaho Falls, ID",
      period: "Apr. 2019 - Oct. 2021",
      description: [
        "Developed enterprise level applications for interstate commercial vehicle operations. Improved code reusability and efficiency.",
        "Created new marketable features and integrations including interactive geographical info map.",
        "CVIEW interfaces for law enforcement, UCR registration website, CVSA Emergency Declaration website and IRP Data Repository.",
      ],
      stack: "C#, React, .NET Core, PostgreSQL, AWS",
    },
    {
      company: "Simplicity Collect, Seikosoft LLC",
      role: "Lead Developer",
      location: "Idaho Falls, ID",
      period: "Jun. 2016 - Apr. 2019",
      description: [
        "Developed and maintained large, complex financial web applications using webforms, jQuery, .NET Framework and MySQL as the primary developer.",
        "Custom development work involving debt collection workflows and financial operations. Integrated with 3rd party vendors.",
        "Investigated and addressed exceptions and issues; managed deployment and AWS DevOps; improved code design and efficiency in data importing and reporting.",
      ],
      stack: "C#, Web Forms, .NET Framework, MySQL, AWS",
    },
    {
      company: "Idaho State University",
      role: "Computer Science Tutor & Grader",
      location: "Pocatello, ID",
      period: "Feb. 2016 - May 2016",
      description: [
        "Tutored students in basic to advanced informatics and computer science skills.",
        "Graded classwork and algorithmic problem sets.",
      ],
    },
  ];

  const education: Education[] = [
    {
      school: "Idaho State University",
      degree: "Bachelor of Science in Physics",
      location: "Pocatello, ID",
      period: "May 2016",
      gpa: "3.8",
      highlights: [
        "Minors in Computer Science & Informatics",
        "Dean's List Honoree",
        "Relevant Coursework: Calculus I-III, Linear Algebra, Differential Equations, Engineering Physics I-II, Modern Physics, Advanced Modern Physics, Computer Science and Programming I-II, Computer Organization and Design, Data Structures and Algorithms, Systems Analysis and Design, Networking and Virtualization, Database Management, Systems Development and Implementation Methodologies",
      ],
    },
    {
      school: "Jerome High School",
      degree: "High School Diploma",
      location: "Jerome, ID",
      period: "Graduated 2012",
      gpa: "4.0",
      highlights: ["Valedictorian", "National Honors Society"],
    },
  ];
</script>

<div class="edu-exp-page">
  <div class="page-header">
    <div class="page-kicker">
      <span class="page-kicker-icon" aria-hidden="true">📜</span>
      <span>Chronicles & Foundations</span>
    </div>
    <h1>Education & Experience</h1>
    <blockquote class="page-quote">
      "If I have seen further than others, it is by standing upon the shoulders of giants."
      <cite>— Sir Isaac Newton</cite>
    </blockquote>
  </div>

  <!-- Experience Section -->
  <section class="section">
    <div class="section-title">
      <span class="section-icon" aria-hidden="true">🧭</span>
      <h2>Professional History</h2>
    </div>
    <div class="timeline">
      {#each experiences as exp, index (exp.company + index)}
        <div class="timeline-item">
          <div class="timeline-marker" aria-hidden="true"></div>
          <div class="timeline-content">
            <div class="experience-header">
              <div>
                <h3>{exp.role}</h3>
                <div class="company-name">{exp.company}</div>
              </div>
              <div class="experience-meta">
                <span class="period">{exp.period}</span>
                <span class="location">{exp.location}</span>
              </div>
            </div>
            <ul class="description-list">
              {#each exp.description as item, idx}
                <li>{item}</li>
              {/each}
            </ul>
            {#if exp.stack}
              <div class="tech-stack">
                <strong>Tech Ecosystem:</strong> <span>{exp.stack}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Education Section -->
  <section class="section">
    <div class="section-title">
      <span class="section-icon" aria-hidden="true">🎓</span>
      <h2>Academic Roots</h2>
    </div>
    <div class="education-grid">
      {#each education as edu, index (edu.school + index)}
        <div class="education-card">
          <div class="edu-header">
            <h3>{edu.school}</h3>
            <span class="edu-period">{edu.period}</span>
          </div>
          {#if edu.degree}
            <div class="edu-degree">{edu.degree}</div>
          {/if}
          <div class="edu-details">
            <span class="edu-location">{edu.location}</span>
            <span class="edu-gpa">Cumulative GPA: {edu.gpa}</span>
          </div>
          {#if edu.highlights}
            <ul class="edu-highlights">
              {#each edu.highlights as highlight, idx}
                <li>{highlight}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- Download Resume CTA -->
  <div class="resume-cta">
    <p>Looking for a formal résumé or interested in discussing a project?</p>
    <a 
      href="mailto:bryce.dgraham@outlook.com" 
      class="contact-button"
    >
      ✉ Get in Touch
    </a>
  </div>
</div>
