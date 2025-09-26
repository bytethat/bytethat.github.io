import {IControl} from "packages/theme/controls/IControl";

export class BaseControl<T extends HTMLElement> {
    protected readonly element: T;
    protected readonly parent?: IControl;

    constructor(element: T, parent?: IControl) {
        this.element = element;
        this.parent = parent;
    }

    build(): void {
    }

    render(): void {
    }

    bind(): void {
    }
}