import { WebHostBuilder } from '@bytethat/core';
import themeModule from 'packages/theme/main';

import $ from 'jquery';

const system = WebHostBuilder.create()
    .registerModule(themeModule)
    .build();

system.initialize();

$(document).ready(() => {

    system.run();

});