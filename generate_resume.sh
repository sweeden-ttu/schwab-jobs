#!/bin/bash
# =============================================================================
# CLAUDE RESUME GENERATOR - Command Line Template
# =============================================================================
# This script generates a professional LaTeX resume using Claude and compiles it.
#
# Usage:
#   ./generate_resume.sh [job_title] [job_tech_keywords]
#
# Examples:
#   ./generate_resume.sh "Software Engineer Lead" "java,python,aws,kubernetes"
#   ./generate_resume.sh "Full Stack Developer" "react,typescript,node"
#
# Requirements:
#   - Claude CLI installed (claude)
#   - TexLive installed (pdflatex)
#   - jq for JSON parsing (optional)
# =============================================================================

# Configuration - EDIT THESE VALUES
CANDIDATE_NAME="Scott D. Weeden"
CANDIDATE_EMAIL="scott.weeden@email.com"
CANDIDATE_PHONE="(555) 123-4567"
CANDIDATE_LOCATION="Portland, OR"
CANDIDATE_LINKEDIN="linkedin.com/in/scottweeden"
CANDIDATE_GITHUB="github.com/scottweeden"

# Target job details (can be overridden via arguments)
JOB_TITLE="${1:-Software Engineer}"
JOB_TECH="${2:-java,python,react,aws}"
JOB_COMPANY="${3:-Charles Schwab}"

# Output directory
OUTPUT_DIR="${HOME}/resumes"
mkdir -p "$OUTPUT_DIR"

# Generate timestamp for unique filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_BASE="${OUTPUT_DIR}/resume_${TIMESTAMP}"

# =============================================================================
# PROMPT TEMPLATE
# =============================================================================
generate_prompt() {
    cat << 'PROMPT_EOF'
You are an expert resume writer and LaTeX document designer. Create a professional, ATS-optimized resume using LaTeX with a unique, modern design.

===== CANDIDATE PROFILE =====
Name: CANDIDATE_NAME_PLACEHOLDER
Location: CANDIDATE_LOCATION_PLACEHOLDER
Email: CANDIDATE_EMAIL_PLACEHOLDER
Phone: CANDIDATE_PHONE_PLACEHOLDER
LinkedIn: CANDIDATE_LINKEDIN_PLACEHOLDER
GitHub: CANDIDATE_GITHUB_PLACEHOLDER

===== TARGET POSITION =====
Company: JOB_COMPANY_PLACEHOLDER
Title: JOB_TITLE_PLACEHOLDER
Key Technologies: JOB_TECH_PLACEHOLDER

===== EMPLOYMENT HISTORY (W2 Verified) =====

**Fisher Asset Management LLC** | Camas, WA (Remote from Portland, OR)
Senior Software Engineer | 2020 - 2021
- Total Compensation: $29K - $154K annually (significant year-over-year growth)
- Built and maintained financial technology solutions for asset management platform
- Full-stack development using modern web technologies
- Collaborated with investment teams on data-driven solutions
- Participated in retirement plan (Box 12 Code D contributions)

**Jabil Inc** | St. Petersburg, FL → Portland, OR
Software Engineer | 2016 - 2020
- Total Compensation: $70K - $113K annually (consistent growth)
- Electronics manufacturing enterprise software development
- Led technical initiatives for process automation
- Migrated from Florida office to remote Portland position (2019-2020)
- Active retirement plan participant
- Progressed from mid-level to senior responsibilities

**TekSystems, Inc.** | Saint Petersburg, FL
Contract Software Engineer | 2014 - 2016
- Total Compensation: $85K - $94K annually
- Enterprise consulting engagements across multiple clients
- Delivered solutions for Fortune 500 companies
- Gained diverse industry experience through contract work
- Active retirement plan participant (Box 12 Code D)

**ExecuSource LLC** | Portland, OR
Contract Engineer | 2023
- Technical consulting engagement
- Short-term project work

===== SKILLS SUMMARY =====
Based on 10+ years experience:
- Languages: Java, Python, JavaScript/TypeScript, SQL
- Frameworks: Spring Boot, React, Node.js, Django/FastAPI
- Cloud: AWS (EC2, S3, Lambda), Azure, GCP
- DevOps: Docker, Kubernetes, Jenkins, Terraform, CI/CD
- Data: PostgreSQL, MongoDB, Redis, Kafka, Spark
- Financial: Trading systems, asset management, fintech

===== RESUME REQUIREMENTS =====

1. **LaTeX Design Requirements:**
   - Create a UNIQUE layout (not standard moderncv/europecv templates)
   - Use custom TikZ elements for visual interest
   - Implement a modern two-column or sidebar design
   - Apply color scheme: Primary #0070CD (Schwab Blue), Accent #6CBE45
   - Ensure text is ATS-parseable (no text-in-images)
   - Single page maximum

2. **Content Strategy:**
   - Lead with professional summary (3-4 lines)
   - Emphasize technologies matching the target job
   - Use strong action verbs and quantifiable achievements
   - Include certifications/education section
   - Add technical skills matrix or keyword cloud

3. **LaTeX Technical Requirements:**
   - Use ONLY standard TexLive packages
   - Required packages: geometry, tikz, fontawesome5, xcolor, hyperref
   - Must compile with pdflatex (no XeLaTeX dependencies)
   - Include proper escaping for special characters
   - No external font files

4. **Output Instructions:**
   - Provide complete, compilable .tex file
   - Include all package imports at top
   - Add comments for customization points
   - Test compilation mentally before output

===== OUTPUT FORMAT =====
Return ONLY the complete LaTeX source code, wrapped in ```latex code blocks.
No explanations before or after - just the compilable code.

Generate the LaTeX resume now:
PROMPT_EOF
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

echo "=============================================="
echo "  CLAUDE RESUME GENERATOR"
echo "=============================================="
echo "Target: $JOB_TITLE at $JOB_COMPANY"
echo "Technologies: $JOB_TECH"
echo "Output: ${OUTPUT_BASE}.pdf"
echo ""

# Generate the prompt with substitutions
PROMPT=$(generate_prompt | \
    sed "s/CANDIDATE_NAME_PLACEHOLDER/$CANDIDATE_NAME/g" | \
    sed "s/CANDIDATE_EMAIL_PLACEHOLDER/$CANDIDATE_EMAIL/g" | \
    sed "s/CANDIDATE_PHONE_PLACEHOLDER/$CANDIDATE_PHONE/g" | \
    sed "s/CANDIDATE_LOCATION_PLACEHOLDER/$CANDIDATE_LOCATION/g" | \
    sed "s/CANDIDATE_LINKEDIN_PLACEHOLDER/$CANDIDATE_LINKEDIN/g" | \
    sed "s/CANDIDATE_GITHUB_PLACEHOLDER/$CANDIDATE_GITHUB/g" | \
    sed "s/JOB_TITLE_PLACEHOLDER/$JOB_TITLE/g" | \
    sed "s/JOB_TECH_PLACEHOLDER/$JOB_TECH/g" | \
    sed "s/JOB_COMPANY_PLACEHOLDER/$JOB_COMPANY/g")

# Save the prompt for reference
echo "$PROMPT" > "${OUTPUT_BASE}_prompt.txt"
echo "✓ Prompt saved to: ${OUTPUT_BASE}_prompt.txt"

# =============================================================================
# OPTION 1: Use Claude CLI (if installed)
# =============================================================================
if command -v claude &> /dev/null; then
    echo ""
    echo "Generating resume with Claude CLI..."
    
    # Call Claude and extract LaTeX code
    RESPONSE=$(claude --print "$PROMPT" 2>/dev/null)
    
    # Extract code between ```latex and ``` markers
    LATEX_CODE=$(echo "$RESPONSE" | sed -n '/```latex/,/```/p' | sed '1d;$d')
    
    if [ -n "$LATEX_CODE" ]; then
        echo "$LATEX_CODE" > "${OUTPUT_BASE}.tex"
        echo "✓ LaTeX source saved to: ${OUTPUT_BASE}.tex"
        
        # Compile with pdflatex
        echo ""
        echo "Compiling with pdflatex..."
        cd "$OUTPUT_DIR"
        
        # Run pdflatex up to 3 times (for references/toc)
        for i in 1 2 3; do
            echo "  Pass $i..."
            pdflatex -interaction=nonstopmode "${OUTPUT_BASE}.tex" > "${OUTPUT_BASE}_compile.log" 2>&1
            
            if [ $? -eq 0 ]; then
                echo "✓ Compilation successful!"
                break
            else
                echo "  Warning: Compilation had issues (check log)"
            fi
        done
        
        # Check if PDF was created
        if [ -f "${OUTPUT_BASE}.pdf" ]; then
            echo ""
            echo "=============================================="
            echo "  SUCCESS!"
            echo "=============================================="
            echo "Resume PDF: ${OUTPUT_BASE}.pdf"
            echo "LaTeX Source: ${OUTPUT_BASE}.tex"
            echo "Compile Log: ${OUTPUT_BASE}_compile.log"
            
            # Clean up auxiliary files
            rm -f "${OUTPUT_BASE}.aux" "${OUTPUT_BASE}.log" "${OUTPUT_BASE}.out" 2>/dev/null
        else
            echo ""
            echo "⚠ PDF generation failed. Check compile log:"
            echo "  ${OUTPUT_BASE}_compile.log"
        fi
    else
        echo "⚠ Could not extract LaTeX code from Claude response."
        echo "Full response saved to: ${OUTPUT_BASE}_response.txt"
        echo "$RESPONSE" > "${OUTPUT_BASE}_response.txt"
    fi
else
    # =============================================================================
    # OPTION 2: Manual workflow (Claude CLI not available)
    # =============================================================================
    echo ""
    echo "=============================================="
    echo "  MANUAL WORKFLOW"
    echo "=============================================="
    echo ""
    echo "Claude CLI not found. Follow these steps:"
    echo ""
    echo "1. Copy the prompt from: ${OUTPUT_BASE}_prompt.txt"
    echo ""
    echo "2. Paste into Claude (claude.ai or API) and get LaTeX code"
    echo ""
    echo "3. Save the LaTeX code to: ${OUTPUT_BASE}.tex"
    echo ""
    echo "4. Compile with:"
    echo "   cd $OUTPUT_DIR"
    echo "   pdflatex ${OUTPUT_BASE}.tex"
    echo ""
    echo "5. If compilation errors, fix and repeat step 4"
    echo ""
    
    # Also provide curl command for API users
    echo "=============================================="
    echo "  ALTERNATIVE: Use Anthropic API directly"
    echo "=============================================="
    echo ""
    echo 'export ANTHROPIC_API_KEY="your-api-key"'
    echo ""
    echo "curl https://api.anthropic.com/v1/messages \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -H 'x-api-key: \$ANTHROPIC_API_KEY' \\"
    echo "  -H 'anthropic-version: 2023-06-01' \\"
    echo "  -d '{\"model\":\"claude-sonnet-4-20250514\",\"max_tokens\":4096,\"messages\":[{\"role\":\"user\",\"content\":\"<prompt from file>\"}]}'"
fi

echo ""
echo "Done."
