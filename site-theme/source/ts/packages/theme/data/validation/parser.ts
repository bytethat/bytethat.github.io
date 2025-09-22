import { IValidator } from './abstractions';
import { EmailValidator, MinLengthValidator, MaxLengthValidator, PatternValidator } from './validators';

// Parse a string like: MaxLengthValidator(10)  |  RequiredValidator()  | EmailValidator
// Whitespace tolerant. Arguments are comma separated. Strings can be quoted with single or double quotes.
function tokenizeArgs(argBlob: string): string[] {
    const args: string[] = [];
    let current = '';
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < argBlob.length; i++) {
        const ch = argBlob[i];
        if (ch === '\'' && !inDouble) { inSingle = !inSingle; current += ch; continue; }
        if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
        if (ch === ',' && !inSingle && !inDouble) { args.push(current.trim()); current = ''; continue; }
        current += ch;
    }
    if (current.trim().length > 0) args.push(current.trim());
    return args.filter(a => a.length > 0);
}

function normalizeLiteral(raw: string): any {
    const trimmed = raw.trim();
    if (/^'.*'$/.test(trimmed) || /^".*"$/.test(trimmed)) {
        return trimmed.substring(1, trimmed.length - 1);
    }
    if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    return trimmed; // fallback raw
}

interface ValidatorParserRule {
    name: string;
    factory: (rawArgs: string[]) => IValidator;
}

const INVOCATION_REGEX = /^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\((.*)\))?$/;

class ValidatorParser {
    
    private readonly _container: Record<string, ValidatorParserRule> = {};

    private constructor() {
        // Pre-register built-in validators
        this.register({ name: 'email', factory: () => new EmailValidator() });
        this.register({ name: 'minlength', factory: ([min]) => new MinLengthValidator(parseInt(min, 10)) });
        this.register({ name: 'maxlength', factory: ([max]) => new MaxLengthValidator(parseInt(max, 10)) });
        this.register({ name: 'pattern', factory: ([regex, errorKey]) => !!errorKey 
            ? new PatternValidator(new RegExp(regex), errorKey)
            : new PatternValidator(new RegExp(regex)) 
        });
    }

    public static create(): ValidatorParser {
        return new ValidatorParser();
    }

    public register(rule: ValidatorParserRule) {
        if (!rule.name || /\s/.test(rule.name)) {
            throw new Error('Validator name must be a non-empty, whitespace-free string');
        }

        this._container[rule.name] = rule;
    }

    public from(spec: string): IValidator {
        const cleaned = spec.trim();
        const match = INVOCATION_REGEX.exec(cleaned);
        
        if (!match) {
            throw new Error(`Invalid validator specification: '${spec}'`);
        }

        const name = match[1];
        
        const entry = this._container[name.toLowerCase()];
        if (!entry) {
            throw new Error(`Unknown validator: '${name}'`);
        }

        const args = match[2] !== undefined
                ? tokenizeArgs(match[2]).map(x => normalizeLiteral(x))
                : [];

        return entry.factory(args);
    }
}

export { ValidatorParserRule, ValidatorParser };