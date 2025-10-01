import {Message} from "@bytethat/core";

class OverlayMessage implements Message<{ show: boolean }> {
    public static topic = 'overlay';
    sender: any;
    topic: string;
    data?: { show: boolean } | undefined;

    constructor(sender: any, data?: { show: boolean }) {
        this.sender = sender;
        this.topic = 'overlay';
        this.data = data;
    }
}

export {OverlayMessage};