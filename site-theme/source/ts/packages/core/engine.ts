import { IServiceCollection, IServiceProvider, ServiceCollection } from "./services";

interface IModule {
    configureServices(services: IServiceCollection): void;
    configure(services: IServiceProvider): void;
}

interface IHost {
    initialize(): void;
    run(): void;
}



class ScriptService {
    callback: () => void;
    
    constructor(callback: () => void) {
        this.callback = callback;
    }

    public static create(callback: () => void): ScriptService {
        return new ScriptService(callback);
    }

    execute(): void {
        this.callback();
    }
}


class WebHostBuilder {
    private _modules: IModule[] = [];

    private constructor() {}

    public static create(): WebHostBuilder {
        return new WebHostBuilder();
    }

    public registerModule(module: IModule): WebHostBuilder {
        this._modules.push(module);

        return this;
    }
    
    public build(): IHost {
        return new WebHost(this._modules);
    }
}

class WebHost implements IHost {
    private _modules: IModule[];
    private _services: IServiceProvider;

    public get services(): IServiceProvider {
        return this._services;
    }

    public constructor(modules: IModule[]) { 
        this._modules = modules;
    }

    public initialize(): void {
        var serviceCollection = new ServiceCollection();

        this._modules.forEach(module => {
            module.configureServices(serviceCollection);
        });

        this._services = serviceCollection.build();

        this._modules.forEach(module => {
            module.configure(this.services);
        });
    }

    run(): void {
        const scriptServices = this._services.getAll(ScriptService);

        scriptServices.forEach(service => service.execute());
    }

}

export {
    IModule, IHost, WebHostBuilder, ScriptService
}