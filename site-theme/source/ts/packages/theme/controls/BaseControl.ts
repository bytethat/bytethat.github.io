import {IControl} from "@bytethat/theme/controls/IControl";

export class BaseControl<T extends HTMLElement> implements IControl {
    private readonly _element: T;
    private readonly _parent?: IControl;

    public get element(): T {
        return this._element;
    }

    public get parent(): IControl | undefined {
        return this._parent;
    }

    constructor(element: T, parent?: IControl) {
        this._element = element;
        this._parent = parent;
    }

    build(): void {
        this.element.setAttribute('x-control', this.constructor.name);
        (this.element as any).control = this;
    }

    render(): void {
    }

    bind(): void {
    }

    dispose(): void {

    }
}