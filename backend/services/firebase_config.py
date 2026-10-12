import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger("f1_platform.firebase")

# Resolve service account key path
KEY_FILENAME = "serviceAccountKey.json"
KEY_PATH = KEY_FILENAME
if not os.path.exists(KEY_PATH):
    alt_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), KEY_FILENAME)
    if os.path.exists(alt_path):
        KEY_PATH = alt_path


def get_firestore_client():
    """
    Initializes the Firebase Admin SDK using a service account key placeholder
    and returns a Firestore client instance.
    """
    if not firebase_admin._apps:
        # Check if actual serviceAccountKey.json file exists
        if os.path.exists(KEY_PATH):
            cred = credentials.Certificate(KEY_PATH)
            firebase_admin.initialize_app(cred)
            logger.info(f"Firebase Admin SDK successfully initialized using {KEY_PATH}")
        else:
            # Placeholder for actual path to serviceAccountKey.json as requested
            try:
                cred = credentials.Certificate("serviceAccountKey.json")
                firebase_admin.initialize_app(cred)
            except Exception as e:
                logger.warning(
                    f"serviceAccountKey.json placeholder note: {e}. "
                    "Please place your valid Firebase serviceAccountKey.json in the backend root."
                )
                raise e

    return firestore.client()
