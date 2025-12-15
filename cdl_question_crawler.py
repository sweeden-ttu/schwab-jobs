#!/usr/bin/env python3
"""
CristCDL question crawler
-------------------------
Fetches question text for the specified Texas CDL practice tests from
cristcdl.com and writes them to per-category text files.

Categories covered (matching the user's requested ranges):
    - General Knowledge tests 1-8 -> general_knowledge.txt
    - Hazardous Material tests 1-4 -> hazmat.txt
    - School Bus tests 1-4 -> school_bus.txt
    - Passenger Vehicles tests 1-4 -> passenger_vehicles.txt
    - Air Brakes tests 1-4 -> air_brakes.txt

Questions are pulled from the `div.content-nav` element on each page.
"""

from pathlib import Path
from typing import Dict, Iterable, List

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.cristcdl.com/texas/tx-cdl-exam-simulator"

# Configuration for each category we need to crawl.
CATEGORIES: Dict[str, Dict[str, object]] = {
    "general_knowledge": {
        "slug": "general-knowledge",
        "pages": range(1, 9),  # tests 1-8
        "output": "general_knowledge.txt",
    },
    "hazmat": {
        "slug": "hazardous-material",
        "pages": range(1, 5),  # tests 9-12 (site numbers 1-4)
        "output": "hazmat.txt",
    },
    "school_bus": {
        "slug": "school-bus",
        "pages": range(1, 5),  # tests 13-16 (site numbers 1-4)
        "output": "school_bus.txt",
    },
    "passenger_vehicles": {
        "slug": "passenger",
        "pages": range(1, 5),  # tests 17-20 (site numbers 1-4)
        "output": "passenger_vehicles.txt",
    },
    "air_brakes": {
        "slug": "air-brakes",
        "pages": range(1, 5),  # tests 21-24 (site numbers 1-4)
        "output": "air_brakes.txt",
    },
}


def extract_questions(page_url: str) -> List[str]:
    """Fetch a page and pull question text from div.content-nav."""
    resp = requests.get(page_url, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    container = soup.select_one("div.content-nav")
    if not container:
        return []

    # Prefer list items if present; fall back to plain text lines.
    items = [li.get_text(" ", strip=True) for li in container.select("li")]
    if items:
        return items

    fallback_text = container.get_text("\n", strip=True)
    return [line for line in (line.strip() for line in fallback_text.splitlines()) if line]


def crawl_category(slug: str, pages: Iterable[int]) -> List[str]:
    """Collect all questions for a given slug across the provided page numbers."""
    questions: List[str] = []
    for page in pages:
        url = f"{BASE_URL}/{slug}-{page}/"
        page_questions = extract_questions(url)
        questions.extend(page_questions)
    return questions


def write_questions(output_path: Path, questions: List[str]) -> None:
    """Write questions to disk, one per line, with running numbers."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for idx, question in enumerate(questions, start=1):
            f.write(f"{idx}. {question}\n")


def main() -> None:
    for config in CATEGORIES.values():
        slug = config["slug"]
        pages = config["pages"]
        output = Path(config["output"])

        all_questions = crawl_category(slug, pages)
        write_questions(output, all_questions)
        print(f"Wrote {len(all_questions)} questions to {output}")


if __name__ == "__main__":
    main()

