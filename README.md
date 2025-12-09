# Schwab Job Search Agent with Claude Resume Generator

A complete system for searching Schwab software engineering jobs and generating tailored, professional LaTeX resumes using Claude AI.

## 🎯 Features

- **Job Crawler**: Indexes software engineering positions from Charles Schwab
- **SQLite Database**: Fast full-text search across job listings
- **React Frontend**: Modern UI with job search and filtering
- **Claude Prompt Generator**: Creates tailored resume prompts based on selected jobs
- **LaTeX Resume Compilation**: Automated PDF generation with pdflatex
- **Command Line Interface**: Scriptable resume generation for automation

## 📁 Project Structure

```
schwab_job_system/
├── crawler.py              # Python backend (Flask API + SQLite)
├── requirements.txt        # Python dependencies
├── generate_resume.sh      # CLI script for resume generation
├── frontend/
│   ├── package.json        # React dependencies
│   └── src/
│       └── App.js          # React frontend application
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- TexLive (for pdflatex)
- Claude CLI (optional, for automated generation)

### Backend Setup

```bash
# 1. Navigate to project directory
cd schwab_job_system

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the backend server (seeds mock data automatically)
python crawler.py --mock --serve

# Server runs at http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# Opens at http://localhost:3000
```

### LaTeX Setup (for PDF generation)

```bash
# Ubuntu/Debian
sudo apt-get install texlive-full

# macOS (with Homebrew)
brew install --cask mactex

# Windows: Download from https://miktex.org/
```

## 📖 Usage

### Web Interface

1. Open http://localhost:3000 in your browser
2. Search for jobs by technology, location, or title
3. Click a job card to select it
4. Click "Generate Resume Prompt" to create a Claude prompt
5. Copy the prompt and paste into Claude

### Command Line

```bash
# Make script executable
chmod +x generate_resume.sh

# Generate resume for a specific job
./generate_resume.sh "Software Engineer Lead" "java,python,aws,kubernetes" "Charles Schwab"

# The script will:
# 1. Create a prompt file
# 2. Call Claude CLI (if installed)
# 3. Extract LaTeX code
# 4. Compile to PDF with pdflatex
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List all jobs (use `?q=search` to filter) |
| `/api/jobs/<req_id>` | GET | Get specific job by requisition ID |
| `/api/stats` | GET | Database statistics |
| `/api/generate-prompt` | POST | Generate Claude resume prompt |

### Example API Calls

```bash
# List all jobs
curl http://localhost:5000/api/jobs

# Search for Java jobs
curl "http://localhost:5000/api/jobs?q=java"

# Get specific job
curl http://localhost:5000/api/jobs/2025-116940

# Generate prompt
curl -X POST http://localhost:5000/api/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{"job_id": "2025-116940", "profile": {"name": "John Doe"}}'
```

## 📄 Employment Timeline (from W2 Records)

The system includes verified employment history derived from W2 documents:

| Year | Employer | Location | Compensation |
|------|----------|----------|--------------|
| 2014 | TekSystems, Inc. | Saint Petersburg, FL | $85,535 |
| 2015 | TekSystems, Inc. | Saint Petersburg, FL | $93,540 |
| 2016 | TekSystems + Jabil Circuit | FL | $95,551 |
| 2017 | Jabil Inc | Tampa, FL | $102,220 |
| 2018 | Jabil Inc | St Petersburg, FL | $108,692 |
| 2019 | Jabil Inc | St Petersburg, FL | $112,948 |
| 2020 | Jabil Inc + Fisher Asset Mgmt | Portland, OR | $55,710 |
| 2021 | Fisher Asset Management LLC | Portland, OR | $154,426 |
| 2023 | ExecuSource LLC | Portland, OR | $3,498 |

**Career Trajectory:**
- 2014-2016: Contract software engineering via TekSystems
- 2016-2020: Full-time at Jabil Inc (electronics manufacturing)
- 2020-2021: Senior role at Fisher Asset Management (fintech)
- 2023: Contract/consulting work

## 🎨 Resume LaTeX Template Features

The generated LaTeX resumes include:

- **Modern Design**: Two-column layout with TikZ graphics
- **ATS-Optimized**: All text is parseable by applicant tracking systems
- **Color Scheme**: Configurable brand colors (defaults to Schwab blue #0070CD)
- **Skills Matrix**: Technology keywords highlighted
- **Professional Summary**: Tailored to target position
- **Clean Typography**: Font Awesome icons, proper spacing

## 🔧 Customization

### Edit Default Profile

In `generate_resume.sh`, update these variables:

```bash
CANDIDATE_NAME="Your Name"
CANDIDATE_EMAIL="your.email@example.com"
CANDIDATE_PHONE="(555) 123-4567"
CANDIDATE_LOCATION="City, State"
CANDIDATE_LINKEDIN="linkedin.com/in/yourprofile"
CANDIDATE_GITHUB="github.com/yourusername"
```

### Add Real Job Data

To scrape actual Schwab jobs (note: may be blocked by robots.txt):

```bash
python crawler.py --scrape --serve
```

### Modify React Styling

Edit `frontend/src/App.js` and update the `COLORS` object:

```javascript
const COLORS = {
  primary: '#0070CD',    // Change brand color
  secondary: '#00A3E0',
  accent: '#6CBE45',
  // ...
};
```

## ⚠️ Troubleshooting

### Backend Issues

```bash
# Port already in use
python crawler.py --serve --port 5001

# Database errors
rm schwab_jobs.db  # Reset database
python crawler.py --mock --serve
```

### Frontend Issues

```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# CORS errors: Ensure backend is running on port 5000
```

### LaTeX Compilation Errors

```bash
# Check compilation log
cat ~/resumes/resume_*_compile.log

# Common fixes:
# - Missing package: sudo apt-get install texlive-<package>
# - Font issues: Use standard fonts (avoid custom .ttf)
```

## 📝 License

MIT License - Feel free to modify and use for personal career development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Built with:** Python • Flask • React • SQLite • LaTeX • Claude AI
