/**
 * Portfolio Client Logic
 * Handles dynamic content rendering, Case Study modal, filtering, and contact form submission.
 */

// Global State
let portfolioData = null;

// Initial Fallback Data in case the backend server is not running
const FALLBACK_DATA = {
  about: {
    name: "Alex Rivera",
    title: "Full Stack Developer",
    tagline: "Crafting resilient, high-performance web applications and delightful digital experiences from end to end.",
    image: "uploads/profile.jpg",
    bio: "Hello! I am a full-stack developer dedicated to architecting scalable, performant web applications with modern frontend and backend technologies. I bridge creative UI/UX design with reliable backend systems, clean database models, and cloud-ready infrastructure.",
    experienceYears: "3+",
    completedProjects: "25+",
    satisfiedClients: "20+",
    resumeUrl: "#",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  },
  skills: [
    { id: "skill_1", name: "JavaScript & TypeScript", course: "Full Stack Modern JavaScript & TypeScript Masterclass", progress: 92, category: "Frontend & Backend", level: "Advanced" },
    { id: "skill_2", name: "React.js & Next.js", course: "React 18, Server Components & State Architecture", progress: 90, category: "Frontend", level: "Advanced" },
    { id: "skill_3", name: "HTML5, CSS3 & Tailwind CSS", course: "Responsive Design, CSS Grid & Animation Systems", progress: 95, category: "Frontend", level: "Expert" },
    { id: "skill_4", name: "Node.js & Express.js", course: "Microservices & Scalable REST API Architecture", progress: 88, category: "Backend", level: "Advanced" },
    { id: "skill_5", name: "MongoDB & Mongoose", course: "NoSQL Database Design, Indexing & Aggregation", progress: 85, category: "Database", level: "Proficient" },
    { id: "skill_6", name: "SQL & PostgreSQL", course: "Relational Schema Modeling, ACID Transactions & Tuning", progress: 80, category: "Database", level: "Proficient" }
  ],
  tools: [
    { id: "tool_1", name: "VS Code", category: "Code Editor", icon: "fa-solid fa-code", description: "Primary IDE with custom snippets & debugging workflows" },
    { id: "tool_2", name: "Git & GitHub", category: "Version Control", icon: "fa-brands fa-github", description: "Source control, branching strategies & PR reviews" },
    { id: "tool_3", name: "Postman", category: "API Testing", icon: "fa-solid fa-paper-plane", description: "REST & GraphQL testing, mocking endpoints & automation" },
    { id: "tool_4", name: "Docker", category: "DevOps", icon: "fa-brands fa-docker", description: "Containerizing dev environments and production builds" },
    { id: "tool_5", name: "MongoDB Compass", category: "Database Tool", icon: "fa-solid fa-database", description: "Document visualization and query performance analysis" },
    { id: "tool_6", name: "Figma", category: "UI/UX Design", icon: "fa-brands fa-figma", description: "Interactive prototypes and design system handoff" },
    { id: "tool_7", name: "Linux / Bash", category: "Operating System", icon: "fa-brands fa-linux", description: "CLI administration and remote server deployment" },
    { id: "tool_8", name: "Vercel / Netlify", category: "Cloud Hosting", icon: "fa-solid fa-cloud-arrow-up", description: "Continuous deployment and edge serverless hosting" }
  ],
  projects: [
    {
      id: "proj_1",
      name: "NexusCloud - Collaborative Task Suite",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
      languages: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Socket.io"],
      description: "A real-time project management and Kanban workspace designed for distributed teams to collaborate seamlessly with instant notifications, drag-and-drop boards, and sprint analytics.",
      caseStudy: {
        challenge: "Distributed teams experienced inconsistent task synchronization states, high server polling load, and laggy rendering when backlogs exceeded several hundred active items.",
        approach: "Engineered a WebSocket synchronization protocol with optimistic client-side updates, implemented cursor-based pagination for project boards, and optimized MongoDB query indexes with compound keys.",
        outcome: "Achieved sub-100ms real-time state synchronization across all connected clients, decreased server CPU load by 45%, and scaled the system to support 5,000+ simultaneous collaborators with 99.98% uptime."
      },
      github: "https://github.com",
      demo: "https://example.com",
      featured: true
    },
    {
      id: "proj_2",
      name: "ShopSphere - Headless E-Commerce Platform",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=900&q=80",
      languages: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Stripe API"],
      description: "An ultra-fast headless e-commerce store featuring real-time inventory management, progressive checkout flow, multi-currency support, and comprehensive merchant revenue dashboards.",
      caseStudy: {
        challenge: "The previous storefront had a high checkout abandonment rate (68%) caused by sluggish multi-page redirection and frequent inventory mismatches during peak promotional launches.",
        approach: "Designed a single-page progressive checkout using Stripe Payment Intents, implemented transactional row locking in PostgreSQL to guarantee atomic stock reductions, and leveraged ISR.",
        outcome: "Elevated Lighthouse performance score to 98/100, reduced average checkout completion time by 42%, dropped cart abandonment to 32%, and processed $150k+ in launch transactions without a single stock collision."
      },
      github: "https://github.com",
      demo: "https://example.com",
      featured: true
    },
    {
      id: "proj_3",
      name: "HealthPulse - Secure Telehealth Consultation Portal",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
      languages: ["React", "Express.js", "WebRTC", "PostgreSQL", "Tailwind CSS"],
      description: "A HIPAA-compliant telemedicine platform enabling patients to schedule virtual appointments, attend encrypted HD video calls, and access encrypted electronic medical records.",
      caseStudy: {
        challenge: "Medical providers needed an ultra-secure, tamper-proof video streaming environment that could reliably operate over low-bandwidth mobile networks while safeguarding confidential health data.",
        approach: "Constructed peer-to-peer WebRTC channels with adaptive bitrate streaming and automatic TURN relay fallbacks, implemented AES-256 encrypted storage for consultation notes, and built strict role-based access control.",
        outcome: "Successfully hosted over 15,000 secure video consultations with zero security breaches, maintained video clarity on 3G connections, and received a 4.9/5 patient satisfaction score across clinic partners."
      },
      github: "https://github.com",
      demo: "https://example.com",
      featured: true
    }
  ],
  education: [
    {
      id: "edu_1",
      degree: "Bachelor of Technology in Computer Science & Engineering",
      institution: "Institute of Technology & Science",
      year: "2020 - 2024",
      grade: "CGPA: 8.9 / 10",
      details: "Focused on Data Structures, Algorithms, Database Systems, Computer Networks, and Software Engineering. Lead coordinator for the campus Developers Guild and hackathon finalist."
    },
    {
      id: "edu_2",
      degree: "Full Stack Web Development & Software Architecture",
      institution: "Besant Technologies",
      year: "2024",
      grade: "Certificate of Excellence (Honors)",
      details: "Intensive hands-on training across modern JavaScript, React, Node.js, Express, MongoDB, SQL, REST APIs, Git workflows, and cloud application deployment."
    }
  ],
  experience: [
    {
      id: "exp_1",
      role: "Full Stack Developer",
      company: "TechNova Innovations",
      location: "Bangalore, India",
      period: "2024 - Present",
      type: "Full-time",
      description: "Architecting and scaling responsive web applications, developing microservices, and leading full stack feature delivery.",
      responsibilities: [
        "Engineered robust RESTful APIs with Node.js and Express handling high transaction volumes.",
        "Built modular, interactive frontend interfaces using React.js and Tailwind CSS with 95+ Lighthouse performance scores.",
        "Designed MongoDB schemas and aggregation pipelines for optimized query performance.",
        "Containerized applications using Docker and set up automated GitHub Actions CI/CD workflows."
      ],
      skillsUsed: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "Docker", "Git"]
    },
    {
      id: "exp_2",
      role: "Junior Full Stack Engineer",
      company: "Cognitive Cloud Solutions",
      location: "Bangalore, India",
      period: "2023 - 2024",
      type: "Full-time",
      description: "Developed dynamic client portals, integrated payment processors, and streamlined SQL database schemas.",
      responsibilities: [
        "Collaborated with UI/UX designers to translate Figma design systems into reusable components.",
        "Decreased page initial load times by 30% through bundle splitting and image asset caching.",
        "Integrated third-party authentication and RESTful endpoints with comprehensive error handling."
      ],
      skillsUsed: ["JavaScript", "React", "Node.js", "SQL", "REST APIs", "Git", "Figma"]
    }
  ],
  hobbies: [
    { id: "hobby_1", name: "Open Source Contributing", icon: "fa-solid fa-code-branch", description: "Collaborating on community libraries, debugging issues, and writing clear developer documentation." },
    { id: "hobby_2", name: "Tech Blogging & Mentoring", icon: "fa-solid fa-pen-nib", description: "Publishing in-depth articles on web architecture, JavaScript best practices, and mentoring new coders." },
    { id: "hobby_3", name: "Algorithmic Problem Solving", icon: "fa-solid fa-puzzle-piece", description: "Tackling daily challenges on LeetCode and exploring graph theory and dynamic programming." },
    { id: "hobby_4", name: "UI/UX & Interactive Design", icon: "fa-solid fa-palette", description: "Experimenting with micro-interactions, motion graphics, and sleek modern typography in Figma." },
    { id: "hobby_5", name: "Landscape & Urban Photography", icon: "fa-solid fa-camera-retro", description: "Capturing architectural geometry, street aesthetics, and scenic sunsets during travel." },
    { id: "hobby_6", name: "Acoustic Guitar & Music", icon: "fa-solid fa-guitar", description: "Relaxing with fingerstyle acoustic melodies, songwriting, and discovering ambient genres." }
  ],
  contact: {
    email: "alex.rivera.dev@example.com",
    phone: "+91 98765 43210",
    location: "Bangalore, Karnataka, India",
    availability: "Open to Full-Time Engineering Roles & Select Freelance Contracts"
  }
};

// Toast Notification Utility
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Fetch Portfolio Data from API or LocalStorage/Fallback
async function loadPortfolioData() {
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      portfolioData = await res.json();
      localStorage.setItem('portfolio_cache', JSON.stringify(portfolioData));
    } else {
      throw new Error('API returned ' + res.status);
    }
  } catch (err) {
    console.warn('Backend API not reachable or static mode, checking local cache...', err);
    const cached = localStorage.getItem('portfolio_cache');
    if (cached) {
      try {
        portfolioData = JSON.parse(cached);
      } catch (e) {
        portfolioData = FALLBACK_DATA;
      }
    } else {
      portfolioData = FALLBACK_DATA;
    }
  }

  renderPortfolio();
}

// Main Render Function
function renderPortfolio() {
  if (!portfolioData) return;

  renderAbout(portfolioData.about);
  renderSkills(portfolioData.skills || []);
  renderTools(portfolioData.tools || []);
  renderExperience(portfolioData.experience || []);
  renderProjects(portfolioData.projects || []);
  renderEducation(portfolioData.education || []);
  renderHobbies(portfolioData.hobbies || []);
  renderContact(portfolioData.contact || {});
}

// ----------------------------------------------------
// 1. Render About Section
// ----------------------------------------------------
function renderAbout(about) {
  if (!about) return;

  const nameEl = document.getElementById('about-name');
  const roleEl = document.getElementById('about-role');
  const taglineEl = document.getElementById('about-tagline');
  const bioEl = document.getElementById('about-bio');
  const imageEl = document.getElementById('about-image');
  const brandNameEl = document.getElementById('nav-brand-name');
  const availabilityEl = document.getElementById('hero-availability');
  const statExp = document.getElementById('stat-experience');
  const statProj = document.getElementById('stat-projects');
  const statClients = document.getElementById('stat-clients');
  const githubLink = document.getElementById('about-github');
  const linkedinLink = document.getElementById('about-linkedin');

  if (nameEl) nameEl.textContent = about.name || "Developer Name";
  if (brandNameEl) brandNameEl.textContent = about.name || "Developer";
  if (roleEl) roleEl.textContent = about.title || "Full Stack Developer";
  if (taglineEl) taglineEl.textContent = about.tagline || "";
  if (bioEl) bioEl.textContent = about.bio || "";
  if (imageEl && about.image) {
    imageEl.src = about.image;
    imageEl.alt = `${about.name} - Full Stack Developer`;
  }
  if (availabilityEl && portfolioData.contact?.availability) {
    availabilityEl.textContent = portfolioData.contact.availability;
  }

  if (statExp) statExp.textContent = about.experienceYears || "3+";
  if (statProj) statProj.textContent = about.completedProjects || "25+";
  if (statClients) statClients.textContent = about.satisfiedClients || "20+";

  if (githubLink && about.github) githubLink.href = about.github;
  if (linkedinLink && about.linkedin) linkedinLink.href = about.linkedin;
}

// ----------------------------------------------------
// 2. Render Skills & Course Progress
// ----------------------------------------------------
function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  if (skills.length === 0) {
    container.innerHTML = `<p class="col-span-2 text-center text-slate-500 py-6">No skills added yet.</p>`;
    return;
  }

  container.innerHTML = skills.map(skill => {
    const progress = Math.min(100, Math.max(0, Number(skill.progress) || 0));
    return `
      <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <h4 class="font-bold text-white text-base">${escapeHTML(skill.name)}</h4>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              ${escapeHTML(skill.level || 'Proficient')}
            </span>
          </div>

          ${skill.course ? `
            <div class="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
              <i class="fa-solid fa-graduation-cap text-indigo-400"></i>
              <span class="truncate">Course: ${escapeHTML(skill.course)}</span>
            </div>
          ` : '<div class="mb-4"></div>'}
        </div>

        <div>
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Course Mastery</span>
            <span class="font-bold text-cyan-400">${progress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 3. Render Tools I Use
// ----------------------------------------------------
function renderTools(tools) {
  const container = document.getElementById('tools-container');
  if (!container) return;

  if (tools.length === 0) {
    container.innerHTML = `<p class="col-span-4 text-center text-slate-500 py-6">No tools listed yet.</p>`;
    return;
  }

  container.innerHTML = tools.map(tool => {
    const iconClass = tool.icon || 'fa-solid fa-screwdriver-wrench';
    return `
      <div class="glass-panel p-5 rounded-2xl flex flex-col items-center text-center group hover:border-cyan-500/40 transition-all">
        <div class="w-12 h-12 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
          <i class="${escapeHTML(iconClass)}"></i>
        </div>
        <h4 class="font-bold text-white text-sm mb-1 group-hover:text-cyan-300 transition-colors">${escapeHTML(tool.name)}</h4>
        <span class="text-[11px] font-mono text-slate-400 mb-2 uppercase">${escapeHTML(tool.category || 'Tool')}</span>
        ${tool.description ? `<p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">${escapeHTML(tool.description)}</p>` : ''}
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 4. Render Projects (With Case Studies & Repo Links)
// ----------------------------------------------------
function renderProjects(projects, filter = 'all') {
  const container = document.getElementById('projects-container');
  if (!container) return;

  let filtered = projects;
  if (filter !== 'all') {
    filtered = projects.filter(p => {
      const langs = Array.isArray(p.languages) ? p.languages : [];
      return langs.some(l => l.toLowerCase().includes(filter.toLowerCase())) ||
             (p.name && p.name.toLowerCase().includes(filter.toLowerCase()));
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-12 glass-panel rounded-2xl">
        <i class="fa-solid fa-folder-open text-3xl text-slate-600 mb-3"></i>
        <p class="text-slate-400 text-sm">No projects found matching the filter "${escapeHTML(filter)}".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(proj => {
    const langs = Array.isArray(proj.languages) ? proj.languages : [];
    const imageSrc = proj.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80';

    return `
      <div class="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all">
        
        <!-- Project Preview Image -->
        <div class="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img src="${escapeHTML(imageSrc)}" alt="${escapeHTML(proj.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <!-- GitHub & Live Demo Quick Action overlay -->
          <div class="absolute top-4 right-4 flex items-center gap-2">
            ${proj.github ? `
              <a href="${escapeHTML(proj.github)}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur text-white hover:bg-indigo-600 flex items-center justify-center transition-all shadow-md" title="GitHub Repository">
                <i class="fa-brands fa-github text-sm"></i>
              </a>
            ` : ''}
            ${proj.demo ? `
              <a href="${escapeHTML(proj.demo)}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur text-white hover:bg-cyan-500 flex items-center justify-center transition-all shadow-md" title="Live Application Demo">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Project Details -->
        <div class="p-6 sm:p-8 flex flex-col flex-1 justify-between gap-6">
          
          <div class="space-y-3">
            <!-- Languages Used Badges -->
            <div class="flex flex-wrap gap-1.5">
              ${langs.map(l => `<span class="tech-tag">${escapeHTML(l)}</span>`).join('')}
            </div>

            <!-- Project Name -->
            <h3 class="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
              ${escapeHTML(proj.name)}
            </h3>

            <!-- Description -->
            <p class="text-slate-300 text-sm leading-relaxed line-clamp-3">
              ${escapeHTML(proj.description || '')}
            </p>
          </div>

          <!-- Bottom Actions: Case Study & Repo -->
          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
            <!-- Read Case Study Button -->
            <button onclick="openCaseStudyModal('${proj.id}')" class="px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-all">
              <i class="fa-solid fa-book-open text-indigo-400"></i>
              <span>Read Case Study</span>
            </button>

            <!-- GitHub Repo Link Text Button -->
            ${proj.github ? `
              <a href="${escapeHTML(proj.github)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <span>Repository</span>
                <i class="fa-brands fa-github"></i>
              </a>
            ` : ''}
          </div>

        </div>

      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 5. Case Study Modal Logic
// ----------------------------------------------------
function openCaseStudyModal(projectId) {
  if (!portfolioData || !portfolioData.projects) return;
  const project = portfolioData.projects.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('case-study-modal');
  const nameEl = document.getElementById('modal-project-name');
  const imgEl = document.getElementById('modal-project-image');
  const tagsEl = document.getElementById('modal-project-tags');
  const descEl = document.getElementById('modal-project-desc');
  const challengeEl = document.getElementById('modal-challenge');
  const approachEl = document.getElementById('modal-approach');
  const outcomeEl = document.getElementById('modal-outcome');
  const githubLink = document.getElementById('modal-github-link');
  const demoLink = document.getElementById('modal-demo-link');

  nameEl.textContent = project.name;
  imgEl.src = project.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80';
  imgEl.alt = project.name;

  const langs = Array.isArray(project.languages) ? project.languages : [];
  tagsEl.innerHTML = langs.map(l => `<span class="tech-tag bg-slate-900/90 text-indigo-300 border-indigo-500/40">${escapeHTML(l)}</span>`).join('');

  descEl.textContent = project.description || "Detailed enterprise architectural showcase.";

  const cs = project.caseStudy || {};
  challengeEl.textContent = cs.challenge || "Identified performance bottlenecks and architectural constraints in legacy monolithic implementations.";
  approachEl.textContent = cs.approach || "Engineered modular microservices, decoupled client UI state management, and optimized database indexing.";
  outcomeEl.textContent = cs.outcome || "Delivered marked performance improvement, reduced response latency, and guaranteed enterprise scalability.";

  if (project.github && project.github !== '#') {
    githubLink.href = project.github;
    githubLink.style.display = 'inline-flex';
  } else {
    githubLink.style.display = 'none';
  }

  if (project.demo && project.demo !== '#') {
    demoLink.href = project.demo;
    demoLink.style.display = 'inline-flex';
  } else {
    demoLink.style.display = 'none';
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCaseStudyModal() {
  const modal = document.getElementById('case-study-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// ----------------------------------------------------
// 6. Render Education Section
// ----------------------------------------------------
function renderEducation(education) {
  const container = document.getElementById('education-container');
  if (!container) return;

  if (education.length === 0) {
    container.innerHTML = `<p class="col-span-2 text-center text-slate-500 py-6">No education listed yet.</p>`;
    return;
  }

  container.innerHTML = education.map(edu => {
    return `
      <div class="glass-panel p-6 sm:p-8 rounded-2xl relative border-l-4 border-l-indigo-500">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span class="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 w-max">
            ${escapeHTML(edu.year || '')}
          </span>
          ${edu.grade ? `
            <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-max">
              ${escapeHTML(edu.grade)}
            </span>
          ` : ''}
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-white mb-1">${escapeHTML(edu.degree)}</h3>
        <h4 class="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-building-columns text-cyan-400"></i>
          <span>${escapeHTML(edu.institution)}</span>
        </h4>

        ${edu.details ? `
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">${escapeHTML(edu.details)}</p>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 6.5. Render Professional Experience Section
// ----------------------------------------------------
function renderExperience(experience) {
  const container = document.getElementById('experience-container');
  if (!container) return;

  if (experience.length === 0) {
    container.innerHTML = `<p class="col-span-2 text-center text-slate-500 py-6">No professional experience listed yet.</p>`;
    return;
  }

  container.innerHTML = experience.map(exp => {
    const skills = Array.isArray(exp.skillsUsed) ? exp.skillsUsed : [];
    const responsibilities = Array.isArray(exp.responsibilities) ? exp.responsibilities : [];

    return `
      <div class="glass-panel p-6 sm:p-8 rounded-3xl relative border-l-4 border-l-indigo-500 group hover:border-indigo-500/40 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
              ${escapeHTML(exp.period || '')}
            </span>
            ${exp.type ? `
              <span class="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                ${escapeHTML(exp.type)}
              </span>
            ` : ''}
          </div>
          ${exp.location ? `
            <span class="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <i class="fa-solid fa-location-dot text-indigo-400 text-xs"></i>
              <span>${escapeHTML(exp.location)}</span>
            </span>
          ` : ''}
        </div>

        <h3 class="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-1">
          ${escapeHTML(exp.role)}
        </h3>
        
        <h4 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-briefcase text-cyan-400"></i>
          <span>${escapeHTML(exp.company)}</span>
        </h4>

        ${exp.description ? `
          <p class="text-slate-300 text-sm leading-relaxed mb-4">
            ${escapeHTML(exp.description)}
          </p>
        ` : ''}

        ${responsibilities.length > 0 ? `
          <div class="space-y-2 mb-5">
            <span class="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold block">Key Contributions:</span>
            <ul class="space-y-2 text-xs sm:text-sm text-slate-300">
              ${responsibilities.map(r => `
                <li class="flex items-start gap-2.5">
                  <i class="fa-solid fa-check text-emerald-400 mt-1 shrink-0 text-xs"></i>
                  <span>${escapeHTML(r)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${skills.length > 0 ? `
          <div class="pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5 items-center">
            <span class="text-[11px] font-mono text-slate-400 uppercase mr-1">Technologies:</span>
            ${skills.map(s => `<span class="tech-tag text-[11px]">${escapeHTML(s)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 7. Render Hobbies & Interests Section
// ----------------------------------------------------
function renderHobbies(hobbies) {
  const container = document.getElementById('hobbies-container');
  if (!container) return;

  if (hobbies.length === 0) {
    container.innerHTML = `<p class="col-span-3 text-center text-slate-500 py-6">No hobbies listed yet.</p>`;
    return;
  }

  container.innerHTML = hobbies.map(hobby => {
    const iconClass = hobby.icon || 'fa-solid fa-heart';
    return `
      <div class="glass-panel p-6 rounded-2xl flex items-start gap-4 group hover:border-pink-500/30 transition-all">
        <div class="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all">
          <i class="${escapeHTML(iconClass)}"></i>
        </div>
        <div>
          <h4 class="font-bold text-white text-base mb-1 group-hover:text-pink-300 transition-colors">${escapeHTML(hobby.name)}</h4>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">${escapeHTML(hobby.description || '')}</p>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 8. Render Contact Section
// ----------------------------------------------------
function renderContact(contact) {
  const emailEl = document.getElementById('contact-email');
  const phoneEl = document.getElementById('contact-phone');
  const locEl = document.getElementById('contact-location');
  const availEl = document.getElementById('contact-availability');

  if (emailEl && contact.email) {
    emailEl.textContent = contact.email;
    emailEl.href = `mailto:${contact.email}`;
  }
  if (phoneEl && contact.phone) {
    phoneEl.textContent = contact.phone;
    phoneEl.href = `tel:${contact.phone.replace(/[^0-9+]/g, '')}`;
  }
  if (locEl && contact.location) {
    locEl.textContent = contact.location;
  }
  if (availEl && contact.availability) {
    availEl.textContent = contact.availability;
  }
}

// ----------------------------------------------------
// 9. Contact Form Submission
// ----------------------------------------------------
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('msg-name').value.trim();
    const email = document.getElementById('msg-email').value.trim();
    const subject = document.getElementById('msg-subject').value.trim();
    const message = document.getElementById('msg-content').value.trim();
    const submitBtn = document.getElementById('msg-submit-btn');

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = { name, email, subject, message };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>`;

    try {
      const res = await fetch('/api/contact/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Your message has been sent successfully!', 'success');
        form.reset();
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (err) {
      console.warn('API submission failed, saving locally...', err);
      // Fallback: save to local cache messages so admin can still read it
      try {
        const cached = JSON.parse(localStorage.getItem('portfolio_cache') || '{}');
        cached.messages = cached.messages || [];
        cached.messages.unshift({
          id: 'msg_' + Date.now(),
          name,
          email,
          subject: subject || 'Portfolio Message',
          message,
          date: new Date().toLocaleString(),
          read: false
        });
        localStorage.setItem('portfolio_cache', JSON.stringify(cached));
        showToast('Message sent and saved!', 'success');
        form.reset();
      } catch (e) {
        showToast('Failed to send message. Please contact directly via email.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span>`;
    }
  });
}

// ----------------------------------------------------
// Event Listeners & Initializations
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadPortfolioData();
  initContactForm();

  // Current year in footer
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  // Project Filter Buttons
  const filterBtns = document.querySelectorAll('#project-filters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'active');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'active');
      btn.classList.remove('bg-slate-800', 'text-slate-300');

      const filterVal = btn.getAttribute('data-filter');
      if (portfolioData) {
        renderProjects(portfolioData.projects || [], filterVal);
      }
    });
  });

  // Case study modal close
  const closeBtn = document.getElementById('close-modal-btn');
  const modal = document.getElementById('case-study-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeCaseStudyModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCaseStudyModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCaseStudyModal();
  });
});

// Helper: Escape HTML to prevent XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
