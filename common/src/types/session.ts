export interface Session {
    id: string;
    username: string;
}

export interface GetSessionArgs {
    id: string;
}

export interface CreateSessionArgs {
    username: string;
}