import {ScriptService} from "@bytethat/core";
import {ValidatorParser} from "./data/validation";
import {IControl, BaseControl, ContainerControl } from "./controls";

const parser = ValidatorParser.create();

interface IValidationResult {
    valid: boolean;
    errors: Array<string>;
}

class MyFormControl extends BaseControl<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement> {
    constructor(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement, form: MyForm) {
        super(element, form);
    }

    public validate(): IValidationResult {
        const result = this._validate();

        const nodes = document.querySelectorAll(`.feedback.${this.element.name}`) || [];

        nodes.forEach(n => n.classList.remove('visible'));

        if ((this.element as any).validationResult.valid) {
            const success = document.querySelector(`.feedback.valid.${this.element.name}`);

            success?.classList?.add('visible');
        } else {
            const errorType = result.errors[0];

            const error = this.element.form.querySelector(`.feedback.invalid.${this.element.name}.${this.element.name}-${errorType}`);

            error?.classList?.add('visible');
        }

        return result;
    }

    private _validate(): IValidationResult {

        const getErrorType = (validity: ValidityState): Array<string> => {

            const result = new Array<string>();

            for (const key in validity) {
                if (typeof validity[key as keyof ValidityState] === 'boolean' && validity[key as keyof ValidityState] === true) {
                    result.push(key);
                }
            }

            return result
                .filter(x => x !== 'valid')
                .map(x => {
                    const map: { [key: string]: string } = {
                        'badInput': 'bad-input',
                        'customError': 'custom-error',
                        'patternMismatch': 'pattern-mismatch',
                        'rangeOverflow': 'range-overflow',
                        'rangeUnderflow': 'range-underflow',
                        'stepMismatch': 'step-missmatch',
                        'tooLong': 'max-length',
                        'tooShort': 'min-length',
                        'typeMismatch': 'type-mismatch',
                        'valueMissing': 'required',
                    };

                    return map[x] || 'unknown';
                })
        }

        this.element.setCustomValidity(''); // clear previous custom error message

        // start with native validation result
        (this.element as any).validationResult = {
            valid: this.element.checkValidity(),
            errors: this.element.validity.valid ? [] : getErrorType(this.element.validity)
        };

        // invoke custom validation logic
        (this.element.getAttribute('data-validate') || '')
            .split(',')
            .map(x => x.trim())
            .filter(x => x.length > 0)
            .map(x => {
                try {
                    return parser.from(x);
                } catch (error) {
                    console.error(`Failed to parse validator '${x}':`, error);

                    return null;
                }
            })
            .filter(v => !!v)
            .forEach((validator) => {
                const validationResult = validator.test({
                    target: this.element,
                    value: this.element.value
                });

                (this.element as any).validationResult.valid = (this.element as any).validationResult.valid && validationResult.valid;
                (this.element as any).validationResult.errors = (this.element as any).validationResult.errors.concat(validationResult.errors);
            });

        if (!(this.element as any).validationResult.valid) {
            this.element.setCustomValidity('Invalid field');
        }

        return (this.element as any).validationResult;
    }

    override build(): void {
        super.build();

        (this.element as any).validate = () => this.validate().valid;
    }

    override render(): void {
        super.render();
    }

    override bind(): void {
        super.bind();

        const self = this;

        this.element.addEventListener("input", () => {
            if (!!self.element.form?.autoValidate) {
                (self.element as any).validate();
            }
        });

        self.element.addEventListener("invalid", (e) => {
            e.preventDefault();
        });
    }
}

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

class MyForm extends ContainerControl<HTMLFormElement> {
    public get controls(): Array<MyFormControl> {
        return this.children as Array<MyFormControl>;
    }

    public get autoValidate(): boolean {
        return this.element.classList.contains('auto-validate');
    }

    constructor(element: HTMLFormElement, parent?: IControl) {
        const children = getChildrenElements(element)
            .map(x => new MyFormControl(x, this)) || [];

        super(element, parent, children);
    }

    public validate(): boolean {
        // reset validation state
        this.element.classList.remove('validated');

        const valid = this.controls.reduce((acc, ctl) => ctl.validate().valid && acc, true);

        this.element.classList.add('validated');

        return valid;
    }

    public enableAutoValidate(): void {
        this.element.classList.add('auto-validate');
    }

    override build(): void {
        Object.defineProperty(this.element, 'autoValidate', {
            configurable: true,
            enumerable: false,
            get: () => this.autoValidate,
        });

        Object.defineProperty(this.element, 'controls', {
            configurable: true,
            enumerable: false,
            get: () => this.controls,
        });

        (this.element as any).enableAutoValidate = () => this.element.classList.add('auto-validate');
        (this.element as any).validate = () => this.validate();

        super.build();
    }

    override render(): void {
        super.render();
    }

    override bind(): void {
        const self = this;

        this.element.addEventListener("submit", function (e) {
            const valid = self.element.validate();

            self.element.reportValidity();

            if (!self.element.autoValidate) {
                self.element.enableAutoValidate();
            }

            if (!valid) {
                e.preventDefault(); // stop submit if invalid
            }
        });

        super.bind();
    }
}

const formScript = ScriptService.create(() => {
    const forms = document.querySelectorAll('.form');

    Array.from(forms)
        .filter(x => x instanceof HTMLFormElement)
        .filter(x => x.classList.contains('validate'))
        .forEach((x: HTMLFormElement) => {
            const form = new MyForm(x);

            form.build();
            form.render();
            form.bind();
        });
});

export default formScript;