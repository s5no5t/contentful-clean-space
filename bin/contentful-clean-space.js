#!/usr/bin/env node
const index = require("../build/main");

(async () => {
    try {
        await index.main();
    }
    catch (e) {
        console.log(e);
        process.exitCode = 1;
    }
})();
