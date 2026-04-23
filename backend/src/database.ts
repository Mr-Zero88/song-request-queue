import { ArrayJson } from "./ArrayJson";
import { Session } from "song-request-queue-common/types/session";
import { Queue } from "song-request-queue-common/types/queue";

export const sessions = new ArrayJson<Session>('database/sessions.json');
export const queues = new ArrayJson<Queue>('database/queues.json');