import { Session } from "song-request-queue-common/types/session";
import { sessions } from "../database";
import { generateId } from "../util";
import { ApiError } from "../middlewares/errorHandler";

export const createSession: (username: string) => Promise<Session> = async (username) => {
    if (!username) throw new FailedToCreateSessionError(new Error('Username is required'));
    await sessions.ready;
    if (sessions.some(session => session.username === username)) throw new FailedToCreateSessionError(new Error('Username is already taken'));
    var session: Session = {
        id: generateId(),
        username: username,
    }
    sessions.push(session);
    return session;
}

export const getSession: (id: string) => Promise<Session> = async (id) => {
    await sessions.ready;
    var session = sessions.find(session => session.id === id);
    if(session == null) throw new SessionNotFoundError(id);
    return session;
}

export const deleteSession: (session: Session) => Promise<void> = async (session) => {
    await sessions.ready;
    var index = sessions.findIndex(s => s === session);
    if(index === -1) throw new SessionNotFoundError(session.id);
    sessions.splice(index, 1);
}

export class FailedToCreateSessionError extends Error implements ApiError {
    status = 400;
    name = 'FailedToCreateSessionError';
    constructor(cause: Error) {
        super("Failed to create session", { cause });
    }
}

export class SessionNotFoundError extends Error implements ApiError {
    status = 404;
    name = 'SessionNotFoundError';
    constructor(id: string) {
        super(`Session with ID '${id}' not found`, {});
    }
}