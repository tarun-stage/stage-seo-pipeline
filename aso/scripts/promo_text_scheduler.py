"""
Rotate iOS promotional text weekly via App Store Connect API v3.
Run every Monday via Paperclip agent heartbeat.
Env: ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY
"""

import jwt, time, requests, os
from datetime import datetime

KEY_ID      = os.environ["ASC_KEY_ID"]
ISSUER_ID   = os.environ["ASC_ISSUER_ID"]
PRIVATE_KEY = os.environ["ASC_PRIVATE_KEY"]
APP_ID      = "1531280099"

PROMO_TEXTS = [
    "Chaudhary Ka Beta — nayi Haryanvi web series sirf STAGE pe!",
    "100+ Comedy Shows. Sirf Rs 1 mein 7 din free trial!",
    "Randeep Hooda recommends STAGE — India ka #1 Regional OTT",
    "STAGE Shorts — 60 second mein poori kahani!",
    "Naye Rajasthani movies har hafte — sirf STAGE pe!",
    "Bhojpuri web series ka naya season — abhi dekho!",
]

def generate_token():
    now = int(time.time())
    payload = {"iss": ISSUER_ID, "iat": now, "exp": now + 1200, "aud": "appstoreconnect-v1"}
    return jwt.encode(payload, PRIVATE_KEY, algorithm="ES256", headers={"kid": KEY_ID})

def run():
    token = generate_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    base = "https://api.appstoreconnect.apple.com/v1"

    resp = requests.get(
        f"{base}/apps/{APP_ID}/appStoreVersions?filter[appStoreState]=READY_FOR_SALE"
        "&include=appStoreVersionLocalizations",
        headers=headers
    )
    resp.raise_for_status()

    included = resp.json().get("included", [])
    loc_id = next(
        (i["id"] for i in included
         if i["type"] == "appStoreVersionLocalizations"
         and i["attributes"].get("locale") == "en-US"),
        None
    )
    if not loc_id:
        print("ERROR: en-US localization not found")
        return

    week = datetime.now().isocalendar()[1]
    promo = PROMO_TEXTS[week % len(PROMO_TEXTS)]

    resp = requests.patch(
        f"{base}/appStoreVersionLocalizations/{loc_id}",
        headers=headers,
        json={"data": {"type": "appStoreVersionLocalizations", "id": loc_id,
                       "attributes": {"promotionalText": promo}}}
    )
    resp.raise_for_status()
    print(f"Updated promo text: {promo}")

if __name__ == "__main__":
    run()
