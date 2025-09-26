import {BaseControl, Controls} from "./index";
import {FormControl} from "./FormControl";

import {ValidatorParser} from "../data/validation";

const parser = ValidatorParser.create();

interface IValidationResult {
    valid: boolean;
    errors: Array<string>;
}

interface IValidationState {
    valid: boolean;
    errors: Array<string>;
}

const onInput = (e: Event) => {
    const field = Controls.from(e.target, FormFieldControl);
    const form = Controls.as(field?.parent, FormControl);

    if(!form.autoValidate) {
        return;
    }

    form?.validate();
}

const onInvalid = (e: Event) => {
    e.preventDefault();
}

export class FormFieldControl extends BaseControl<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement> {
    constructor(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement, form: FormControl) {
        super(element, form);
    }

    private _state: IValidationState | undefined;

    public state(): IValidationState | undefined {
        return this._state;
    };

    public validate(): IValidationResult {
        const result = this._state = this._validate();

        const nodes = document.querySelectorAll(`.feedback.${this.element.name}`) || [];

        nodes.forEach(n => n.classList.remove('visible'));

        if (this.state().valid) {
            const success = document.querySelector(`.feedback.valid.${this.element.name}`);

            success?.classList?.add('visible');
        } else {
            const errorType = result.errors[0];

            const error = this.element.form.querySelector(`.feedback.invalid.${this.element.name}.${this.element.name}-${errorType}`);

            error?.classList?.add('visible');
        }

        return result;
    }

    public name(): string {
        return this.element.name;
    }

    public value(): string | number | boolean | null {
        const rawValue = this.element.value;

        if (this.element instanceof HTMLInputElement) {
            if (this.element.type === 'checkbox') {
                return this.element.checked;
            }

            if (this.element.type === 'radio') {
                const checked = (this.element.form?.elements.namedItem(this.element.name) as RadioNodeList)?.value;

                return checked || null;
            }

            if (this.element.type === 'number') {
                const num = parseFloat(rawValue);

                return isNaN(num) ? null : num;
            }

            return rawValue || null;
        }

        if (this.element instanceof HTMLSelectElement) {
            return rawValue || null;
        }

        if (this.element instanceof HTMLTextAreaElement) {
            return rawValue || null;
        }

        return null;
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
        const state = {
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

                state.valid = state.valid && validationResult.valid;
                state.errors = state.errors.concat(validationResult.errors);
            });

        if (!state.valid) {
            this.element.setCustomValidity('Invalid field');
        }

        return state;
    }

    override bind(): void {
        super.bind();

        this.element.addEventListener("input", onInput);
        this.element.addEventListener("invalid", onInvalid);
    }

    override dispose() {
        super.dispose();

        this.element?.removeEventListener('input', onInput);
        this.element?.removeEventListener('invalid', onInvalid);
    }
}