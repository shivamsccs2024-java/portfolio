# Modern Full Stack Developer Portfolio with Admin Management Dashboard

A modern, responsive, and full-featured portfolio website designed for a **Full Stack Developer**, paired with a comprehensive **Admin Control Panel** for live content management (Add, Update, Delete) without touching code.

---

## 🌟 Multi-Page Structure

Every section now lives on its own dedicated page with consistent navigation, rich content, and full responsiveness:

| Section Page | Route / File | Key Content & Features |
| :--- | :--- | :--- |
| **About** | `/` or `index.html` | Profile Photo, Full Name, Title (**Full Stack Developer**), Details About Me (Bio narrative), Experience Metrics, Social Links. |
| **Skills & Tools** | `/skills` or `skills.html` | **Skills and Course Progress** with animated mastery progress bars ($0-100\%$) and **Tools I Use** (VS Code, Git, Docker, Postman, etc.). |
| **Experience** | `/experience` or `experience.html` | **Professional Experience** timeline with role, company, employment type, location, key contributions, and technologies used. |
| **Projects** | `/projects` or `projects.html` | Preview Images, Project Names, Languages Used badges, Descriptions, **Read Case Study** interactive modal (**Challenge**, **Approach**, **Outcome**), GitHub Repo links & Demos. |
| **Education** | `/education` or `education.html` | Academic degrees, institutions (e.g. Besant Technologies), timelines, grade/CGPA honors badges, and key coursework. |
| **Hobbies** | `/hobbies` or `hobbies.html` | Creative pursuits beyond code (Open Source, Tech Blogging, Algorithmic Puzzles, UI/UX, Photography, Music). |
| **Contact** | `/contact` or `contact.html` | Email-id, Mobile number, Location, and functional **Send a Message** form with instant backend inbox delivery. |
| **Admin Panel** | `/admin` or `admin.html` | Password-protected control panel for live **Add**, **Update**, and **Delete** changes across all sections & pages. |

---

### ⚙️ Admin Control Panel (`/admin` or `admin.html`)
- **Authentication**: Password protected (Default password: `admin123`).
- **Dashboard Overview**: Quick statistics on total projects, active skills, tools, and unread messages.
- **About Management**: Edit your name, title, bio, stats, and upload new profile photos or supply image URLs.
- **Skills CRUD**: Add, update, and delete skills, course titles, levels, and progress percentages (0-100%).
- **Tools CRUD**: Add, update, and delete developer tools with FontAwesome icons and descriptions.
- **Projects CRUD**: Add, update, and delete projects with preview image uploads, languages list, description, GitHub repo link, demo link, and complete 3-part case studies (**Challenge**, **Approach**, **Outcome**).
- **Education CRUD**: Add, update, and delete degrees, schools, timelines, and grades.
- **Hobbies CRUD**: Add, update, and delete hobbies and icon choices.
- **Contact & Inbox**: Update contact details and review messages submitted through the portfolio's contact form.
- **Security & Data**: Change the admin password and easily reset to default sample data at any time.

---

## 🚀 How to Run the Website

### Option 1: Run with Node.js & Express (Recommended for full backend & sync)

1. Open PowerShell or Command Prompt in this folder:
   ```bash
   cd "d:\BESANT TECHNOLOGY\portfolio"
   ```
2. Start the server:
   ```bash
   npm start
   ```
   *(or `node server.js`)*

3. Open your browser:
   - **Public Portfolio**: [http://localhost:3000](http://localhost:3000)
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Default Admin Password**: `admin123`

---

### Option 2: Run directly in Browser (Standalone Offline / Static Mode)
Both `public/index.html` and `public/admin.html` feature built-in hybrid storage fallback:
- Simply open `d:\BESANT TECHNOLOGY\portfolio\public\index.html` or `d:\BESANT TECHNOLOGY\portfolio\public\admin.html` directly in Google Chrome, Edge, or Firefox.
- Changes made in the Admin page will be saved directly into browser storage (`localStorage`).

---

## 📁 Project Structure

```
d:\BESANT TECHNOLOGY\portfolio\
├── data/
│   └── portfolio.json         # Persistent JSON database (About, Skills, Tools, Projects, Education, Hobbies, Messages)
├── public/
│   ├── css/
│   │   └── style.css          # Modern glassmorphism, animations, glowing orbs, custom scrollbars
│   ├── js/
│   │   ├── portfolio.js       # Client rendering, Case Study modal popup, contact form handler
│   │   └── admin.js           # Full CRUD controller, image upload, auth, modal management
│   ├── uploads/               # Stored image uploads for profile and project previews
│   ├── index.html             # Main Public Portfolio Website
│   └── admin.html             # Admin Management Dashboard
├── package.json               # Node.js project manifest & scripts
├── server.js                  # Express REST API server with Multer uploads & JSON database
└── README.md                  # Comprehensive Documentation
```

---

## 🔒 Security Note
To change the default admin password:
1. Log in to `/admin` with `admin123`.
2. Click on the **Security & Data** tab in the sidebar.
3. Enter `admin123` as current password, enter your desired new password, and click **Update Password**.
