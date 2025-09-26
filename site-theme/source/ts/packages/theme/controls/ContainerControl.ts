import {BaseControl} from "packages/theme/controls/BaseControl";
import {IControl} from "packages/theme/controls/IControl";

export class ContainerControl<T extends HTMLElement, TChildren extends IControl> extends BaseControl<T> {
    private readonly _children: Array<TChildren> = [];

    protected get children(): Array<TChildren> {
        return this._children;
    }

    constructor(element: T, parent: IControl, children: Array<TChildren>) {
        super(element, parent);

        this._children = children;
    }

    override build(): void {
        super.build();

        this._children.forEach(c => c.build());
    }

    override render(): void {
        super.render();

        this._children.forEach(c => c.render());
    }

    override bind(): void {
        super.bind();

        this._children.forEach(c => c.bind());
    }
}