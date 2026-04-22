import { CreateSessionArgs, GetSessionArgs, Session } from "song-request-queue-common/types/session";


const sessions: Session[] = [];

export const getSession: (args: GetSessionArgs) => Promise<Session | null> = async ({ id }) => {
    var session = sessions.find(session => session.id === id);
    if(session == null) throw new Error(`Session not '${id}' found`);
    return session;
}

export const createSession: (args: CreateSessionArgs) => Promise<Session> = async ({ username }) => {
    var session: Session = {
        id: generateId(),
        username: username,
    }
    sessions.push(session);
    return session;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 2 + 9);
}