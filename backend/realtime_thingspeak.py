"""Standalone realtime prediction loop.

    python realtime_thingspeak.py

Polls the ThingSpeak channel, predicts on each new entry, and prints the
result. Skips the poll when the entry id has not changed, so a stalled device
does not produce a stream of identical predictions.

This is the console view of the pipeline; the FastAPI app in main.py serves
the same predictions over HTTP.
"""

import time
from datetime import datetime

from config import POLL_INTERVAL_SECONDS, THINGSPEAK_CHANNEL_ID
from ml_module import ModelNotTrained, predict
from thingspeak_client import fetch_latest_feed


def main() -> None:
    print(f"Starting ThingSpeak realtime prediction loop (channel {THINGSPEAK_CHANNEL_ID})\n")
    last_entry_id = None

    while True:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            entry = fetch_latest_feed()

            if entry is None:
                print(f"[{now}] channel has no data yet")
            elif entry.get("entry_id") == last_entry_id:
                print(f"[{now}] no new data - waiting")
            else:
                last_entry_id = entry.get("entry_id")
                result = predict({k: v for k, v in entry.items() if k not in ("entry_id", "created_at")})

                if not result["valid"]:
                    print(f"[{now}] invalid reading - {result['reason']}")
                else:
                    print(f"[{now}] {result['label']} (risk: {result['risk_level']})")
                    print(f"  probabilities: {result['probability']}")
                    print(f"  features: {result['features']}\n")

        except ModelNotTrained as exc:
            print(f"[{now}] {exc}")
            return
        except KeyboardInterrupt:
            print("\nstopped")
            return
        except Exception as exc:  # network hiccups should not kill the loop
            print(f"[{now}] error during fetch/predict: {exc}")

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
