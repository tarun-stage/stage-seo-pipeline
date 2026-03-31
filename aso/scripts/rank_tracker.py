"""
Weekly keyword rank tracking for STAGE app.
Run every Monday via Paperclip agent heartbeat.
Env: ASO_TOOL_API_KEY (AppTweak or Sensor Tower)
"""

import os, json, requests
from datetime import datetime

API_KEY = os.environ.get("ASO_TOOL_API_KEY", "")
HISTORY_FILE = "/paperclip/instances/default/data/aso_rank_history.json"

KEYWORDS = {
    "P0": ["haryanvi web series", "rajasthani movie", "bhojpuri app", "stage app"],
    "P1": ["haryanvi comedy", "bhojpuri web series", "rajasthani web series", "desi comedy app", "regional ott"],
    "P2": ["haryanvi movie", "kavi sammelan", "ragni app", "bhojpuri movie app"],
    "P3": ["folk music app india", "bhajan app", "rajasthani comedy", "haryanvi film"],
}

def load_history():
    try:
        with open(HISTORY_FILE) as f:
            return json.load(f)
    except:
        return {}

def save_history(data):
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)

def run():
    today = datetime.now().strftime("%Y-%m-%d")
    history = load_history()
    
    print(f"=== STAGE ASO Rank Report — {today} ===\n")
    
    if not API_KEY:
        print("WARNING: ASO_TOOL_API_KEY not set. Showing keyword targets only.\n")
        for priority, keywords in KEYWORDS.items():
            print(f"[{priority}] Keywords:")
            for kw in keywords:
                prev = history.get(kw, {}).get("rank", "N/A")
                print(f"  • {kw}: prev rank = {prev}")
        return

    # When API key is available, fetch real rankings
    # (AppTweak API integration — customize endpoint per tool)
    results = {}
    for priority, keywords in KEYWORDS.items():
        for kw in keywords:
            results[kw] = {"priority": priority, "date": today, "rank": "TODO"}
    
    history.update(results)
    save_history(history)
    print("Rankings saved. Connect ASO tool API for live data.")

if __name__ == "__main__":
    run()
