interface IValidationResult {
    valid: boolean;
    errors: Array<string>;
}

interface IValidationContext {
    target: Object;
    value: any;
}

interface IValidator {
    test (context: IValidationContext): IValidationResult;
}

export {
    IValidationResult,
    IValidationContext,
    IValidator
}