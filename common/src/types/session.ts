export type Role = "admin" | "user";

export interface Session {
    id: string;
    username: string;
    role: Role;
}

export interface CreateSessionArgs {
    username: string;
    pin?: string;
}
