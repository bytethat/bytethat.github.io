import { IValidationContext, IValidationResult, IValidator } from "./abstractions";

class EmailValidator implements IValidator {
    private emailRegex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,20}$/i;

    public test(context: IValidationContext): IValidationResult {
        const valid = this.emailRegex.test(context.value);
        
        return {
            valid: valid,
            errors: valid ? [] : ['email']
        };
    }
}

class MinLengthValidator implements IValidator {
    constructor(private minLength: number) {}
    
    public test(context: IValidationContext): IValidationResult {
        const valid = (context.value || '').length >= this.minLength;

        return {
            valid: valid,
            errors: valid ? [] : ['min-length']
        };
    }
}

class MaxLengthValidator implements IValidator {
    constructor(private maxLength: number) {}
    
    public test(context: IValidationContext): IValidationResult {
        const valid = (context.value || '').length <= this.maxLength;
        
        return {
            valid: valid,
            errors: valid ? [] : ['max-length']
        };
    }
}

class RequiredValidator implements IValidator {
    public test(context: IValidationContext): IValidationResult {
        const value = context.value;
        const valid = !(value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0));
        return {
            valid,
            errors: valid ? [] : ['required']
        };
    }
}

class PatternValidator implements IValidator {
    constructor(private pattern: RegExp, private errorKey: string = 'pattern') {}

    public test(context: IValidationContext): IValidationResult {
        const value = context.value == null ? '' : String(context.value);
        const valid = this.pattern.test(value);
        return {
            valid,
            errors: valid ? [] : [this.errorKey]
        };
    }
}

export {
    EmailValidator,
    MinLengthValidator,
    MaxLengthValidator,
    RequiredValidator,
    PatternValidator
}