"""ThingSpeak read client.

Pure data access: fetches feeds and maps field1..field8 onto the named
features. It deliberately knows nothing about the model, so importing it is
cheap and cannot fail because a pickle is missing.
"""

from typing import Any, Dict, List, Optional

import requests

from config import (
    FIELD_MAP,
    THINGSPEAK_CHANNEL_ID,
    THINGSPEAK_READ_API_KEY,
    THINGSPEAK_URL,
)


def parse_float(value: Any) -> float:
    """ThingSpeak returns strings, and nulls for fields never written."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def feed_to_features(feed: Dict[str, Any]) -> Dict[str, float]:
    """Map one raw feed entry onto the eight named features."""
    return {name: parse_float(feed.get(field)) for field, name in FIELD_MAP.items()}


def fetch_thingspeak_data(
    channel_id: Optional[str] = None,
    results: int = 1,
    read_api_key: Optional[str] = None,
    timeout: int = 10,
) -> List[Dict[str, Any]]:
    """Fetch the most recent `results` entries from a channel.

    Returns a list of dicts, newest last, each holding the eight features plus
    `entry_id` and `created_at`. An empty list means the channel has no data.
    """
    channel_id = channel_id or THINGSPEAK_CHANNEL_ID
    key = read_api_key if read_api_key is not None else THINGSPEAK_READ_API_KEY

    params: Dict[str, Any] = {"results": results}
    if key:
        params["api_key"] = key

    response = requests.get(
        THINGSPEAK_URL.format(channel_id=channel_id), params=params, timeout=timeout
    )
    response.raise_for_status()
    payload = response.json()

    entries = []
    for feed in payload.get("feeds", []):
        entry = feed_to_features(feed)
        entry["entry_id"] = feed.get("entry_id")
        entry["created_at"] = feed.get("created_at")
        entries.append(entry)
    return entries


def fetch_latest_feed(
    channel_id: Optional[str] = None, read_api_key: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Convenience wrapper returning only the newest entry, or None."""
    entries = fetch_thingspeak_data(channel_id, results=1, read_api_key=read_api_key)
    return entries[-1] if entries else None
