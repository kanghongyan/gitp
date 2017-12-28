#!/usr/bin/env node
require('shelljs/global');

const argv = require('yargs').argv;
const path = require('path');
const operation = argv._[0];



const commands = ['build', 'publish'];

if (commands.indexOf(operation)=== -1) {
    console.log("请输入正确操作: gitp build 或者 gitp publish");
    exit(1);
}


require(path.resolve(__dirname, operation));