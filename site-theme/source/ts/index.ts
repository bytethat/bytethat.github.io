import { WebHostBuilder } from '@bytethat/core';
import menuModule from 'packages/theme/main';

import $ from 'jquery';






class Foo {
    constructor() {
    }

    foo(): void {
        console.log('Foo method called');
    }
}

class ChildFoo extends Foo {
    constructor() {
        super();
    }

    foo(): void {
        console.log('ChildFoo method called');
    }
}

class Bar {
    private _foo: Foo;

    constructor(foo: Foo) {
        this._foo = foo;
    }

    bar(): void {
        this._foo.foo();

        console.log('Bar method called');
    }
}












const system = WebHostBuilder.create()
    .registerModule({
        configureServices(services) {
            services.add(Foo, () => new Foo());
            services.add(Foo, () => new ChildFoo());
            services.add(Bar, (sp) => new Bar(sp.get(Foo)!));
        },
        configure(services) {
            const bar = services.get(Bar);

            bar?.bar();
        }
    })
    .registerModule(menuModule)
    .build();

    system.initialize();

$(document).ready(() => {

    system.run();

});