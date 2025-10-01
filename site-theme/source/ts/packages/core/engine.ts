import {IServiceCollection, IServiceProvider, IServiceSupplier, Service, ServiceCollection} from "./services";
import { MessageBus } from "./messagebus"

interface IModule {
    configureServices(services: IServiceCollection): void;
    configure(services: IServiceProvider): void;
}

interface IHost {
    initialize(): void;
    run(): void;
}

@Service("ScriptService")
class ScriptService {
    private readonly _services: IServiceProvider;
    private readonly _callback: (services: IServiceProvider) => void;
    
    constructor(services: IServiceProvider, callback: (services: IServiceProvider) => void) {
        this._services = services;
        this._callback = callback;
    }

    public static builder(callback: (services: IServiceProvider) => void): IServiceSupplier<ScriptService> {
        return (services: IServiceProvider) => {
            return new ScriptService(services, callback);
        };
    }

    execute(): void {
        this._callback(this._services);
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
        const serviceCollection = new ServiceCollection();

        serviceCollection.add(MessageBus, new MessageBus());

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