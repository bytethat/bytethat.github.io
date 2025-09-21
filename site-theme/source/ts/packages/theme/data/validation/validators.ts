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

export {
    EmailValidator,
    MinLengthValidator,
    MaxLengthValidator
}