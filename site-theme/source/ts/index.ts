import { Events, WebHostBuilder } from '@bytethat/core';
import themeModule from '@bytethat/theme';

const system = WebHostBuilder.create()
    .registerModule(themeModule)
    .build();

system.initialize();

Events.document.onReady(() => {
    system.run();
});