require('shelljs/global');
const chalk = require('chalk');
const fs = require('fs');

const log = console.log;
const packageJsonFile = './package.json';
const packageObj  = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

const buildCmd = packageObj.scripts.build;
const testCmd = packageObj.scripts.test;

// todo: 指出那些文件没有pass
// node_modules/.bin/jest
log(chalk.yellow('----- npm test start -----'));
if (testCmd) {
    if (exec('npm test').code !== 0) {
        log(chalk.red('Error: npm test failed, please fix'));
        exit(1);
    }
}

log(chalk.green('successful! All tests passed'));
log(chalk.yellow('----- npm test end -----'));
log('\n');

log(chalk.yellow('----- npm run build start -----'));
if (buildCmd) {
    if (exec('npm run build').code !== 0) {
        log(chalk.red('Error: build failed, please fix'));
        exit(1);
    }
} else {
    // todo: 提供默认build
    // log(chalk.yellow('Warn: missing script build, use default build'));
    // exec('NODE_ENV=production babel src --out-dir lib --copy-files')
}


log(chalk.green('successful! Build ok'));
log(chalk.yellow('----- npm run build end -----'));
