export const PLAYBACK_QUEUE_ID = "playback";
export const REQUEST_QUEUE_NAME = "Request Queue";

// No backend flag for this yet — flip to preview the "queue closed" UI.
export const MOCK_QUEUE_CLOSED = false;

// How many songs one guest may have waiting at once. Enforced here so the
// interface can show the count and refuse early; the server has to enforce it
// too before this means anything, since anyone can call the API directly.
export const MAX_OPEN_REQUESTS = 3;
