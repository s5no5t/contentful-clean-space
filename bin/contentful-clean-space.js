#!/usr/bin/env node
const index = require("../build/index");

(async () => {
    await index.main();
})();
