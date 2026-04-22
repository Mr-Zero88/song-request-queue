export interface Session {
    id: string;
    username: string;
}

export interface CreateSessionArgs {
    username: string;
}