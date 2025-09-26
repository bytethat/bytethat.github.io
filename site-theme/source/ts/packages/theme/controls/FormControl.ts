import {ContainerControl, Controls, IControl} from "./";
import {FormFieldControl} from "./FormFieldControl";

const getChildrenElements = (element: HTMLFormElement): Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement> => {
    const isInDisabledFieldset = (x: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement) => !!x.closest?.('fieldset[disabled]');

    return Array.from(element.elements)
        .filter((el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement) => {
            // ignore non-submittable elements
            if (!el || el.tagName === 'FIELDSET') {
                return false;
            }

            // disabled or in disabled fieldset
            if (el.disabled || isInDisabledFieldset(el)) {
                return false;
            }

            // must have a non-empty name
            if (!el.name) {
                return false;
            }

            const type = (el.type || '').toLowerCase();

            return !['submit', 'image', 'button', 'reset'].includes(type);
        })
        .map(x => x as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement);
}

const onSubmit = (e: Event): void => {
    const form = Controls.from(e.target, FormControl);

    if (!form) {
        return;
    }

    if (!form.validate()) {
        e.preventDefault(); // stop submit if invalid
    }
}

export class FormControl extends ContainerControl<HTMLFormElement, FormFieldControl> {
    public get controls(): Array<FormFieldControl> {
        return this.children as Array<FormFieldControl>;
    }

    public get autoValidate(): boolean {
        return this.element.classList.contains('auto-validate');
    }

    constructor(element: HTMLFormElement, parent?: IControl) {
        const children = getChildrenElements(element)
            .map(x => new FormFieldControl(x, this)) || [];

        super(element, parent, children);
    }

    public validate(): boolean {
        this.element.classList.remove('validated');

        const valid = this.controls.reduce((acc, ctl) => ctl.validate().valid && acc, true);

        this.element.classList.add('validated');

        this.element.reportValidity();

        if (!this.autoValidate) {
            this.enableAutoValidate();
        }

        return valid;
    }

    public enableAutoValidate(): void {
        this.element.classList.add('auto-validate');
    }

    override bind(): void {
        this.element.addEventListener("submit", onSubmit);

        super.bind();
    }

    override dispose() {
        super.dispose();

        this.element.removeEventListener("submit", onSubmit);
    }
}