import {MessageBus, ScriptService} from "@bytethat/core";

import {OverlayMessage} from "@bytethat/theme/messages";
import {IControl, BaseControl} from "@bytethat/theme/controls";

class OverlayControl extends BaseControl<HTMLElement> {
    private readonly _messages: MessageBus;

    private _counter = 0;

    constructor(messages: MessageBus, element: HTMLElement, parent?: IControl) {
        super(element, parent);

        this._messages = messages;
    }

    public show(): void {
        this.element.classList.add('visible');
        document.body.classList.add('no-scroll');
    }

    public hide(): void {
        this.element.classList.remove('visible');
        document.body.classList.remove('no-scroll');
    }

    private onOverlayMessage(message: OverlayMessage): void {
        if (message.data?.show) {
            this._counter++;
        } else {
            this._counter--;
        }

        if (this._counter > 0) {
            this.show();
        } else {
            this.hide();
        }
    }

    override bind() {
        this._messages.subscribe(OverlayMessage.topic, this, this.onOverlayMessage.bind(this));
    }

    override dispose() {
        this?._messages?.unsubscribe(OverlayMessage.topic, this);
    }
}

export {OverlayControl};