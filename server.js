const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper functions to read and write database
function getPortfolioData() {
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    return null;
  }
}

function savePortfolioData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing portfolio data:', error);
    return false;
  }
}

// ----------------------------------------------------
// Public & Authentication Endpoints
// ----------------------------------------------------

// GET full portfolio data (sanitizes admin password)
app.get('/api/portfolio', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Could not load portfolio data' });
  
  const sanitized = { ...data };
  delete sanitized.admin; // Never send password to public
  res.json(sanitized);
});

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  if (password === (data.admin?.password || 'admin123')) {
    // Generate a basic session token
    const token = 'admin_token_' + Buffer.from(Date.now().toString()).toString('base64');
    return res.json({ success: true, token, message: 'Authentication successful' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid password. Default is admin123' });
  }
});

// Update Admin Password
app.put('/api/auth/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  if (currentPassword !== (data.admin?.password || 'admin123')) {
    return res.status(401).json({ success: false, message: 'Current password incorrect' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters' });
  }

  data.admin = { password: newPassword };
  savePortfolioData(data);
  res.json({ success: true, message: 'Password updated successfully' });
});

// Image Upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file format' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// ----------------------------------------------------
// About Section CRUD
// ----------------------------------------------------
app.put('/api/about', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  data.about = { ...data.about, ...req.body };
  savePortfolioData(data);
  res.json({ success: true, about: data.about });
});

// ----------------------------------------------------
// Skills & Course Progress CRUD
// ----------------------------------------------------
app.post('/api/skills', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const newSkill = {
    id: 'skill_' + Date.now(),
    name: req.body.name || 'New Skill',
    course: req.body.course || '',
    progress: Number(req.body.progress) || 50,
    category: req.body.category || 'General',
    level: req.body.level || 'Intermediate'
  };

  data.skills = data.skills || [];
  data.skills.push(newSkill);
  savePortfolioData(data);
  res.status(201).json({ success: true, skill: newSkill });
});

app.put('/api/skills/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const index = data.skills.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Skill not found' });

  data.skills[index] = {
    ...data.skills[index],
    ...req.body,
    id: id,
    progress: Number(req.body.progress ?? data.skills[index].progress)
  };

  savePortfolioData(data);
  res.json({ success: true, skill: data.skills[index] });
});

app.delete('/api/skills/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const initialLength = data.skills.length;
  data.skills = data.skills.filter(s => s.id !== id);

  if (data.skills.length === initialLength) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  savePortfolioData(data);
  res.json({ success: true, message: 'Skill deleted successfully' });
});

// ----------------------------------------------------
// Tools I Use CRUD
// ----------------------------------------------------
app.post('/api/tools', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const newTool = {
    id: 'tool_' + Date.now(),
    name: req.body.name || 'New Tool',
    category: req.body.category || 'General',
    icon: req.body.icon || 'fa-solid fa-screwdriver-wrench',
    description: req.body.description || ''
  };

  data.tools = data.tools || [];
  data.tools.push(newTool);
  savePortfolioData(data);
  res.status(201).json({ success: true, tool: newTool });
});

app.put('/api/tools/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const index = data.tools.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Tool not found' });

  data.tools[index] = {
    ...data.tools[index],
    ...req.body,
    id: id
  };

  savePortfolioData(data);
  res.json({ success: true, tool: data.tools[index] });
});

app.delete('/api/tools/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const initialLength = data.tools.length;
  data.tools = data.tools.filter(t => t.id !== id);

  if (data.tools.length === initialLength) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  savePortfolioData(data);
  res.json({ success: true, message: 'Tool deleted successfully' });
});

// ----------------------------------------------------
// Projects CRUD (with Case Study & GitHub Repo Link)
// ----------------------------------------------------
app.post('/api/projects', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  let langs = req.body.languages;
  if (typeof langs === 'string') {
    langs = langs.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newProject = {
    id: 'proj_' + Date.now(),
    name: req.body.name || 'Untitled Project',
    image: req.body.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    languages: Array.isArray(langs) ? langs : ['JavaScript', 'HTML5', 'CSS3'],
    description: req.body.description || '',
    caseStudy: {
      challenge: req.body.caseStudy?.challenge || req.body.challenge || '',
      approach: req.body.caseStudy?.approach || req.body.approach || '',
      outcome: req.body.caseStudy?.outcome || req.body.outcome || ''
    },
    github: req.body.github || '#',
    demo: req.body.demo || '#',
    featured: req.body.featured === true || req.body.featured === 'true'
  };

  data.projects = data.projects || [];
  data.projects.unshift(newProject);
  savePortfolioData(data);
  res.status(201).json({ success: true, project: newProject });
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const index = data.projects.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  let langs = req.body.languages;
  if (typeof langs === 'string') {
    langs = langs.split(',').map(s => s.trim()).filter(Boolean);
  }

  const existing = data.projects[index];
  data.projects[index] = {
    ...existing,
    name: req.body.name ?? existing.name,
    image: req.body.image ?? existing.image,
    languages: Array.isArray(langs) ? langs : existing.languages,
    description: req.body.description ?? existing.description,
    caseStudy: {
      challenge: req.body.caseStudy?.challenge ?? req.body.challenge ?? existing.caseStudy?.challenge ?? '',
      approach: req.body.caseStudy?.approach ?? req.body.approach ?? existing.caseStudy?.approach ?? '',
      outcome: req.body.caseStudy?.outcome ?? req.body.outcome ?? existing.caseStudy?.outcome ?? ''
    },
    github: req.body.github ?? existing.github,
    demo: req.body.demo ?? existing.demo,
    featured: req.body.featured !== undefined ? (req.body.featured === true || req.body.featured === 'true') : existing.featured,
    id: id
  };

  savePortfolioData(data);
  res.json({ success: true, project: data.projects[index] });
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const initialLength = data.projects.length;
  data.projects = data.projects.filter(p => p.id !== id);

  if (data.projects.length === initialLength) {
    return res.status(404).json({ error: 'Project not found' });
  }

  savePortfolioData(data);
  res.json({ success: true, message: 'Project deleted successfully' });
});

// ----------------------------------------------------
// Education CRUD
// ----------------------------------------------------
app.post('/api/education', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const newEdu = {
    id: 'edu_' + Date.now(),
    degree: req.body.degree || 'Degree / Course',
    institution: req.body.institution || 'Institution Name',
    year: req.body.year || '2020 - 2024',
    grade: req.body.grade || '',
    details: req.body.details || ''
  };

  data.education = data.education || [];
  data.education.push(newEdu);
  savePortfolioData(data);
  res.status(201).json({ success: true, education: newEdu });
});

app.put('/api/education/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const index = data.education.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Education entry not found' });

  data.education[index] = {
    ...data.education[index],
    ...req.body,
    id: id
  };

  savePortfolioData(data);
  res.json({ success: true, education: data.education[index] });
});

app.delete('/api/education/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  data.education = data.education.filter(e => e.id !== id);
  savePortfolioData(data);
  res.json({ success: true, message: 'Education entry deleted successfully' });
});

// ----------------------------------------------------
// Professional Experience CRUD
// ----------------------------------------------------
app.post('/api/experience', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  let skills = req.body.skillsUsed;
  if (typeof skills === 'string') {
    skills = skills.split(',').map(s => s.trim()).filter(Boolean);
  }

  let responsibilities = req.body.responsibilities;
  if (typeof responsibilities === 'string') {
    responsibilities = responsibilities.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
  }

  const newExp = {
    id: 'exp_' + Date.now(),
    role: req.body.role || 'Full Stack Developer',
    company: req.body.company || 'Company Name',
    location: req.body.location || 'Location',
    period: req.body.period || '2024 - Present',
    type: req.body.type || 'Full-time',
    description: req.body.description || '',
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    skillsUsed: Array.isArray(skills) ? skills : []
  };

  data.experience = data.experience || [];
  data.experience.unshift(newExp);
  savePortfolioData(data);
  res.status(201).json({ success: true, experience: newExp });
});

app.put('/api/experience/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const index = (data.experience || []).findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Experience entry not found' });

  let skills = req.body.skillsUsed;
  if (typeof skills === 'string') {
    skills = skills.split(',').map(s => s.trim()).filter(Boolean);
  }

  let responsibilities = req.body.responsibilities;
  if (typeof responsibilities === 'string') {
    responsibilities = responsibilities.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
  }

  data.experience[index] = {
    ...data.experience[index],
    role: req.body.role ?? data.experience[index].role,
    company: req.body.company ?? data.experience[index].company,
    location: req.body.location ?? data.experience[index].location,
    period: req.body.period ?? data.experience[index].period,
    type: req.body.type ?? data.experience[index].type,
    description: req.body.description ?? data.experience[index].description,
    responsibilities: Array.isArray(responsibilities) ? responsibilities : data.experience[index].responsibilities,
    skillsUsed: Array.isArray(skills) ? skills : data.experience[index].skillsUsed,
    id: id
  };

  savePortfolioData(data);
  res.json({ success: true, experience: data.experience[index] });
});

app.delete('/api/experience/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  data.experience = (data.experience || []).filter(e => e.id !== id);
  savePortfolioData(data);
  res.json({ success: true, message: 'Experience entry deleted successfully' });
});

// ----------------------------------------------------
// Hobbies CRUD
// ----------------------------------------------------
app.post('/api/hobbies', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const newHobby = {
    id: 'hobby_' + Date.now(),
    name: req.body.name || 'New Hobby',
    icon: req.body.icon || 'fa-solid fa-heart',
    description: req.body.description || ''
  };

  data.hobbies = data.hobbies || [];
  data.hobbies.push(newHobby);
  savePortfolioData(data);
  res.status(201).json({ success: true, hobby: newHobby });
});

app.put('/api/hobbies/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const index = data.hobbies.findIndex(h => h.id === id);
  if (index === -1) return res.status(404).json({ error: 'Hobby not found' });

  data.hobbies[index] = {
    ...data.hobbies[index],
    ...req.body,
    id: id
  };

  savePortfolioData(data);
  res.json({ success: true, hobby: data.hobbies[index] });
});

app.delete('/api/hobbies/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  data.hobbies = data.hobbies.filter(h => h.id !== id);
  savePortfolioData(data);
  res.json({ success: true, message: 'Hobby deleted successfully' });
});

// ----------------------------------------------------
// Contact Info & Messages
// ----------------------------------------------------
app.put('/api/contact', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  data.contact = { ...data.contact, ...req.body };
  savePortfolioData(data);
  res.json({ success: true, contact: data.contact });
});

// Send Message from public contact form
app.post('/api/contact/messages', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const newMessage = {
    id: 'msg_' + Date.now(),
    name,
    email,
    subject: subject || 'New Portfolio Inquiry',
    message,
    date: new Date().toLocaleString(),
    read: false
  };

  data.messages = data.messages || [];
  data.messages.unshift(newMessage);
  savePortfolioData(data);
  res.status(201).json({ success: true, message: 'Your message has been sent successfully!' });
});

// Admin get messages
app.get('/api/messages', (req, res) => {
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true, messages: data.messages || [] });
});

// Admin mark message read / delete
app.put('/api/messages/:id/read', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  const msg = (data.messages || []).find(m => m.id === id);
  if (msg) msg.read = true;
  savePortfolioData(data);
  res.json({ success: true, message: msg });
});

app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const data = getPortfolioData();
  if (!data) return res.status(500).json({ error: 'Database error' });

  data.messages = (data.messages || []).filter(m => m.id !== id);
  savePortfolioData(data);
  res.json({ success: true, message: 'Message deleted' });
});

// ----------------------------------------------------
// Page Routes (Every section in a separate page)
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/about', '/about.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/skills', '/skills.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'skills.html'));
});

app.get(['/experience', '/experience.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'experience.html'));
});

app.get(['/projects', '/projects.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'projects.html'));
});

app.get(['/education', '/education.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'education.html'));
});

app.get(['/hobbies', '/hobbies.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'hobbies.html'));
});

app.get(['/contact', '/contact.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Fallback to index.html for any other route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Portfolio Web Application is running!`);
  console.log(`🌐 Public Portfolio:  http://localhost:${PORT}`);
  console.log(`⚙️  Admin Dashboard:   http://localhost:${PORT}/admin`);
  console.log(`🔑 Default Admin Pass: admin123`);
  console.log(`=================================================`);
});
