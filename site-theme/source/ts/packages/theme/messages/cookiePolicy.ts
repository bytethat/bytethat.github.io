import {Message} from "@bytethat/core/";

type CookiePolicyData = {
    accepted: string[]
};

class CookiePolicyMessage implements Message<CookiePolicyData> {
    public static topic = 'cookie-policy';
    sender: any;
    topic: string;
    data?: CookiePolicyData | undefined;

    constructor(sender: any, data?: CookiePolicyData) {
        this.sender = sender;
        this.topic = 'overlay';
        this.data = data;
    }
}

export { CookiePolicyMessage };