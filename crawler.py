#!/usr/bin/env python3
"""
Schwab Job Crawler & API Server
================================
Scrapes job listings from schwabjobs.com, indexes them in SQLite,
and provides a REST API for the React frontend.

Usage:
    python crawler.py [--scrape] [--serve]
    
    --scrape : Run the web scraper to fetch and index jobs
    --serve  : Start the Flask API server
    
If no flags provided, runs both scrape and serve.
"""

import sqlite3
import json
import re
import sys
import time
import argparse
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from flask import Flask, jsonify, request
from flask_cors import CORS

# For web scraping - using requests + BeautifulSoup as fallback
import requests
from bs4 import BeautifulSoup

# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class JobListing:
    """Represents a single job posting from Schwab"""
    req_id: str
    title: str
    location: str
    category: str
    pay_range: str
    position_type: str
    deadline: str
    description: str
    qualifications: str
    url: str
    scraped_at: str
    
    # Extracted technology keywords for search
    tech_keywords: str = ""
    
    def to_dict(self) -> dict:
        return asdict(self)

# =============================================================================
# DATABASE LAYER
# =============================================================================

DB_NAME = 'schwab_jobs.db'

def init_db() -> sqlite3.Connection:
    """Initialize SQLite database with job listings schema"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            req_id TEXT UNIQUE,
            title TEXT NOT NULL,
            location TEXT,
            category TEXT,
            pay_range TEXT,
            position_type TEXT,
            deadline TEXT,
            description TEXT,
            qualifications TEXT,
            url TEXT,
            tech_keywords TEXT,
            scraped_at TEXT,
            
            -- Full-text search columns
            search_blob TEXT
        )
    ''')
    
    # Create FTS virtual table for fast searching
    conn.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
            title, description, qualifications, tech_keywords, location,
            content='jobs',
            content_rowid='id'
        )
    ''')
    
    # Index for faster lookups
    conn.execute('CREATE INDEX IF NOT EXISTS idx_req_id ON jobs(req_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_category ON jobs(category)')
    
    conn.commit()
    return conn

def save_job(conn: sqlite3.Connection, job: JobListing) -> bool:
    """Save a job listing to the database (upsert)"""
    try:
        cursor = conn.cursor()
        
        # Create combined search blob
        search_blob = f"{job.title} {job.description} {job.qualifications} {job.tech_keywords} {job.location}"
        
        cursor.execute('''
            INSERT INTO jobs (req_id, title, location, category, pay_range, 
                            position_type, deadline, description, qualifications,
                            url, tech_keywords, scraped_at, search_blob)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(req_id) DO UPDATE SET
                title=excluded.title,
                location=excluded.location,
                pay_range=excluded.pay_range,
                description=excluded.description,
                qualifications=excluded.qualifications,
                scraped_at=excluded.scraped_at,
                tech_keywords=excluded.tech_keywords,
                search_blob=excluded.search_blob
        ''', (job.req_id, job.title, job.location, job.category, job.pay_range,
              job.position_type, job.deadline, job.description, job.qualifications,
              job.url, job.tech_keywords, job.scraped_at, search_blob))
        
        conn.commit()
        
        # Update FTS index
        cursor.execute('''
            INSERT INTO jobs_fts(rowid, title, description, qualifications, tech_keywords, location)
            VALUES (last_insert_rowid(), ?, ?, ?, ?, ?)
        ''', (job.title, job.description, job.qualifications, job.tech_keywords, job.location))
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error saving job {job.req_id}: {e}")
        return False

def get_all_jobs(conn: sqlite3.Connection) -> List[dict]:
    """Retrieve all jobs from database"""
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs ORDER BY scraped_at DESC')
    return [dict(row) for row in cursor.fetchall()]

def search_jobs(conn: sqlite3.Connection, query: str) -> List[dict]:
    """Search jobs using full-text search"""
    cursor = conn.cursor()
    
    # Escape special FTS characters
    safe_query = query.replace('"', '').replace("'", "")
    
    cursor.execute('''
        SELECT j.* FROM jobs j
        INNER JOIN jobs_fts fts ON j.id = fts.rowid
        WHERE jobs_fts MATCH ?
        ORDER BY rank
    ''', (safe_query + '*',))
    
    return [dict(row) for row in cursor.fetchall()]

def search_jobs_simple(conn: sqlite3.Connection, query: str) -> List[dict]:
    """Fallback simple LIKE search"""
    cursor = conn.cursor()
    query_pattern = f"%{query.lower()}%"
    
    cursor.execute('''
        SELECT * FROM jobs 
        WHERE lower(title) LIKE ? 
           OR lower(description) LIKE ?
           OR lower(tech_keywords) LIKE ?
           OR lower(location) LIKE ?
        ORDER BY scraped_at DESC
    ''', (query_pattern, query_pattern, query_pattern, query_pattern))
    
    return [dict(row) for row in cursor.fetchall()]

# =============================================================================
# WEB SCRAPER
# =============================================================================

# Technology keywords to extract from job descriptions
TECH_KEYWORDS = [
    # Languages
    'java', 'python', 'javascript', 'typescript', 'c#', 'c++', 'go', 'rust',
    'ruby', 'scala', 'kotlin', 'swift', 'php', 'perl', 'r',
    
    # Frameworks
    'react', 'angular', 'vue', 'node.js', 'nodejs', 'spring', 'django', 'flask',
    '.net', 'dotnet', 'express', 'fastapi', 'rails', 'nextjs', 'next.js',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'kubernetes', 'k8s', 'docker',
    'terraform', 'jenkins', 'ci/cd', 'ansible', 'cloudformation',
    
    # Databases
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'oracle', 'dynamodb', 'cassandra', 'snowflake', 'databricks',
    
    # Big Data & ML
    'spark', 'hadoop', 'kafka', 'airflow', 'machine learning', 'ml',
    'ai', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
    
    # Financial/Trading
    'fix protocol', 'trading', 'risk management', 'fintech', 'securities',
    'order management', 'market data', 'algorithmic trading',
    
    # Other
    'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum', 'git'
]

def extract_tech_keywords(text: str) -> str:
    """Extract technology keywords from job description"""
    text_lower = text.lower()
    found = []
    
    for keyword in TECH_KEYWORDS:
        # Use word boundary matching
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            found.append(keyword)
    
    return ', '.join(sorted(set(found)))

def parse_job_listing_page(html: str, url: str) -> Optional[JobListing]:
    """Parse a single job listing page"""
    soup = BeautifulSoup(html, 'html.parser')
    
    try:
        # Title
        title_elem = soup.find('h1')
        title = title_elem.text.strip() if title_elem else "Unknown Position"
        
        # Requisition ID
        req_id_elem = soup.find('span', class_='job-id') or soup.find(string=re.compile(r'Requisition ID'))
        if req_id_elem:
            req_id_text = req_id_elem.text if hasattr(req_id_elem, 'text') else str(req_id_elem)
            req_id_match = re.search(r'(\d{4}-\d+)', req_id_text)
            req_id = req_id_match.group(1) if req_id_match else f"UNKNOWN-{int(time.time())}"
        else:
            req_id = f"UNKNOWN-{int(time.time())}"
        
        # Pay Range
        pay_elem = soup.find('span', class_='job-salary') or soup.find(string=re.compile(r'Pay range'))
        if pay_elem:
            pay_text = pay_elem.text if hasattr(pay_elem, 'text') else str(pay_elem)
            pay_range = re.sub(r'Pay range\s*', '', pay_text).strip()
        else:
            pay_range = "Not Specified"
        
        # Location
        location_elem = soup.find('span', class_='job-location')
        location = location_elem.text.strip() if location_elem else "Multiple Locations"
        
        # Description
        desc_elem = soup.find('div', class_='ats-description') or soup.find('div', class_='job-description')
        description = desc_elem.text.strip() if desc_elem else ""
        
        # Extract qualifications section
        qual_match = re.search(r'(Required|Minimum)\s*Qualifications?[:\s]*(.*?)(?=Preferred|What you|$)', 
                              description, re.IGNORECASE | re.DOTALL)
        qualifications = qual_match.group(2).strip() if qual_match else ""
        
        # Category
        category = "Engineering & Software Development"
        
        # Position Type
        position_type = "Regular"
        
        # Deadline
        deadline_match = re.search(r'deadline[:\s]*(\d{4}-\d{2}-\d{2})', html, re.IGNORECASE)
        deadline = deadline_match.group(1) if deadline_match else ""
        
        # Extract tech keywords
        combined_text = f"{title} {description} {qualifications}"
        tech_keywords = extract_tech_keywords(combined_text)
        
        return JobListing(
            req_id=req_id,
            title=title,
            location=location,
            category=category,
            pay_range=pay_range,
            position_type=position_type,
            deadline=deadline,
            description=description[:2000],  # Truncate for DB
            qualifications=qualifications[:1000],
            url=url,
            tech_keywords=tech_keywords,
            scraped_at=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error parsing job page: {e}")
        return None

def get_job_listing_urls(base_url: str, max_pages: int = 4) -> List[str]:
    """Get all job listing URLs from search results pages"""
    urls = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    for page in range(1, max_pages + 1):
        try:
            page_url = f"{base_url}/{page}" if page > 1 else base_url
            print(f"Fetching listing page {page}: {page_url}")
            
            resp = requests.get(page_url, headers=headers, timeout=30)
            if resp.status_code != 200:
                print(f"  Got status {resp.status_code}, stopping pagination")
                break
                
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # Find job links - adjust selector based on actual page structure
            job_links = soup.find_all('a', href=re.compile(r'/job/'))
            
            for link in job_links:
                href = link.get('href')
                if href and '/job/' in href:
                    full_url = f"https://www.schwabjobs.com{href}" if not href.startswith('http') else href
                    if full_url not in urls:
                        urls.append(full_url)
            
            print(f"  Found {len(job_links)} job links on page {page}")
            time.sleep(1)  # Rate limiting
            
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break
    
    return urls

def scrape_job(url: str) -> Optional[JobListing]:
    """Scrape a single job listing"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code == 200:
            return parse_job_listing_page(resp.text, url)
    except Exception as e:
        print(f"Error scraping {url}: {e}")
    
    return None

# =============================================================================
# MOCK DATA FOR TESTING (when scraping is blocked)
# =============================================================================

MOCK_SCHWAB_JOBS = [
    JobListing(
        req_id="2025-116940",
        title="Software Engineer - Full Stack",
        location="Southlake, TX ; Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $145,000.00 - $158,000.00 / Year",
        position_type="Regular",
        deadline="2025-11-18",
        description="At Schwab, you're empowered to make an impact on your career. Wealth and Advice Solutions Technology (WAS Tech) supports technology needs of WAS business. Looking for full stack engineers with React, Java, Spring Boot experience.",
        qualifications="3+ years Java, React, Spring Boot, REST APIs, AWS or Azure cloud experience",
        url="https://www.schwabjobs.com/job/southlake/software-engineer-full-stack/33727/88352728608",
        tech_keywords="java, react, spring, aws, azure, rest, api",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-116938",
        title="Software Engineer Lead - Full Stack",
        location="Southlake, TX ; Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $150,000.00 - $200,000.00 / Year",
        position_type="Regular",
        deadline="2025-11-18",
        description="Lead a team of software engineers building wealth management solutions. Requires strong technical leadership, mentoring abilities, and hands-on development skills in modern tech stack.",
        qualifications="7+ years software engineering, 3+ years technical leadership, Java, Python, React, microservices architecture",
        url="https://www.schwabjobs.com/job/southlake/software-engineer-lead-full-stack/33727/88352728640",
        tech_keywords="java, python, react, microservices, aws, kubernetes",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-117395",
        title="Java Software Engineer",
        location="Ann Arbor, MI",
        category="Engineering & Software Development",
        pay_range="USD $110,100.00 - $180,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-22",
        description="Software Engineer to contribute to new generation order management system driving significant revenue for Schwab. Perform complex software design tasks on highly scalable and performant trading system.",
        qualifications="5+ years Java development, experience with order management or trading systems, SQL, REST APIs, message queues (Kafka)",
        url="https://www.schwabjobs.com/job/ann-arbor/java-software-engineer/33727/89200389584",
        tech_keywords="java, sql, kafka, trading, order management, rest, api",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-117290",
        title="Software Engineer II",
        location="Southlake, TX ; Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $49.52 - $60.10 / Hour",
        position_type="Regular",
        deadline="2025-11-28",
        description="WAS Tech Organization supporting Schwab Asset Management Solutions. Work on mutual funds, ETFs, managed accounts, and insurance platforms. Modern development practices with CI/CD.",
        qualifications="3+ years software development, Java or Python, SQL, Agile methodology, unit testing",
        url="https://www.schwabjobs.com/job/southlake/software-engineer-ii/33727/88679953280",
        tech_keywords="java, python, sql, agile, ci/cd",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-117674",
        title="Full Stack Software Engineer",
        location="Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $132,000.00 - $149,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-15",
        description="Join enterprise data solutions team managing over 4 petabytes of data. Build next-generation analytics platform for leading financial firm with over $10 trillion in assets under management. Design streaming real-time and batch ETL workflows.",
        qualifications="5+ years data engineering, Spark, Databricks, Snowflake, Python, SQL, streaming architectures (Kafka)",
        url="https://www.schwabjobs.com/job/southlake/full-stack-software-engineer/33727/89204546160",
        tech_keywords="python, sql, spark, kafka, databricks, snowflake, etl, hadoop",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118001",
        title="Sr. Java Developer/Data Engineer",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $140,000.00 - $175,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-30",
        description="Design and maintain optimal programming environments for data processing. Work with technical and business partners on complex data solutions.",
        qualifications="7+ years Java, experience with data pipelines, Spring Boot, Kafka, SQL/NoSQL databases",
        url="https://www.schwabjobs.com/job/austin/sr-java-developer-data-engineer/33727/89300001234",
        tech_keywords="java, spring, kafka, sql, nosql, data engineering",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118002",
        title="AI Security Developer",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $160,000.00 - $195,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-28",
        description="Specialized group within SCS responsible for securing the design, deployment, and operation of AI systems across the organization.",
        qualifications="5+ years security engineering, AI/ML security experience, Python, threat modeling, security architecture",
        url="https://www.schwabjobs.com/job/austin/ai-security-developer/33727/89400001235",
        tech_keywords="ai, ml, python, security, machine learning",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118003",
        title="Site Reliability Engineer",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $125,000.00 - $165,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-20",
        description="Support trading software releases. Develop, manage and run CI/CD pipelines to reduce friction for software delivery. Be part of Code Release review.",
        qualifications="5+ years SRE/DevOps, Kubernetes, Docker, Jenkins, Terraform, monitoring tools (Datadog, Splunk)",
        url="https://www.schwabjobs.com/job/austin/site-reliability-engineer/33727/89500001236",
        tech_keywords="kubernetes, docker, jenkins, terraform, ci/cd, devops",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118004",
        title="Lead Java Development Engineer",
        location="Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $155,000.00 - $190,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-25",
        description="Proficiency with AI-Driven software development tools such as GitHub Copilot. Lead development of critical trading infrastructure.",
        qualifications="8+ years Java, 3+ years technical leadership, AI-assisted development, microservices, trading systems",
        url="https://www.schwabjobs.com/job/southlake/lead-java-development-engineer/33727/89600001237",
        tech_keywords="java, ai, microservices, trading, github copilot",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118005",
        title="SDET - QA Automation Developer",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $100,000.00 - $135,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-18",
        description="Actively participate in discovery and experimentation sessions. Work closely with engineers and product team to discover strong solutions through quality automation.",
        qualifications="4+ years QA automation, Selenium, Cypress, Java or Python, API testing, CI/CD integration",
        url="https://www.schwabjobs.com/job/austin/sdet-qa-automation/33727/89700001238",
        tech_keywords="java, python, selenium, cypress, api, ci/cd, testing",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118006",
        title="Sr Research and Development Software Engineer - AI & ML",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $165,000.00 - $210,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-30",
        description="Mentoring junior engineers with frameworks and best practices. Collaborating with and mentoring a small group of talented engineers to perform R&D on cutting-edge AI and ML solutions.",
        qualifications="7+ years software engineering, 3+ years ML/AI, Python, TensorFlow or PyTorch, research background",
        url="https://www.schwabjobs.com/job/austin/sr-rnd-software-engineer-ai-ml/33727/89800001239",
        tech_keywords="python, tensorflow, pytorch, ai, ml, machine learning, r&d",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118007",
        title="ETL QA Engineer",
        location="Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $95,000.00 - $125,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-15",
        description="Test and validate ETL pipelines for enterprise data warehouse. Ensure data quality and integrity across transformations.",
        qualifications="4+ years ETL testing, SQL proficiency, Python scripting, data validation frameworks",
        url="https://www.schwabjobs.com/job/southlake/etl-qa-engineer/33727/89900001240",
        tech_keywords="sql, python, etl, data engineering, testing",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118008",
        title="Test Environment Engineer",
        location="Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $110,000.00 - $140,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-22",
        description="Manage and maintain test environments for software development teams. Automate environment provisioning and configuration.",
        qualifications="5+ years environment management, Docker, Kubernetes, Terraform, scripting (Python/Bash)",
        url="https://www.schwabjobs.com/job/southlake/test-environment-engineer/33727/89900001241",
        tech_keywords="docker, kubernetes, terraform, python, bash, devops",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118009",
        title="Cloud Platform Engineer",
        location="Austin, TX ; Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $135,000.00 - $170,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-28",
        description="Build and maintain cloud infrastructure for enterprise applications. Design scalable, secure cloud architectures on AWS and Azure.",
        qualifications="6+ years cloud engineering, AWS or Azure certifications, Terraform, Kubernetes, networking",
        url="https://www.schwabjobs.com/job/austin/cloud-platform-engineer/33727/89900001242",
        tech_keywords="aws, azure, terraform, kubernetes, cloud, networking",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118010",
        title="API Developer - Trading Systems",
        location="Ann Arbor, MI",
        category="Engineering & Software Development",
        pay_range="USD $130,000.00 - $165,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-20",
        description="Develop and maintain APIs for trading platform. Work on FIX protocol integration and market data distribution.",
        qualifications="5+ years API development, Java, FIX protocol experience, low-latency systems, financial services",
        url="https://www.schwabjobs.com/job/ann-arbor/api-developer-trading/33727/89900001243",
        tech_keywords="java, api, fix protocol, trading, rest, financial",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118011",
        title="Principal Software Architect",
        location="Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $190,000.00 - $250,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-30",
        description="Define technical vision and architecture for wealth management platform. Lead architectural decisions across multiple development teams.",
        qualifications="12+ years software engineering, 5+ years architecture, distributed systems, microservices, cloud native",
        url="https://www.schwabjobs.com/job/southlake/principal-software-architect/33727/89900001244",
        tech_keywords="architecture, microservices, distributed systems, cloud, aws, azure",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118012",
        title="React Frontend Engineer",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $115,000.00 - $145,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-18",
        description="Build responsive, accessible web applications for client-facing platforms. Work closely with UX designers and backend engineers.",
        qualifications="4+ years React, TypeScript, state management (Redux/MobX), testing (Jest, Cypress), accessibility",
        url="https://www.schwabjobs.com/job/austin/react-frontend-engineer/33727/89900001245",
        tech_keywords="react, typescript, javascript, redux, jest, cypress",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118013",
        title="Python Backend Developer",
        location="Ann Arbor, MI",
        category="Engineering & Software Development",
        pay_range="USD $120,000.00 - $155,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-22",
        description="Develop backend services for data analytics platform. Build scalable APIs and data processing pipelines.",
        qualifications="5+ years Python, FastAPI or Django, SQL, message queues, containerization",
        url="https://www.schwabjobs.com/job/ann-arbor/python-backend-developer/33727/89900001246",
        tech_keywords="python, fastapi, django, sql, docker, api",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118014",
        title="Kafka Platform Engineer",
        location="Southlake, TX",
        category="Engineering & Software Development",
        pay_range="USD $140,000.00 - $175,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-25",
        description="Build and maintain Kafka streaming infrastructure. Support real-time data pipelines for trading and analytics.",
        qualifications="5+ years Kafka, stream processing, Java or Scala, Kubernetes, monitoring",
        url="https://www.schwabjobs.com/job/southlake/kafka-platform-engineer/33727/89900001247",
        tech_keywords="kafka, java, scala, kubernetes, streaming, real-time",
        scraped_at=datetime.now().isoformat()
    ),
    JobListing(
        req_id="2025-118015",
        title="Mobile Developer - iOS",
        location="Austin, TX",
        category="Engineering & Software Development",
        pay_range="USD $125,000.00 - $160,000.00 / Year",
        position_type="Regular",
        deadline="2025-12-20",
        description="Develop and maintain Schwab mobile trading application for iOS. Work on features for account management and trading.",
        qualifications="5+ years iOS development, Swift, SwiftUI, financial services experience preferred",
        url="https://www.schwabjobs.com/job/austin/mobile-developer-ios/33727/89900001248",
        tech_keywords="swift, swiftui, ios, mobile, trading",
        scraped_at=datetime.now().isoformat()
    ),
]

def seed_mock_data(conn: sqlite3.Connection) -> int:
    """Seed database with mock Schwab jobs data"""
    print("Seeding database with mock Schwab jobs...")
    count = 0
    
    for job in MOCK_SCHWAB_JOBS:
        if save_job(conn, job):
            count += 1
            print(f"  Saved: {job.title} ({job.req_id})")
    
    print(f"Seeded {count} jobs into database")
    return count

# =============================================================================
# FLASK API SERVER
# =============================================================================

app = Flask(__name__)
CORS(app)  # Allow React frontend to connect

@app.route('/api/jobs', methods=['GET'])
def api_get_jobs():
    """Get all jobs or search by query"""
    query = request.args.get('q', '').strip()
    
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    
    try:
        if query:
            # Try FTS search first, fall back to simple LIKE
            try:
                jobs = search_jobs(conn, query)
            except:
                jobs = search_jobs_simple(conn, query)
        else:
            jobs = get_all_jobs(conn)
        
        return jsonify(jobs)
    finally:
        conn.close()

@app.route('/api/jobs/<req_id>', methods=['GET'])
def api_get_job(req_id: str):
    """Get a specific job by requisition ID"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM jobs WHERE req_id = ?', (req_id,))
        row = cursor.fetchone()
        
        if row:
            return jsonify(dict(row))
        else:
            return jsonify({'error': 'Job not found'}), 404
    finally:
        conn.close()

@app.route('/api/stats', methods=['GET'])
def api_stats():
    """Get database statistics"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    
    try:
        cursor = conn.cursor()
        
        # Total jobs
        cursor.execute('SELECT COUNT(*) as total FROM jobs')
        total = cursor.fetchone()['total']
        
        # Jobs by location
        cursor.execute('''
            SELECT location, COUNT(*) as count 
            FROM jobs 
            GROUP BY location 
            ORDER BY count DESC
        ''')
        by_location = [dict(row) for row in cursor.fetchall()]
        
        # Average pay (extract from range)
        cursor.execute('SELECT pay_range FROM jobs WHERE pay_range IS NOT NULL')
        pay_ranges = [row['pay_range'] for row in cursor.fetchall()]
        
        return jsonify({
            'total_jobs': total,
            'by_location': by_location,
            'last_updated': datetime.now().isoformat()
        })
    finally:
        conn.close()

@app.route('/api/generate-prompt', methods=['POST'])
def api_generate_prompt():
    """Generate Claude prompt for resume creation"""
    data = request.get_json() or {}
    
    job_id = data.get('job_id')
    user_profile = data.get('profile', {})
    
    # Get job details if provided
    job_details = ""
    if job_id:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM jobs WHERE req_id = ?', (job_id,))
            row = cursor.fetchone()
            if row:
                job = dict(row)
                job_details = f"""
TARGET JOB DETAILS:
- Title: {job['title']}
- Requisition ID: {job['req_id']}
- Location: {job['location']}
- Pay Range: {job['pay_range']}
- Key Technologies: {job['tech_keywords']}
- Description: {job['description'][:500]}...
- Qualifications: {job['qualifications']}
"""
        finally:
            conn.close()
    
    # Generate the Claude prompt
    prompt = generate_resume_prompt(user_profile, job_details)
    
    return jsonify({
        'prompt': prompt,
        'job_id': job_id
    })

def generate_resume_prompt(profile: dict, job_details: str = "") -> str:
    """Generate a comprehensive Claude prompt for LaTeX resume generation"""
    
    # Default profile from W2 analysis
    default_profile = {
        'name': 'Scott D. Weeden',
        'location': 'Portland, OR',
        'email': 'scott.weeden@email.com',
        'phone': '(555) 123-4567',
        'linkedin': 'linkedin.com/in/scottweeden',
        'employment_history': [
            {
                'company': 'Fisher Asset Management LLC',
                'location': 'Camas, WA (Remote from Portland, OR)',
                'title': 'Senior Software Engineer',
                'dates': '2020 - 2021',
                'salary_range': '$29K - $154K',
                'highlights': [
                    'Financial technology solutions development',
                    'Asset management platform engineering'
                ]
            },
            {
                'company': 'Jabil Inc',
                'location': 'St. Petersburg, FL / Portland, OR',
                'title': 'Software Engineer',
                'dates': '2016 - 2020',
                'salary_range': '$70K - $113K',
                'highlights': [
                    'Electronics manufacturing systems',
                    'Enterprise software development',
                    'Process automation'
                ]
            },
            {
                'company': 'TekSystems, Inc.',
                'location': 'Saint Petersburg, FL',
                'title': 'Contract Software Engineer',
                'dates': '2014 - 2016',
                'salary_range': '$85K - $94K',
                'highlights': [
                    'Enterprise consulting engagements',
                    'Multiple client projects'
                ]
            },
            {
                'company': 'ExecuSource LLC',
                'location': 'Portland, OR',
                'title': 'Contract Engineer',
                'dates': '2023',
                'salary_range': 'Contract',
                'highlights': [
                    'Technical consulting'
                ]
            }
        ]
    }
    
    # Merge provided profile with defaults
    merged_profile = {**default_profile, **profile}
    
    prompt = f'''You are an expert resume writer and LaTeX document designer. Create a professional, ATS-optimized resume using LaTeX with a unique, modern design.

CANDIDATE PROFILE:
- Name: {merged_profile.get('name', 'Candidate Name')}
- Location: {merged_profile.get('location', 'City, State')}
- Email: {merged_profile.get('email', 'email@example.com')}
- Phone: {merged_profile.get('phone', '(555) 000-0000')}
- LinkedIn: {merged_profile.get('linkedin', 'linkedin.com/in/profile')}

EMPLOYMENT HISTORY (from verified W2 records):
'''
    
    for job in merged_profile.get('employment_history', []):
        prompt += f'''
**{job['company']}** | {job['location']}
{job['title']} ({job['dates']})
- Compensation: {job.get('salary_range', 'N/A')}
'''
        for highlight in job.get('highlights', []):
            prompt += f"- {highlight}\n"
    
    if job_details:
        prompt += f'''
{job_details}
'''
    
    prompt += '''
RESUME REQUIREMENTS:

1. **LaTeX Design Requirements:**
   - Use a unique, professional layout (NOT the standard moderncv or europecv templates)
   - Implement custom styling with TikZ for visual elements
   - Use a two-column layout or creative sidebar design
   - Include subtle color accents (use Schwab blue #0070CD if targeting Schwab)
   - Ensure ATS-compatibility (parseable text, no images for important info)
   - One page maximum

2. **Content Optimization:**
   - Tailor content to emphasize relevant skills for the target job
   - Use action verbs and quantifiable achievements
   - Include relevant technologies prominently
   - Add a skills section matching job requirements
   - Include a brief professional summary

3. **LaTeX Technical Requirements:**
   - Use standard packages available in TexLive
   - Include all necessary package imports
   - Use proper escaping for special characters
   - The document must compile with pdflatex without errors

4. **Output Format:**
   Create a complete, compilable LaTeX document. After generating, I will:
   - Save the file as `resume.tex`
   - Run `pdflatex resume.tex` to compile
   - Fix any compilation errors and re-run until successful
   - Output the final PDF

Please generate the complete LaTeX source code for this professional resume now.
'''
    
    return prompt

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description='Schwab Job Crawler & API Server')
    parser.add_argument('--scrape', action='store_true', help='Run web scraper')
    parser.add_argument('--serve', action='store_true', help='Start API server')
    parser.add_argument('--mock', action='store_true', help='Seed mock data instead of scraping')
    parser.add_argument('--port', type=int, default=5000, help='API server port')
    
    args = parser.parse_args()
    
    # Default: both scrape and serve
    if not args.scrape and not args.serve and not args.mock:
        args.mock = True  # Default to mock since Schwab blocks scraping
        args.serve = True
    
    # Initialize database
    conn = init_db()
    
    if args.scrape:
        print("Starting web scraper...")
        # Note: Schwab blocks most scrapers, so this may not work
        base_url = "https://www.schwabjobs.com/search-jobs/Software/27326/1"
        urls = get_job_listing_urls(base_url)
        
        print(f"Found {len(urls)} job URLs")
        for url in urls:
            job = scrape_job(url)
            if job:
                save_job(conn, job)
                print(f"Saved: {job.title}")
            time.sleep(1)  # Rate limiting
    
    if args.mock:
        seed_mock_data(conn)
    
    conn.close()
    
    if args.serve:
        print(f"\nStarting API server on http://localhost:{args.port}")
        print("Endpoints:")
        print("  GET  /api/jobs          - List all jobs (or ?q=search)")
        print("  GET  /api/jobs/<req_id> - Get specific job")
        print("  GET  /api/stats         - Database statistics")
        print("  POST /api/generate-prompt - Generate Claude resume prompt")
        app.run(debug=True, port=args.port, host='0.0.0.0')

if __name__ == '__main__':
    main()
