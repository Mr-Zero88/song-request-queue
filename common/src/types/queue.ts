export interface Queue {
    id: string;
    name: string;
    songs: QueueItem[];
}

export interface QueueItem {
    id: string;
    link: string;
}

export interface GetQueueRequestParams {
    id: string;
}

export interface AddToQueueRequestBody {
    link: string;
}

export interface AddToQueueRequestParams {
    id: string;
}