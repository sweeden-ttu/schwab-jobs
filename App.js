import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// =============================================================================
// CONFIGURATION
// =============================================================================
const API_BASE = 'http://localhost:5000/api';

// Schwab Brand Colors
const COLORS = {
  primary: '#0070CD',      // Schwab Blue
  secondary: '#00A3E0',    // Light Blue
  accent: '#6CBE45',       // Green accent
  dark: '#1a1a1a',
  gray: '#666',
  lightGray: '#f4f6f8',
  white: '#fff',
  error: '#dc3545',
  success: '#28a745'
};

// =============================================================================
// STYLES
// =============================================================================
const styles = {
  // Layout
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.lightGray,
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
  },
  header: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
    color: COLORS.white,
    padding: '30px 40px',
    marginBottom: '30px'
  },
  headerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 600
  },
  headerSubtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    opacity: 0.9
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px 40px'
  },
  
  // Search Section
  searchSection: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '24px'
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    minWidth: '300px',
    padding: '14px 20px',
    fontSize: '16px',
    border: `2px solid ${COLORS.lightGray}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  searchInputFocus: {
    borderColor: COLORS.primary
  },
  
  // Stats
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    flexWrap: 'wrap'
  },
  statBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500
  },
  
  // Job Grid
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px'
  },
  
  // Job Card
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    border: '2px solid transparent'
  },
  jobCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    borderColor: COLORS.primary
  },
  jobCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: '#f8fff8'
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: COLORS.dark,
    margin: '0 0 12px 0',
    lineHeight: 1.3
  },
  jobMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500
  },
  badgePay: {
    backgroundColor: '#e8f4fd',
    color: COLORS.primary
  },
  badgeLocation: {
    backgroundColor: '#f0f0f0',
    color: COLORS.gray
  },
  badgeId: {
    backgroundColor: '#f3e8ff',
    color: '#7c3aed'
  },
  jobDescription: {
    fontSize: '14px',
    color: COLORS.gray,
    lineHeight: 1.5,
    marginBottom: '16px'
  },
  techTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  techTag: {
    padding: '3px 8px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase'
  },
  
  // Prompt Generator Section
  promptSection: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '24px'
  },
  promptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  promptTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: COLORS.dark,
    margin: 0
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    color: COLORS.white
  },
  buttonSecondary: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.dark,
    border: `1px solid #ddd`
  },
  buttonSuccess: {
    backgroundColor: COLORS.accent,
    color: COLORS.white
  },
  
  // Profile Form
  profileForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.gray
  },
  input: {
    padding: '10px 14px',
    border: `1px solid #ddd`,
    borderRadius: '6px',
    fontSize: '14px'
  },
  
  // Prompt Output
  promptOutput: {
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
    maxHeight: '400px',
    overflow: 'auto'
  },
  promptCode: {
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
    fontSize: '13px',
    color: '#d4d4d4',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0
  },
  
  // Command Line Section
  cliSection: {
    backgroundColor: '#2d2d2d',
    borderRadius: '8px',
    padding: '16px 20px',
    marginTop: '16px'
  },
  cliLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  cliCommand: {
    fontFamily: "'Fira Code', 'Monaco', monospace",
    fontSize: '13px',
    color: '#4ec9b0',
    backgroundColor: '#1e1e1e',
    padding: '12px 16px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  // Loading & Empty States
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    color: COLORS.gray
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: COLORS.gray
  },
  
  // Utility
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
function App() {
  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPromptSection, setShowPromptSection] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // User Profile State
  const [profile, setProfile] = useState({
    name: 'Scott D. Weeden',
    email: 'scott.weeden@email.com',
    phone: '(555) 123-4567',
    location: 'Portland, OR',
    linkedin: 'linkedin.com/in/scottweeden',
    github: 'github.com/scottweeden'
  });

  // Fetch jobs from API
  const fetchJobs = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/jobs`, {
        params: searchQuery ? { q: searchQuery } : {}
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // If API fails, show empty state
      setJobs([]);
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchJobs]);

  // Generate Claude prompt
  const generatePrompt = async () => {
    try {
      const response = await axios.post(`${API_BASE}/generate-prompt`, {
        job_id: selectedJob?.req_id,
        profile: profile
      });
      setGeneratedPrompt(response.data.prompt);
      setShowPromptSection(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Generate locally if API fails
      const localPrompt = generateLocalPrompt();
      setGeneratedPrompt(localPrompt);
      setShowPromptSection(true);
    }
  };

  // Local prompt generation fallback
  const generateLocalPrompt = () => {
    const jobInfo = selectedJob ? `
TARGET JOB:
- Title: ${selectedJob.title}
- Requisition ID: ${selectedJob.req_id}
- Location: ${selectedJob.location}
- Pay Range: ${selectedJob.pay_range}
- Technologies: ${selectedJob.tech_keywords}
- Description: ${selectedJob.description?.substring(0, 500)}...
` : '';

    return `You are an expert resume writer and LaTeX document designer. Create a professional, ATS-optimized resume.

CANDIDATE PROFILE:
- Name: ${profile.name}
- Location: ${profile.location}
- Email: ${profile.email}
- Phone: ${profile.phone}
- LinkedIn: ${profile.linkedin}
- GitHub: ${profile.github || 'N/A'}
${jobInfo}
EMPLOYMENT HISTORY (verified from W2 records):

**Fisher Asset Management LLC** | Camas, WA (Remote)
Senior Software Engineer (2020 - 2021)
- Compensation: $29K - $154K annually
- Financial technology solutions and asset management platform development
- Full-stack development with modern technologies

**Jabil Inc** | St. Petersburg, FL / Portland, OR
Software Engineer (2016 - 2020)  
- Compensation: $70K - $113K annually
- Electronics manufacturing systems development
- Enterprise software engineering and process automation
- Led technical initiatives and mentored junior developers

**TekSystems, Inc.** | Saint Petersburg, FL
Contract Software Engineer (2014 - 2016)
- Compensation: $85K - $94K annually
- Enterprise consulting engagements
- Multiple client projects across various industries

**ExecuSource LLC** | Portland, OR
Contract Engineer (2023)
- Technical consulting engagements

RESUME REQUIREMENTS:

1. **LaTeX Design:**
   - Create a unique, modern two-column or sidebar layout
   - Use TikZ for subtle visual elements
   - Apply color accents (Schwab blue #0070CD if targeting Schwab)
   - Ensure ATS-compatibility (parseable text)
   - Maximum one page

2. **Content:**
   - Professional summary highlighting 10+ years experience
   - Skills section matching target job requirements
   - Quantifiable achievements where possible
   - Education and certifications section

3. **Technical Requirements:**
   - Complete, compilable LaTeX document
   - Use standard TexLive packages only
   - Document must compile with pdflatex

After generating the LaTeX code:
1. Save as resume.tex
2. Run: pdflatex resume.tex
3. Fix any errors and recompile until successful

Generate the complete LaTeX source code now.`;
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate CLI command
  const generateCliCommand = () => {
    const escapedPrompt = generatedPrompt
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .substring(0, 500) + '...';
    
    return `claude -p "${escapedPrompt}"`;
  };

  // Render job card
  const renderJobCard = (job) => {
    const isSelected = selectedJob?.req_id === job.req_id;
    const isHovered = hoveredJob === job.req_id;
    
    return (
      <div
        key={job.req_id}
        style={{
          ...styles.jobCard,
          ...(isHovered ? styles.jobCardHover : {}),
          ...(isSelected ? styles.jobCardSelected : {})
        }}
        onClick={() => setSelectedJob(isSelected ? null : job)}
        onMouseEnter={() => setHoveredJob(job.req_id)}
        onMouseLeave={() => setHoveredJob(null)}
      >
        <h3 style={styles.jobTitle}>{job.title}</h3>
        
        <div style={styles.jobMeta}>
          <span style={{ ...styles.badge, ...styles.badgePay }}>
            {job.pay_range || 'Salary TBD'}
          </span>
          <span style={{ ...styles.badge, ...styles.badgeLocation }}>
            📍 {job.location}
          </span>
          <span style={{ ...styles.badge, ...styles.badgeId }}>
            #{job.req_id}
          </span>
        </div>
        
        <p style={styles.jobDescription}>
          {job.description?.substring(0, 200)}...
        </p>
        
        {job.tech_keywords && (
          <div style={styles.techTags}>
            {job.tech_keywords.split(',').slice(0, 6).map((tech, idx) => (
              <span key={idx} style={styles.techTag}>
                {tech.trim()}
              </span>
            ))}
          </div>
        )}
        
        {isSelected && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
            <button
              style={{ ...styles.button, ...styles.buttonSuccess, width: '100%' }}
              onClick={(e) => {
                e.stopPropagation();
                generatePrompt();
              }}
            >
              🎯 Generate Resume Prompt for This Job
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🔍 Schwab Job Search Agent</h1>
        <p style={styles.headerSubtitle}>
          Search {jobs.length} indexed software engineering positions • Generate AI-powered resume prompts
        </p>
      </header>

      <main style={styles.mainContent}>
        {/* Search Section */}
        <section style={styles.searchSection}>
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search by title, technology, or location (e.g., 'Java', 'Austin', 'Lead Engineer')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => setShowPromptSection(!showPromptSection)}
            >
              {showPromptSection ? '📋 Hide Prompt Generator' : '✨ Show Prompt Generator'}
            </button>
          </div>
          
          <div style={styles.statsRow}>
            <span style={{ ...styles.statBadge, backgroundColor: '#e8f4fd', color: COLORS.primary }}>
              📊 {jobs.length} Jobs Found
            </span>
            {selectedJob && (
              <span style={{ ...styles.statBadge, backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                ✓ Selected: {selectedJob.title}
              </span>
            )}
            {query && (
              <span style={{ ...styles.statBadge, backgroundColor: '#fff3e0', color: '#e65100' }}>
                🔎 Searching: "{query}"
              </span>
            )}
          </div>
        </section>

        {/* Prompt Generator Section */}
        {showPromptSection && (
          <section style={styles.promptSection}>
            <div style={styles.promptHeader}>
              <h2 style={styles.promptTitle}>🤖 Claude Resume Prompt Generator</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onClick={() => setGeneratedPrompt('')}
                >
                  Clear
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={generatePrompt}
                  disabled={!selectedJob}
                >
                  {selectedJob ? '🎯 Generate for Selected Job' : 'Select a Job First'}
                </button>
              </div>
            </div>

            {/* Profile Form */}
            <div style={styles.profileForm}>
              {Object.entries(profile).map(([key, value]) => (
                <div key={key} style={styles.formGroup}>
                  <label style={styles.label}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    style={styles.input}
                  />
                </div>
              ))}
            </div>

            {/* Generated Prompt Output */}
            {generatedPrompt && (
              <>
                <div style={styles.promptOutput}>
                  <pre style={styles.promptCode}>{generatedPrompt}</pre>
                </div>

                {/* Copy Button */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button
                    style={{ 
                      ...styles.button, 
                      ...styles.buttonSuccess,
                      flex: 1
                    }}
                    onClick={() => copyToClipboard(generatedPrompt)}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy Full Prompt'}
                  </button>
                </div>

                {/* CLI Command Section */}
                <div style={styles.cliSection}>
                  <div style={styles.cliLabel}>Command Line (Claude CLI)</div>
                  <div style={styles.cliCommand}>
                    <code>claude --prompt "$(cat resume_prompt.txt)"</code>
                    <button
                      style={{ 
                        ...styles.button, 
                        ...styles.buttonSecondary,
                        padding: '6px 12px',
                        fontSize: '12px'
                      }}
                      onClick={() => copyToClipboard('claude --prompt "$(cat resume_prompt.txt)"')}
                    >
                      Copy
                    </button>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#888' }}>
                    💡 Save the prompt to <code>resume_prompt.txt</code> and run the command above, or paste directly into Claude.
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Job Listings */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div>Loading jobs... ⏳</div>
          </div>
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No jobs found</h3>
            <p>Try adjusting your search query or clearing the filter.</p>
          </div>
        ) : (
          <div style={styles.jobGrid}>
            {jobs.map(renderJobCard)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '30px', 
        color: COLORS.gray,
        fontSize: '13px',
        borderTop: '1px solid #e0e0e0',
        marginTop: '40px'
      }}>
        <p>
          Schwab Job Search Agent • Built with React + Flask + SQLite
          <br />
          <span style={{ opacity: 0.7 }}>
            Employment data derived from W2 records (2014-2023)
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
