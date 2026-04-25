import { queues } from "../database";
import { Queue } from "song-request-queue-common/types/queue";
import { ApiError } from "../middlewares/errorHandler";
import { generateId } from "../util";

export const getQueues: () => Promise<Queue[]> = async () => {
	await queues.ready;
	return queues;
};

export const getQueue: (id: string) => Promise<Queue> = async (id) => {
	var queue = await getQueues().then((queues) =>
		queues.find((queue) => queue.id === id),
	);
	if (queue == null) throw new QueueNotFoundError(id);
	return queue;
};

export const addToQueue: (id: string, link: string) => Promise<Queue> = async (
	id,
	link,
) => {
	let queue = await getQueue(id);
	queue.songs.push({ id: generateId(), link });
	return queue;
};

export const removeFromQueue: (
	id: string,
	link: string,
) => Promise<Queue> = async (id, link) => {
	let queue = await getQueue(id);
	let songIndex = queue.songs.findIndex((song) => song.link === link);
	if (songIndex === -1) throw new QueueSongNotFoundError(link);

	queue.songs.splice(songIndex, 1);
	return queue;
};

export class QueueNotFoundError extends Error implements ApiError {
	status = 404;
	name = "QueueNotFoundError";
	constructor(id: string) {
		super(`Queue with ID '${id}' not found`, {});
	}
}

export class QueueSongNotFoundError extends Error implements ApiError {
	status = 404;
	name = "QueueSongNotFoundError";
	constructor(link: string) {
		super(`Queue song with link '${link}' not found`, {});
	}
}
