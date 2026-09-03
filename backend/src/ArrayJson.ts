import * as fs from 'fs/promises';

export class ArrayJson<T> extends Array<T> {
    ready: Promise<void>;

    constructor(public filePath: string) {
        super();
        this.ready = this.load();
        return wrapSetter(this, '@', (path) => {
            console.log(`Property changed at path: ${path}`);
            this.save();
        });
    }

    push(...items: T[]): number {
        let result = super.push(...items);
        console.log('Pushed items:', items);
        this.save();
        return result;
    }

    pop(): T | undefined {
        let result = super.pop();
        console.log('Popped item:', result);
        this.save();
        return result;
    }

    async load() {
        if (await fs.stat(this.filePath).catch(() => false) === false) {
            await this.save();
        } else {
            const data = await fs.readFile(this.filePath, 'utf-8');
            try {
                super.push(...JSON.parse(data) as T[]);
            } catch (error) {
                console.error('Failed to parse JSON:', error);
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

function wrapSetter<T extends Object | Array<any>>(object: T, path: string, setter: (path: string) => void): T {
    // console.log(`wrapSetter called for path: ${path}`);
    if(typeof object !== 'object' || object === null) {
        console.warn(`wrapSetter called for non-object at path: ${path}`);
        return object;
    }
    let wrapedEntries: T = {} as T;
    return new Proxy(object, {
        set: (target, property, value) => {
            setter(`${path}.${String(property)}`);
            target[property as keyof T] = value;
            if(typeof value == 'object' && property != null) {
                wrapedEntries[property as keyof typeof wrapedEntries] = wrapSetter(value, `${path}.${String(property)}`, setter);
            }
            return true;
        },
        get: (target, property) => {
            let targetValue = target[property as keyof typeof target] as Object | Array<any>;
            if(property != 'ready' && typeof targetValue == 'object' && property != null) {
                let value = wrapedEntries[property as keyof typeof wrapedEntries] as Object | Array<any>;
                if (value == null) {
                    value = wrapSetter(targetValue, `${path}.${String(property)}`, setter);
                    wrapedEntries[property as keyof typeof wrapedEntries] = value as T[keyof T];
                }
                return value;
            }
            return target[property as keyof T];
        }
    }) as T;
}