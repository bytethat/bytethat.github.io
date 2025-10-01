import {Service, IDisposable, MessageBus, Cookies} from "@bytethat/core/";
import {CookiePolicyMessage} from "@bytethat/theme/messages";

@Service("CookiePolicyHandler")
export class CookiePolicyHandler implements IDisposable {
    private readonly scripts: Map<string, Array<() => void>> = new Map();

    constructor(private messages: MessageBus) {
        const self = this;

        this.messages.subscribe(CookiePolicyMessage.topic, self, self.handle.bind(self));
    }

    public allowed(policy: string): boolean {
        const rawConsents = Cookies.get('cconsent');

        if (!rawConsents) {
            return false;
        }

        const consents = JSON.parse(rawConsents);

        if (!(policy in consents)) {
            return false;
        }

        return consents[policy] === true || consents[policy] === 'true';
    }

    public require(policy: string, callback: () => void): void {
        if (!this.allowed(policy)) {
            this.scripts.set(policy, [...(this.scripts.get(policy) ?? []), callback]);

            return;
        }

        setTimeout(callback, 0);
    }

    private handle(message: CookiePolicyMessage) {
        for (const policy of message.data?.accepted || []) {
            const scripts = this.scripts.get(policy);

            if (!scripts || !scripts.length) {
                continue;
            }

            scripts.forEach(x => x());

            this.scripts.delete(policy);
        }
    }

    dispose() {
        this.messages.unsubscribe(CookiePolicyMessage.topic, this);
    }
}