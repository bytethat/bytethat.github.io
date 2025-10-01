import {Service} from "@bytethat/core/services";

interface Message<T> {
    sender: any;
    topic: string;
    data?: T;
}

type Registration<X, T extends Message<X>> = {
    identifier: any;
    callback: (data?: T) => void;
}

@Service("MessageBus")
class MessageBus {
    private subscribers: Map<Symbol, Registration<any, Message<any>>[]> = new Map();

    public async publishAsync<X, T extends Message<X>>(topic: string, message?: T): Promise<void> {
        const key = Symbol.for(topic);

        const existing = this.subscribers.get(key);

        if (!existing) {
            return;
        }

        await Promise.all(existing
            .map(async x => x.callback(message)));
    }

    public subscribe<X, T extends Message<X>>(topic: string, identifier: any, callback: (message?: T) => void): void {
        const key = Symbol.for(topic);
        const registration = {
            identifier,
            callback
        };

        this.subscribers.set(key, [registration, ...(this.subscribers.get(key) ?? [])]);
    }

    public unsubscribe<X, T extends Message<X>>(topic: string, identifier: any): void {
        const key = Symbol.for(topic);

        const existing = this.subscribers.get(key);

        if (!existing) {
            return;
        }

        this.subscribers.set(key, existing.filter(x => x !== x.identifier));
    }
}

export { MessageBus, Message };