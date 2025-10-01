import "reflect-metadata";

function Service(identifier: Symbol | string): ClassDecorator {

    if(typeof identifier === 'string') {
        identifier = Symbol.for(identifier);
    }

    return constructor => {
        Reflect.defineMetadata('dependency_injection:name', identifier, constructor);
    };
}

type Constructor<T> = {
    new(...args: any[]): T;
    readonly prototype: T;
}

interface IServiceCollection {
    add<T>(identifier: string | Constructor<T>, instance: T): void;
    add<T>(identifier: string | Constructor<T>, factory: IServiceSupplier<T>): void;
    build(): IServiceProvider;
}

interface IServiceProvider {
    get<T>(name: string): T | undefined;
    get<T>(type: Constructor<T>): T | undefined;


    getAll<T>(name: string): T[];
    getAll<T>(type: Constructor<T>): T[];
}

interface IServiceSupplier<T>{
    (services: IServiceProvider): T
}

const getName = (identifier: string | Constructor<any>) => {
    switch (typeof identifier) {
        case 'string': return identifier as string;
        case 'function':
            return Reflect.getMetadata('dependency_injection:name', identifier)?.description || '';
        default:
            throw new Error('Identifier must be a string or a constructor.');
    }
};

class ServiceCollection {
    private factories: Map<Symbol, IServiceSupplier<any>[]> = new Map();

    add<T>(identifier: string | Constructor<T>, instance: T): void;
    add<T>(identifier: string | Constructor<T>, factory: IServiceSupplier<T>): void;
    public add<T>(identifier: Constructor<T> | string, registration:  IServiceSupplier<T> | T): void {
        const name = getName(identifier);

        if(!!!name || name === '') {
            throw new Error('Service must have a valid name.');
        }

        const factory = typeof registration !== 'function'
            ? () => registration
            : registration as IServiceSupplier<T>;

        this.factories.set(Symbol.for(name), [factory, ...(this.factories.get(Symbol.for(name)) ?? [])]);
    }

    public build(): IServiceProvider {
        return new ServiceProvider(this.factories);
    }
}

class ServiceProvider implements IServiceProvider {
    private factories: Map<Symbol, IServiceSupplier<any>[]>;
    
    public constructor(factories: Map<Symbol, IServiceSupplier<any>[]>) {
        this.factories = factories;
    }
    getAll<T>(name: string): T[];
    getAll<T>(type: Constructor<T>): T[];
    getAll<T>(identifier: Constructor<T> | string): T[] {
        const name = getName(identifier);

        return (this.factories.get(Symbol.for(name))?.map(factory => factory(this)) as T[] || []).reverse();
    }


    public get<T>(name: string): T | undefined;
    public get<T>(type: Constructor<T>): T | undefined;
    public get<T>(identifier: Constructor<T> | string): T | undefined {
        const name = getName(identifier);

        const suppliers = this.factories.get(Symbol.for(name));

        if (!suppliers) {
            return undefined;
        }

        return suppliers.length > 0 ? (suppliers[0](this) as T) : undefined;
    }
}

export { Service, IServiceCollection, IServiceProvider, IServiceSupplier, ServiceCollection };