export interface Queue {
    id: string;
    name: string;
    songs: QueueItem[];
}

export interface QueueItem {
    id: string;
    link: string;
    requestedBy?: string;
    startedAt?: number;
    upvotes?: string[];
    downvotes?: string[];
}

export type VoteDirection = "up" | "down";

export interface VoteRequestBody {
    link: string;
    username: string;
    direction: VoteDirection;
}

export interface GetQueueRequestParams {
    id: string;
}

export interface AddToQueueRequestBody {
    link: string;
    requestedBy?: string;
}

export interface AddToQueueRequestParams {
    id: string;
}

export interface RemoveFromQueueRequestBody {
    link: string;
}

export interface RemoveFromQueueRequestParams {
    id: string;
}
