/**
 * Admin Panel Controller
 * Handles full CRUD operations (Create, Read, Update, Delete) for:
 * - About / Profile info & photo upload
 * - Skills & Course Progress
 * - Tools I Use
 * - Projects with Case Studies & GitHub repos
 * - Education
 * - Hobbies
 * - Contact Details & Messages Inbox
 * - Password Management & Data Resets
 */

// Global Admin State
let adminData = null;
let isAuthenticated = false;

// Toast Utility
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ----------------------------------------------------
// Authentication
// ----------------------------------------------------
function initAuth() {
  const token = sessionStorage.getItem('admin_session');
  if (token) {
    isAuthenticated = true;
    showAdminDashboard();
  } else {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('admin-app').classList.add('hidden');
  }

  // Password visibility toggle
  const toggleBtn = document.getElementById('toggle-pwd-btn');
  const pwdInput = document.getElementById('login-password');
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      toggleBtn.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });
  }

  // Login form submit
  const loginForm = document.getElementById('admin-login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-btn');

    loginBtn.disabled = true;
    loginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('admin_session', data.token);
        isAuthenticated = true;
        showToast('Authentication successful! Welcome.', 'success');
        showAdminDashboard();
      } else {
        throw new Error(data.message || 'Invalid password');
      }
    } catch (err) {
      console.warn('Backend login check failed or static mode, checking local credentials...', err);
      // Fallback check
      const localPwd = localStorage.getItem('admin_pwd') || 'admin123';
      if (password === localPwd) {
        sessionStorage.setItem('admin_session', 'local_token_' + Date.now());
        isAuthenticated = true;
        showToast('Authenticated in offline/local mode!', 'info');
        showAdminDashboard();
      } else {
        showToast(err.message || 'Incorrect password. Try admin123', 'error');
      }
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<span>Log In to Dashboard</span> <i class="fa-solid fa-arrow-right text-xs"></i>`;
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_session');
      window.location.reload();
    });
  }
}

function showAdminDashboard() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('admin-app').classList.remove('hidden');
  fetchAdminData();
}

// ----------------------------------------------------
// Data Fetching & Sync
// ----------------------------------------------------
async function fetchAdminData() {
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      adminData = await res.json();
      localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    } else {
      throw new Error('API fetch failed');
    }
  } catch (err) {
    console.warn('Using local cached data for admin...', err);
    const cached = localStorage.getItem('portfolio_cache');
    if (cached) {
      adminData = JSON.parse(cached);
    } else {
      adminData = {
        about: {},
        skills: [],
        tools: [],
        projects: [],
        education: [],
        hobbies: [],
        contact: {},
        messages: []
      };
    }
  }

  // Also fetch contact messages if available
  try {
    const msgRes = await fetch('/api/messages');
    if (msgRes.ok) {
      const msgJson = await msgRes.json();
      if (msgJson.messages) {
        adminData.messages = msgJson.messages;
      }
    }
  } catch (e) {
    // Local fallback message array
    adminData.messages = adminData.messages || [];
  }

  renderAllAdminViews();
}

// Render all tabs
function renderAllAdminViews() {
  if (!adminData) return;

  renderOverview();
  populateAboutForm();
  renderAdminSkills();
  renderAdminTools();
  renderAdminExperience();
  renderAdminProjects();
  renderAdminEducation();
  renderAdminHobbies();
  populateContactForm();
  renderAdminMessages();
}

// ----------------------------------------------------
// Navigation Tab Switching
// ----------------------------------------------------
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('bg-indigo-600', 'text-white', 'font-semibold');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'font-semibold');
      btn.classList.add('text-slate-300');
    }
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  // Update header title
  const titleMap = {
    'tab-overview': 'Dashboard Overview',
    'tab-about': 'About & Personal Branding',
    'tab-skills': 'Skills & Course Progress',
    'tab-tools': 'Tools I Use',
    'tab-experience': 'Professional Experience',
    'tab-projects': 'Projects & Case Studies',
    'tab-education': 'Education & Certifications',
    'tab-hobbies': 'Hobbies & Interests',
    'tab-contact': 'Contact Info & Messages Inbox',
    'tab-settings': 'Security & Data Management'
  };
  const titleEl = document.getElementById('current-tab-title');
  if (titleEl && titleMap[tabId]) titleEl.textContent = titleMap[tabId];
}

// ----------------------------------------------------
// 1. OVERVIEW VIEW
// ----------------------------------------------------
function renderOverview() {
  const pCount = (adminData.projects || []).length;
  const sCount = (adminData.skills || []).length;
  const tCount = (adminData.tools || []).length;
  const mCount = (adminData.messages || []).length;
  const unreadCount = (adminData.messages || []).filter(m => !m.read).length;

  document.getElementById('overview-projects-count').textContent = pCount;
  document.getElementById('overview-skills-count').textContent = sCount;
  document.getElementById('overview-tools-count').textContent = tCount;
  document.getElementById('overview-messages-count').textContent = mCount;

  const unreadBadge = document.getElementById('unread-badge');
  if (unreadBadge) unreadBadge.textContent = unreadCount;

  const about = adminData.about || {};
  document.getElementById('overview-name').textContent = about.name || 'Alex Rivera';
  document.getElementById('overview-title').textContent = about.title || 'Full Stack Developer';
  document.getElementById('overview-bio').textContent = about.bio || 'No bio entered yet.';
  const avatar = document.getElementById('overview-avatar');
  if (avatar && about.image) {
    avatar.src = about.image;
  }
}

// ----------------------------------------------------
// 2. ABOUT FORM MANAGEMENT
// ----------------------------------------------------
function populateAboutForm() {
  const about = adminData.about || {};
  document.getElementById('about-name-input').value = about.name || '';
  document.getElementById('about-title-input').value = about.title || '';
  document.getElementById('about-tagline-input').value = about.tagline || '';
  document.getElementById('about-bio-input').value = about.bio || '';
  document.getElementById('about-img-url').value = about.image || '';
  document.getElementById('about-exp-input').value = about.experienceYears || '3+';
  document.getElementById('about-proj-input').value = about.completedProjects || '25+';
  document.getElementById('about-clients-input').value = about.satisfiedClients || '20+';
  document.getElementById('about-github-input').value = about.github || '';
  document.getElementById('about-linkedin-input').value = about.linkedin || '';

  const preview = document.getElementById('about-preview-img');
  if (preview && about.image) preview.src = about.image;

  // Real-time URL preview change
  document.getElementById('about-img-url').addEventListener('input', (e) => {
    if (preview && e.target.value) preview.src = e.target.value;
  });

  // Profile photo file upload
  const fileInput = document.getElementById('about-file-upload');
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading profile image...', 'info');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        document.getElementById('about-img-url').value = data.url;
        if (preview) preview.src = data.url;
        showToast('Image uploaded successfully!', 'success');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.warn('Server upload not available, using base64 local preview...', err);
      const reader = new FileReader();
      reader.onload = function(evt) {
        document.getElementById('about-img-url').value = evt.target.result;
        if (preview) preview.src = evt.target.result;
        showToast('Image loaded locally!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  // Form Submission
  const aboutForm = document.getElementById('about-form');
  aboutForm.onsubmit = async (e) => {
    e.preventDefault();

    const updatedAbout = {
      name: document.getElementById('about-name-input').value.trim(),
      title: document.getElementById('about-title-input').value.trim(),
      tagline: document.getElementById('about-tagline-input').value.trim(),
      bio: document.getElementById('about-bio-input').value.trim(),
      image: document.getElementById('about-img-url').value.trim(),
      experienceYears: document.getElementById('about-exp-input').value.trim(),
      completedProjects: document.getElementById('about-proj-input').value.trim(),
      satisfiedClients: document.getElementById('about-clients-input').value.trim(),
      github: document.getElementById('about-github-input').value.trim(),
      linkedin: document.getElementById('about-linkedin-input').value.trim()
    };

    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAbout)
      });
      if (!res.ok) throw new Error('Failed to update about details');
      showToast('About section updated successfully!', 'success');
    } catch (err) {
      console.warn('API error, saving to local cache...', err);
      showToast('Updated locally in offline storage!', 'info');
    }

    adminData.about = updatedAbout;
    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    renderOverview();
  };
}

// ----------------------------------------------------
// 3. SKILLS & COURSE PROGRESS CRUD
// ----------------------------------------------------
function renderAdminSkills() {
  const tbody = document.getElementById('admin-skills-tbody');
  if (!tbody) return;

  const skills = adminData.skills || [];
  if (skills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-500">No skills added yet. Click "+ Add New Skill".</td></tr>`;
    return;
  }

  tbody.innerHTML = skills.map(skill => {
    const prog = Math.min(100, Math.max(0, Number(skill.progress) || 0));
    return `
      <tr class="hover:bg-slate-900/50 transition-colors">
        <td class="py-3 px-4 font-bold text-white">${escapeHTML(skill.name)}</td>
        <td class="py-3 px-4 text-xs text-slate-400">${escapeHTML(skill.course || '-')}</td>
        <td class="py-3 px-4 text-xs font-mono text-indigo-300">${escapeHTML(skill.category || 'General')}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <div class="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full" style="width: ${prog}%"></div>
            </div>
            <span class="text-xs font-mono text-cyan-400 font-bold">${prog}%</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">${escapeHTML(skill.level || 'Intermediate')}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          <button onclick="editSkill('${skill.id}')" class="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs" title="Edit Skill">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="deleteSkill('${skill.id}')" class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs" title="Delete Skill">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openSkillModal(skill = null) {
  const modal = document.getElementById('modal-skill');
  const title = document.getElementById('modal-skill-title');
  const range = document.getElementById('skill-progress-range');
  const val = document.getElementById('skill-progress-val');

  range.oninput = () => { val.textContent = range.value + '%'; };

  if (skill) {
    title.textContent = 'Edit Skill';
    document.getElementById('skill-id').value = skill.id;
    document.getElementById('skill-name').value = skill.name;
    document.getElementById('skill-course').value = skill.course || '';
    range.value = skill.progress || 50;
    val.textContent = (skill.progress || 50) + '%';
    document.getElementById('skill-level').value = skill.level || 'Intermediate';
    document.getElementById('skill-category').value = skill.category || '';
  } else {
    title.textContent = 'Add New Skill';
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-form').reset();
    range.value = 85;
    val.textContent = '85%';
  }

  modal.classList.remove('hidden');
}

function editSkill(id) {
  const skill = (adminData.skills || []).find(s => s.id === id);
  if (skill) openSkillModal(skill);
}

async function deleteSkill(id) {
  if (!confirm('Are you sure you want to delete this skill?')) return;

  try {
    const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete skill from server');
    showToast('Skill deleted successfully', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.skills = (adminData.skills || []).filter(s => s.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminSkills();
  renderOverview();
}

// ----------------------------------------------------
// 4. TOOLS I USE CRUD
// ----------------------------------------------------
function renderAdminTools() {
  const grid = document.getElementById('admin-tools-grid');
  if (!grid) return;

  const tools = adminData.tools || [];
  if (tools.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center py-6 text-slate-500">No tools configured. Click "+ Add New Tool".</div>`;
    return;
  }

  grid.innerHTML = tools.map(tool => {
    return `
      <div class="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center text-lg">
            <i class="${escapeHTML(tool.icon || 'fa-solid fa-code')}"></i>
          </div>
          <div>
            <h4 class="font-bold text-white text-sm">${escapeHTML(tool.name)}</h4>
            <span class="text-[10px] font-mono uppercase text-slate-400">${escapeHTML(tool.category || 'General')}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="editTool('${tool.id}')" class="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs" title="Edit Tool">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="deleteTool('${tool.id}')" class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs" title="Delete Tool">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openToolModal(tool = null) {
  const modal = document.getElementById('modal-tool');
  const title = document.getElementById('modal-tool-title');

  if (tool) {
    title.textContent = 'Edit Tool';
    document.getElementById('tool-id').value = tool.id;
    document.getElementById('tool-name').value = tool.name;
    document.getElementById('tool-category').value = tool.category || '';
    document.getElementById('tool-icon').value = tool.icon || 'fa-solid fa-screwdriver-wrench';
    document.getElementById('tool-desc').value = tool.description || '';
  } else {
    title.textContent = 'Add New Tool';
    document.getElementById('tool-id').value = '';
    document.getElementById('tool-form').reset();
    document.getElementById('tool-icon').value = 'fa-solid fa-screwdriver-wrench';
  }

  modal.classList.remove('hidden');
}

function editTool(id) {
  const tool = (adminData.tools || []).find(t => t.id === id);
  if (tool) openToolModal(tool);
}

async function deleteTool(id) {
  if (!confirm('Are you sure you want to delete this tool?')) return;

  try {
    const res = await fetch(`/api/tools/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Server delete failed');
    showToast('Tool deleted successfully', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.tools = (adminData.tools || []).filter(t => t.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminTools();
  renderOverview();
}

// ----------------------------------------------------
// 5. PROJECTS & CASE STUDIES CRUD
// ----------------------------------------------------
function renderAdminProjects() {
  const grid = document.getElementById('admin-projects-grid');
  if (!grid) return;

  const projects = adminData.projects || [];
  if (projects.length === 0) {
    grid.innerHTML = `<div class="col-span-2 text-center py-8 text-slate-500">No projects added yet. Click "+ Add New Project".</div>`;
    return;
  }

  grid.innerHTML = projects.map(proj => {
    const langs = Array.isArray(proj.languages) ? proj.languages : [];
    const cs = proj.caseStudy || {};
    return `
      <div class="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800">
        <div>
          <div class="h-44 w-full relative overflow-hidden bg-slate-900">
            <img src="${escapeHTML(proj.image || '')}" alt="${escapeHTML(proj.name)}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent"></div>
            <div class="absolute top-3 right-3 flex gap-2">
              <button onclick="editProject('${proj.id}')" class="p-2 rounded-lg bg-slate-900/80 backdrop-blur text-indigo-400 hover:text-white text-xs shadow-md">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="deleteProject('${proj.id}')" class="p-2 rounded-lg bg-slate-900/80 backdrop-blur text-rose-400 hover:text-white text-xs shadow-md">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="p-5 space-y-3">
            <div class="flex flex-wrap gap-1">
              ${langs.map(l => `<span class="tech-tag text-[10px] py-0.5 px-2">${escapeHTML(l)}</span>`).join('')}
            </div>
            <h4 class="font-bold text-white text-lg">${escapeHTML(proj.name)}</h4>
            <p class="text-xs text-slate-400 line-clamp-2">${escapeHTML(proj.description || '')}</p>

            <!-- Case Study Status Indicators -->
            <div class="pt-2 text-[11px] text-slate-400 flex items-center gap-3">
              <span class="flex items-center gap-1 ${cs.challenge ? 'text-emerald-400' : 'text-slate-500'}">
                <i class="fa-solid fa-circle-check text-[10px]"></i> Challenge
              </span>
              <span class="flex items-center gap-1 ${cs.approach ? 'text-emerald-400' : 'text-slate-500'}">
                <i class="fa-solid fa-circle-check text-[10px]"></i> Approach
              </span>
              <span class="flex items-center gap-1 ${cs.outcome ? 'text-emerald-400' : 'text-slate-500'}">
                <i class="fa-solid fa-circle-check text-[10px]"></i> Outcome
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>GitHub: ${proj.github ? '<span class="text-emerald-400 font-mono">Linked</span>' : '<span class="text-slate-600">None</span>'}</span>
          <button onclick="editProject('${proj.id}')" class="text-indigo-400 hover:underline font-semibold">
            Edit Details & Case Study &rarr;
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openProjectModal(project = null) {
  const modal = document.getElementById('modal-project');
  const title = document.getElementById('modal-project-title');

  if (project) {
    title.textContent = 'Edit Project & Case Study';
    document.getElementById('proj-id').value = project.id;
    document.getElementById('proj-name').value = project.name;
    document.getElementById('proj-languages').value = Array.isArray(project.languages) ? project.languages.join(', ') : (project.languages || '');
    document.getElementById('proj-image').value = project.image || '';
    document.getElementById('proj-desc').value = project.description || '';

    const cs = project.caseStudy || {};
    document.getElementById('proj-challenge').value = cs.challenge || '';
    document.getElementById('proj-approach').value = cs.approach || '';
    document.getElementById('proj-outcome').value = cs.outcome || '';

    document.getElementById('proj-github').value = project.github || '';
    document.getElementById('proj-demo').value = project.demo || '';
  } else {
    title.textContent = 'Add New Project';
    document.getElementById('proj-id').value = '';
    document.getElementById('project-form').reset();
    document.getElementById('proj-image').value = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80';
  }

  // Setup project image file upload
  const fileInput = document.getElementById('proj-image-file');
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading project preview...', 'info');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        document.getElementById('proj-image').value = data.url;
        showToast('Project image uploaded!', 'success');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.warn('Local preview for project image...', err);
      const reader = new FileReader();
      reader.onload = function(evt) {
        document.getElementById('proj-image').value = evt.target.result;
        showToast('Image loaded locally!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  modal.classList.remove('hidden');
}

function editProject(id) {
  const proj = (adminData.projects || []).find(p => p.id === id);
  if (proj) openProjectModal(proj);
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;

  try {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Server delete failed');
    showToast('Project deleted successfully', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.projects = (adminData.projects || []).filter(p => p.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminProjects();
  renderOverview();
}

// ----------------------------------------------------
// 5.5. PROFESSIONAL EXPERIENCE CRUD
// ----------------------------------------------------
function renderAdminExperience() {
  const container = document.getElementById('admin-experience-container');
  if (!container) return;

  const expList = adminData.experience || [];
  if (expList.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-slate-500">No experience entries found. Click "+ Add Experience".</div>`;
    return;
  }

  container.innerHTML = expList.map(exp => {
    const skills = Array.isArray(exp.skillsUsed) ? exp.skillsUsed : [];
    const responsibilities = Array.isArray(exp.responsibilities) ? exp.responsibilities : [];

    return `
      <div class="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 border border-slate-800">
        <div class="space-y-2 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">${escapeHTML(exp.period || '')}</span>
            ${exp.type ? `<span class="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">${escapeHTML(exp.type)}</span>` : ''}
            ${exp.location ? `<span class="text-xs text-slate-400 font-mono"><i class="fa-solid fa-location-dot text-indigo-400 mr-1"></i>${escapeHTML(exp.location)}</span>` : ''}
          </div>
          <h4 class="font-bold text-white text-lg">${escapeHTML(exp.role)}</h4>
          <div class="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-briefcase text-cyan-400"></i>
            <span>${escapeHTML(exp.company)}</span>
          </div>
          ${exp.description ? `<p class="text-xs text-slate-400 line-clamp-2">${escapeHTML(exp.description)}</p>` : ''}
          ${responsibilities.length > 0 ? `
            <div class="text-xs text-slate-400 pt-1">
              <span class="font-semibold text-slate-300">${responsibilities.length} Key Contributions recorded</span>
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div class="flex flex-wrap gap-1 pt-1">
              ${skills.map(s => `<span class="tech-tag text-[10px] py-0.5 px-2">${escapeHTML(s)}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="flex items-center gap-2 shrink-0 self-start">
          <button onclick="editExperience('${exp.id}')" class="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button onclick="deleteExperience('${exp.id}')" class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openExperienceModal(exp = null) {
  const modal = document.getElementById('modal-experience');
  const title = document.getElementById('modal-experience-title');

  if (exp) {
    title.textContent = 'Edit Professional Experience';
    document.getElementById('exp-id').value = exp.id;
    document.getElementById('exp-role').value = exp.role || '';
    document.getElementById('exp-company').value = exp.company || '';
    document.getElementById('exp-period').value = exp.period || '';
    document.getElementById('exp-type').value = exp.type || 'Full-time';
    document.getElementById('exp-location').value = exp.location || '';
    document.getElementById('exp-desc').value = exp.description || '';
    document.getElementById('exp-responsibilities').value = Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : (exp.responsibilities || '');
    document.getElementById('exp-skills').value = Array.isArray(exp.skillsUsed) ? exp.skillsUsed.join(', ') : (exp.skillsUsed || '');
  } else {
    title.textContent = 'Add Professional Experience';
    document.getElementById('exp-id').value = '';
    document.getElementById('experience-form').reset();
    document.getElementById('exp-type').value = 'Full-time';
  }

  modal.classList.remove('hidden');
}

function editExperience(id) {
  const exp = (adminData.experience || []).find(e => e.id === id);
  if (exp) openExperienceModal(exp);
}

async function deleteExperience(id) {
  if (!confirm('Are you sure you want to delete this experience entry?')) return;

  try {
    const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Server delete failed');
    showToast('Experience entry deleted successfully', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.experience = (adminData.experience || []).filter(e => e.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminExperience();
}

// ----------------------------------------------------
// 6. EDUCATION CRUD
// ----------------------------------------------------
function renderAdminEducation() {
  const container = document.getElementById('admin-edu-container');
  if (!container) return;

  const eduList = adminData.education || [];
  if (eduList.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-slate-500">No education entries found. Click "+ Add Education".</div>`;
    return;
  }

  container.innerHTML = eduList.map(edu => {
    return `
      <div class="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">${escapeHTML(edu.year || '')}</span>
            ${edu.grade ? `<span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">${escapeHTML(edu.grade)}</span>` : ''}
          </div>
          <h4 class="font-bold text-white text-base">${escapeHTML(edu.degree)}</h4>
          <div class="text-xs text-slate-400 font-medium">${escapeHTML(edu.institution)}</div>
          ${edu.details ? `<p class="text-xs text-slate-400 line-clamp-2 mt-1">${escapeHTML(edu.details)}</p>` : ''}
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button onclick="editEdu('${edu.id}')" class="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button onclick="deleteEdu('${edu.id}')" class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openEduModal(edu = null) {
  const modal = document.getElementById('modal-edu');
  const title = document.getElementById('modal-edu-title');

  if (edu) {
    title.textContent = 'Edit Education Entry';
    document.getElementById('edu-id').value = edu.id;
    document.getElementById('edu-degree').value = edu.degree;
    document.getElementById('edu-institution').value = edu.institution;
    document.getElementById('edu-year').value = edu.year || '';
    document.getElementById('edu-grade').value = edu.grade || '';
    document.getElementById('edu-details').value = edu.details || '';
  } else {
    title.textContent = 'Add Education Entry';
    document.getElementById('edu-id').value = '';
    document.getElementById('edu-form').reset();
  }

  modal.classList.remove('hidden');
}

function editEdu(id) {
  const edu = (adminData.education || []).find(e => e.id === id);
  if (edu) openEduModal(edu);
}

async function deleteEdu(id) {
  if (!confirm('Are you sure you want to delete this education entry?')) return;

  try {
    const res = await fetch(`/api/education/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Server delete failed');
    showToast('Education entry deleted successfully', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.education = (adminData.education || []).filter(e => e.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminEducation();
}

// ----------------------------------------------------
// 7. HOBBIES CRUD
// ----------------------------------------------------
function renderAdminHobbies() {
  const grid = document.getElementById('admin-hobbies-grid');
  if (!grid) return;

  const hobbies = adminData.hobbies || [];
  if (hobbies.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center py-6 text-slate-500">No hobbies listed yet. Click "+ Add Hobby".</div>`;
    return;
  }

  grid.innerHTML = hobbies.map(hobby => {
    return `
      <div class="glass-panel p-4 rounded-2xl flex items-start justify-between border border-slate-800">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-lg shrink-0">
            <i class="${escapeHTML(hobby.icon || 'fa-solid fa-heart')}"></i>
          </div>
          <div>
            <h4 class="font-bold text-white text-sm">${escapeHTML(hobby.name)}</h4>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">${escapeHTML(hobby.description || '')}</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-2">
          <button onclick="editHobby('${hobby.id}')" class="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="deleteHobby('${hobby.id}')" class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openHobbyModal(hobby = null) {
  const modal = document.getElementById('modal-hobby');
  const title = document.getElementById('modal-hobby-title');

  if (hobby) {
    title.textContent = 'Edit Hobby';
    document.getElementById('hobby-id').value = hobby.id;
    document.getElementById('hobby-name').value = hobby.name;
    document.getElementById('hobby-icon').value = hobby.icon || 'fa-solid fa-heart';
    document.getElementById('hobby-desc').value = hobby.description || '';
  } else {
    title.textContent = 'Add Hobby';
    document.getElementById('hobby-id').value = '';
    document.getElementById('hobby-form').reset();
    document.getElementById('hobby-icon').value = 'fa-solid fa-heart';
  }

  modal.classList.remove('hidden');
}

function editHobby(id) {
  const hobby = (adminData.hobbies || []).find(h => h.id === id);
  if (hobby) openHobbyModal(hobby);
}

async function deleteHobby(id) {
  if (!confirm('Are you sure you want to delete this hobby?')) return;

  try {
    const res = await fetch(`/api/hobbies/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Server delete failed');
    showToast('Hobby deleted successfully', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.hobbies = (adminData.hobbies || []).filter(h => h.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminHobbies();
}

// ----------------------------------------------------
// 8. CONTACT DETAILS & MESSAGES INBOX
// ----------------------------------------------------
function populateContactForm() {
  const contact = adminData.contact || {};
  document.getElementById('contact-email-input').value = contact.email || '';
  document.getElementById('contact-phone-input').value = contact.phone || '';
  document.getElementById('contact-loc-input').value = contact.location || '';
  document.getElementById('contact-avail-input').value = contact.availability || '';

  const form = document.getElementById('contact-info-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const updated = {
      email: document.getElementById('contact-email-input').value.trim(),
      phone: document.getElementById('contact-phone-input').value.trim(),
      location: document.getElementById('contact-loc-input').value.trim(),
      availability: document.getElementById('contact-avail-input').value.trim()
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Server error updating contact');
      showToast('Contact information saved successfully!', 'success');
    } catch (err) {
      showToast('Updated locally in offline storage!', 'info');
    }

    adminData.contact = updated;
    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  };
}

function renderAdminMessages() {
  const list = document.getElementById('admin-messages-list');
  if (!list) return;

  const messages = adminData.messages || [];
  if (messages.length === 0) {
    list.innerHTML = `<div class="text-center py-8 text-slate-500">No contact messages received yet.</div>`;
    return;
  }

  list.innerHTML = messages.map(msg => {
    return `
      <div class="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border ${msg.read ? 'border-slate-800' : 'border-cyan-500/40 bg-cyan-950/20'}">
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-3">
            <span class="font-bold text-white text-sm">${escapeHTML(msg.name)}</span>
            <a href="mailto:${escapeHTML(msg.email)}" class="text-xs text-indigo-400 hover:underline font-mono">${escapeHTML(msg.email)}</a>
            <span class="text-[11px] text-slate-500">${escapeHTML(msg.date || '')}</span>
            ${!msg.read ? `<span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase">New</span>` : ''}
          </div>
          <div class="text-xs font-semibold text-slate-300">Subject: ${escapeHTML(msg.subject || 'No Subject')}</div>
          <p class="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">${escapeHTML(msg.message)}</p>
        </div>

        <div class="flex items-center gap-2 self-end md:self-center">
          ${!msg.read ? `
            <button onclick="markMessageRead('${msg.id}')" class="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center gap-1.5">
              <i class="fa-solid fa-check"></i> Mark Read
            </button>
          ` : ''}
          <button onclick="deleteMessage('${msg.id}')" class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs" title="Delete Message">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function markMessageRead(id) {
  try {
    await fetch(`/api/messages/${id}/read`, { method: 'PUT' });
  } catch (e) {
    console.warn(e);
  }

  const msg = (adminData.messages || []).find(m => m.id === id);
  if (msg) msg.read = true;
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminMessages();
  renderOverview();
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    showToast('Message deleted', 'success');
  } catch (e) {
    showToast('Deleted locally', 'info');
  }

  adminData.messages = (adminData.messages || []).filter(m => m.id !== id);
  localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
  renderAdminMessages();
  renderOverview();
}

// ----------------------------------------------------
// 9. MODAL SUBMISSIONS (Forms Event Binding)
// ----------------------------------------------------
function initModalForms() {
  // Skill Form
  document.getElementById('skill-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('skill-id').value;
    const payload = {
      name: document.getElementById('skill-name').value.trim(),
      course: document.getElementById('skill-course').value.trim(),
      progress: Number(document.getElementById('skill-progress-range').value),
      level: document.getElementById('skill-level').value,
      category: document.getElementById('skill-category').value.trim() || 'General'
    };

    if (id) {
      // UPDATE
      try {
        const res = await fetch(`/api/skills/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');
      } catch (err) {}

      const idx = (adminData.skills || []).findIndex(s => s.id === id);
      if (idx !== -1) adminData.skills[idx] = { ...adminData.skills[idx], ...payload };
      showToast('Skill updated successfully!', 'success');
    } else {
      // CREATE
      payload.id = 'skill_' + Date.now();
      try {
        const res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Create failed');
      } catch (err) {}

      adminData.skills = adminData.skills || [];
      adminData.skills.push(payload);
      showToast('New skill added successfully!', 'success');
    }

    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    closeModal('modal-skill');
    renderAdminSkills();
    renderOverview();
  };

  // Tool Form
  document.getElementById('tool-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('tool-id').value;
    const payload = {
      name: document.getElementById('tool-name').value.trim(),
      category: document.getElementById('tool-category').value.trim() || 'General',
      icon: document.getElementById('tool-icon').value.trim() || 'fa-solid fa-code',
      description: document.getElementById('tool-desc').value.trim()
    };

    if (id) {
      // UPDATE
      try {
        await fetch(`/api/tools/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      const idx = (adminData.tools || []).findIndex(t => t.id === id);
      if (idx !== -1) adminData.tools[idx] = { ...adminData.tools[idx], ...payload };
      showToast('Tool updated successfully!', 'success');
    } else {
      // CREATE
      payload.id = 'tool_' + Date.now();
      try {
        await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      adminData.tools = adminData.tools || [];
      adminData.tools.push(payload);
      showToast('Tool added successfully!', 'success');
    }

    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    closeModal('modal-tool');
    renderAdminTools();
    renderOverview();
  };

  // Project Form (With Case Study)
  document.getElementById('project-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('proj-id').value;
    const rawLangs = document.getElementById('proj-languages').value;
    const languages = rawLangs.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name: document.getElementById('proj-name').value.trim(),
      languages: languages,
      image: document.getElementById('proj-image').value.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      description: document.getElementById('proj-desc').value.trim(),
      caseStudy: {
        challenge: document.getElementById('proj-challenge').value.trim(),
        approach: document.getElementById('proj-approach').value.trim(),
        outcome: document.getElementById('proj-outcome').value.trim()
      },
      github: document.getElementById('proj-github').value.trim() || '#',
      demo: document.getElementById('proj-demo').value.trim() || '#'
    };

    if (id) {
      // UPDATE
      try {
        await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      const idx = (adminData.projects || []).findIndex(p => p.id === id);
      if (idx !== -1) adminData.projects[idx] = { ...adminData.projects[idx], ...payload };
      showToast('Project & Case Study updated!', 'success');
    } else {
      // CREATE
      payload.id = 'proj_' + Date.now();
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      adminData.projects = adminData.projects || [];
      adminData.projects.unshift(payload);
      showToast('New Project created successfully!', 'success');
    }

    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    closeModal('modal-project');
    renderAdminProjects();
    renderOverview();
  };

  // Experience Form
  const expForm = document.getElementById('experience-form');
  if (expForm) {
    expForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('exp-id').value;
      const rawSkills = document.getElementById('exp-skills').value;
      const skills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
      const rawResp = document.getElementById('exp-responsibilities').value;
      const responsibilities = rawResp.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);

      const payload = {
        role: document.getElementById('exp-role').value.trim(),
        company: document.getElementById('exp-company').value.trim(),
        period: document.getElementById('exp-period').value.trim(),
        type: document.getElementById('exp-type').value.trim() || 'Full-time',
        location: document.getElementById('exp-location').value.trim(),
        description: document.getElementById('exp-desc').value.trim(),
        responsibilities: responsibilities,
        skillsUsed: skills
      };

      if (id) {
        // UPDATE
        try {
          await fetch(`/api/experience/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {}

        const idx = (adminData.experience || []).findIndex(e => e.id === id);
        if (idx !== -1) adminData.experience[idx] = { ...adminData.experience[idx], ...payload, id };
        showToast('Experience entry updated!', 'success');
      } else {
        // CREATE
        payload.id = 'exp_' + Date.now();
        try {
          await fetch('/api/experience', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {}

        adminData.experience = adminData.experience || [];
        adminData.experience.unshift(payload);
        showToast('New Experience entry added!', 'success');
      }

      localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
      closeModal('modal-experience');
      renderAdminExperience();
    };
  }

  // Education Form
  document.getElementById('edu-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edu-id').value;
    const payload = {
      degree: document.getElementById('edu-degree').value.trim(),
      institution: document.getElementById('edu-institution').value.trim(),
      year: document.getElementById('edu-year').value.trim(),
      grade: document.getElementById('edu-grade').value.trim(),
      details: document.getElementById('edu-details').value.trim()
    };

    if (id) {
      try {
        await fetch(`/api/education/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      const idx = (adminData.education || []).findIndex(e => e.id === id);
      if (idx !== -1) adminData.education[idx] = { ...adminData.education[idx], ...payload };
      showToast('Education updated!', 'success');
    } else {
      payload.id = 'edu_' + Date.now();
      try {
        await fetch('/api/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      adminData.education = adminData.education || [];
      adminData.education.push(payload);
      showToast('Education entry added!', 'success');
    }

    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    closeModal('modal-edu');
    renderAdminEducation();
  };

  // Hobby Form
  document.getElementById('hobby-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('hobby-id').value;
    const payload = {
      name: document.getElementById('hobby-name').value.trim(),
      icon: document.getElementById('hobby-icon').value.trim() || 'fa-solid fa-heart',
      description: document.getElementById('hobby-desc').value.trim()
    };

    if (id) {
      try {
        await fetch(`/api/hobbies/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      const idx = (adminData.hobbies || []).findIndex(h => h.id === id);
      if (idx !== -1) adminData.hobbies[idx] = { ...adminData.hobbies[idx], ...payload };
      showToast('Hobby updated!', 'success');
    } else {
      payload.id = 'hobby_' + Date.now();
      try {
        await fetch('/api/hobbies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      adminData.hobbies = adminData.hobbies || [];
      adminData.hobbies.push(payload);
      showToast('Hobby added!', 'success');
    }

    localStorage.setItem('portfolio_cache', JSON.stringify(adminData));
    closeModal('modal-hobby');
    renderAdminHobbies();
  };

  // Password Change
  const pwdForm = document.getElementById('password-form');
  if (pwdForm) {
    pwdForm.onsubmit = async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('curr-password-input').value;
      const newPassword = document.getElementById('new-password-input').value;

      try {
        const res = await fetch('/api/auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const d = await res.json();
        if (res.ok && d.success) {
          showToast('Admin password updated successfully!', 'success');
          pwdForm.reset();
        } else {
          throw new Error(d.message || 'Password update failed');
        }
      } catch (err) {
        // Fallback local change
        const localPwd = localStorage.getItem('admin_pwd') || 'admin123';
        if (currentPassword === localPwd) {
          localStorage.setItem('admin_pwd', newPassword);
          showToast('Password updated in local storage!', 'success');
          pwdForm.reset();
        } else {
          showToast(err.message || 'Current password incorrect', 'error');
        }
      }
    };
  }

  // Reset Data Button
  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Are you sure you want to restore default portfolio sample data? Current local changes will be replaced.')) {
        localStorage.removeItem('portfolio_cache');
        window.location.reload();
      }
    };
  }
}

// Modal Close Helper
function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
}

// ----------------------------------------------------
// Global Initializer
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initModalForms();

  // Tab click listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Modal backdrop close on click outside
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  // Close modals on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    }
  });
});

// Helper: Escape HTML
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
