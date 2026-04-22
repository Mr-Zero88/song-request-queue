import { Session } from "song-request-queue-common/types/session";
import { ArrayJson } from "./ArrayJson";

export const sessions = new ArrayJson<Session>('database/sessions.json');
