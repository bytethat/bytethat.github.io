import { ScriptService } from "@bytethat/core";
import { ValidatorParser } from "./data/validation";

type FormControl = (
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLButtonElement) & {
    form: Form | null;
    validationResult: IValidationResult | undefined;

    validate: () => boolean;
}

type Form = HTMLFormElement & {
    get autoValidate(): boolean;

    getControls(): Array<FormControl>;

    validate(): boolean;
    enableAutoValidate(): void;
}

const parser = ValidatorParser.create();

interface IValidationResult {
    valid: boolean;
    errors: Array<string>;
}

const validateControl = (ctl: FormControl): IValidationResult => {

    const getErrorType = (validity: ValidityState): Array<string> => {

        const result = new Array<string>();

        for (const key in validity) {
            if (typeof validity[key as keyof ValidityState] === 'boolean' && validity[key as keyof ValidityState] === true) {
                result.push(key);
            }
        }

        return result
            .filter(x => x !== 'valid')
            .map(x =>
            {
                const map: { [key: string]: string } = {
                    'badInput' : 'bad-input',
                    'customError' : 'custom-error',
                    'patternMismatch' : 'pattern-mismatch',
                    'rangeOverflow' : 'range-overflow',
                    'rangeUnderflow' : 'range-underflow',
                    'stepMismatch' : 'step-missmatch',
                    'tooLong' : 'max-length',
                    'tooShort' : 'min-length',
                    'typeMismatch' : 'type-mismatch',
                    'valueMissing' : 'required',
                };

                return map[x] || 'unknown';
            })
    }

    ctl.setCustomValidity(''); // clear previous custom error message

    // start with native validation result
    ctl.validationResult = {
        valid: ctl.checkValidity(),
        errors: ctl.validity.valid ? [] : getErrorType(ctl.validity)
    };

    // invoke custom validation logic
    (ctl.getAttribute('data-validate') || '')
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
                target: ctl,
                value: (ctl as any).value
            });

            ctl.validationResult.valid = ctl.validationResult.valid && validationResult.valid;
            ctl.validationResult.errors = ctl.validationResult.errors.concat(validationResult.errors);
        });

    if(!ctl.validationResult.valid) {
        ctl.setCustomValidity('Invalid field');
    }

    return ctl.validationResult;

};

const validateForm = (form: Form): boolean => {
    // reset validation state
    form.classList.remove('validated');

    const valid = form.getControls().reduce((acc, ctl) => ctl.validate() && acc, true);

    form.classList.add('validated');

    return valid;
}

const buildControl = (ctl: FormControl) => {                
    ctl.validate = (): boolean => {
        const result = validateControl(ctl);

        const nodes = document.querySelectorAll(`.feedback.${ctl.name}`) || [];

        nodes.forEach(n => n.classList.remove('visible'));

        if(ctl.validationResult.valid) {
            console.log(`Control [${ctl.name}] valid`);

            const success = document.querySelector(`.feedback.valid.${ctl.name}`);

            success?.classList?.add('visible');
        }
        else {
            console.log(`Control [${ctl.name}] invalid: issues: ${ctl.validationResult.errors.join(', ')}`);

            const errorType = result.errors[0];

            const error = ctl.form.querySelector(`.feedback.invalid.${ctl.name}.${ctl.name}-${errorType}`);
            
            error?.classList?.add('visible');

        }

        return result.valid;
    };

    ctl.addEventListener("input", (e) => {
        if(!!ctl.form?.autoValidate) {
            ctl.validate();
        }
    });

    ctl.addEventListener("invalid", (e) => {
        e.preventDefault();
    });
};

const buildForm = (form: Form) => {
    Object.defineProperty(form, 'autoValidate', {
        configurable: true,
        enumerable: false,
        get: () => form.classList.contains('auto-validate'),
    });

    form.enableAutoValidate = () => form.classList.add('auto-validate');
    form.validate = () => validateForm(form);
    form.getControls = () => {
        const isInDisabledFieldset = (x: FormControl) => !!x.closest?.('fieldset[disabled]');
    
        return Array.from(form.elements)
            .filter((el: FormControl) => {
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

                if (['submit','image','button','reset'].includes(type)) {
                    return false;
                }

                return true;
            })
            .map(x => x as FormControl);
    };

    form.getControls().forEach(ctl => buildControl(ctl));

    form.addEventListener("submit", function (e) {
        const valid = form.validate();

        form.reportValidity();

        if (!form.autoValidate) {
            form.enableAutoValidate();
        }

        if (!valid) {
            e.preventDefault(); // stop submit if invalid
        }
    });
};

const menuScript = ScriptService.create(() => {
    const forms = document.querySelectorAll('.form');

    forms.forEach((form) => {
        if (form instanceof HTMLFormElement) {
            buildForm(form as Form);
        }
    });
});

export default menuScript;