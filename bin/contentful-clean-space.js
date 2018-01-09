#!/usr/bin/env node
const index = require("../build/main");

(async () => {
    await index.main();
})();
