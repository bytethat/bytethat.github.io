
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

class ServiceCollection {
    private factories: Map<Symbol, IServiceSupplier<any>[]> = new Map();

    add<T>(identifier: string | Constructor<T>, instance: T): void;
    add<T>(identifier: string | Constructor<T>, factory: IServiceSupplier<T>): void;
    public add<T>(identifier: Constructor<T> | string, registration:  IServiceSupplier<T> | T): void {
        const name = (() => {
            switch (typeof identifier) {
                case 'string': return identifier as string;
                case 'function': return (identifier as Constructor<T>).name;
                default:
                    throw new Error('Identifier must be a string or a constructor.');
            }
        })();

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

        const name = (() => {
            switch (typeof identifier) {
                case 'string': return identifier as string;
                case 'function': return (identifier as Constructor<T>).name;
                default:
                    throw new Error('Identifier must be a string or a constructor.');
            }
        })();

        return (this.factories.get(Symbol.for(name))?.map(factory => factory(this)) as T[] || []).reverse();
    }


    public get<T>(name: string): T | undefined;
    public get<T>(type: Constructor<T>): T | undefined;
    public get<T>(identifier: Constructor<T> | string): T | undefined {

        const name = (() => {
            switch (typeof identifier) {
                case 'string': return identifier as string;
                case 'function': return (identifier as Constructor<T>).name;
                default:
                    throw new Error('Identifier must be a string or a constructor.');
            }
        })();

        const suppliers = this.factories.get(Symbol.for(name));

        if (!suppliers) {
            return undefined;
        }

        return suppliers.length > 0 ? (suppliers[0](this) as T) : undefined;
    }
}

export { IServiceCollection, IServiceProvider, IServiceSupplier, ServiceCollection };