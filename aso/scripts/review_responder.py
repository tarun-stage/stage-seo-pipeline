"""
Auto-respond to negative Google Play reviews for in.stage.
Run daily via Paperclip agent heartbeat.
Env: PLAY_STORE_KEY_PATH → path to Google service account JSON
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import os, json

PACKAGE_NAME = "in.stage"
KEY_PATH = os.environ.get("PLAY_STORE_KEY_PATH", "/paperclip/play-service-account.json")
RESPONDED_FILE = "/paperclip/instances/default/data/aso_responded_reviews.json"

TEMPLATES = {
    1: "Namaste! Humein bahut dukh hua ki aapko accha experience nahi mila. "
       "Kripya support@stage.in pe detail mein bataiye — hum zaroor fix karenge. — Team STAGE",
    2: "Namaste! Aapki feedback ke liye dhanyavaad. Hum is issue ko dekhte hain. "
       "Kripya support@stage.in pe contact karein. — Team STAGE",
    3: "Namaste! Dhanyavaad feedback ke liye. Hum STAGE ko har din better bana rahe hain. "
       "Agar koi issue hai toh support@stage.in pe bataiye. — Team STAGE",
}

def get_service():
    creds = service_account.Credentials.from_service_account_file(
        KEY_PATH, scopes=["https://www.googleapis.com/auth/androidpublisher"]
    )
    return build("androidpublisher", "v3", credentials=creds)

def load_responded():
    try:
        with open(RESPONDED_FILE) as f:
            return set(json.load(f))
    except:
        return set()

def save_responded(ids):
    os.makedirs(os.path.dirname(RESPONDED_FILE), exist_ok=True)
    with open(RESPONDED_FILE, "w") as f:
        json.dump(list(ids), f)

def run():
    service = get_service()
    responded = load_responded()
    result = service.reviews().list(packageName=PACKAGE_NAME).execute()
    reviews = result.get("reviews", [])
    new_responses = 0
    for review in reviews:
        review_id = review["reviewId"]
        if review_id in responded:
            continue
        comment = review["comments"][0]["userComment"]
        rating = comment["starRating"]
        if rating > 3:
            continue
        if len(review.get("comments", [])) > 1:
            responded.add(review_id)
            continue
        reply_text = TEMPLATES.get(rating, TEMPLATES[3])
        service.reviews().reply(
            packageName=PACKAGE_NAME,
            reviewId=review_id,
            body={"replyText": reply_text},
        ).execute()
        responded.add(review_id)
        new_responses += 1
        print(f"Replied to {review_id} (rating: {rating})")
    save_responded(responded)
    print(f"Done. Replied to {new_responses} new reviews.")

if __name__ == "__main__":
    run()
