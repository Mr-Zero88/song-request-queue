import * as fs from 'fs/promises';

export class ArrayJson<T> extends Array<T> {
    ready: Promise<void>;

    constructor(public filePath: string) {
        super();
        this.ready = this.load();
        return new Proxy(this, {
            set: (target, property, value) => {
                console.log('Setting property:', property, 'to value:', value);
                this[property as keyof this] = value;
                this.save();
                return true;
            }
        });
    }

    push(...items: T[]): number {
        let result = super.push(...items);
        this.save();
        return result;
    }

    pop(): T | undefined {
        let result = super.pop();
        this.save();
        return result;
    }

    async load() {
        if (await fs.stat(this.filePath).catch(() => false) === false) {
            await this.save();
        } else {
            const data = await fs.readFile(this.filePath, 'utf-8');
            try {
                this.push(...JSON.parse(data) as T[]);
            } catch (error) {
                await this.save();
            }
        }
    }

    async save() {
        // check if parrent directory exists, if not create it
        await fs.mkdir(this.filePath.split('/').slice(0, -1).join('/'), { recursive: true }).catch(error => console.error('Failed to create directory:', error));
        await fs.writeFile(this.filePath, JSON.stringify(this)).catch(error => console.error('Failed to save sessions:', error));
    }
}