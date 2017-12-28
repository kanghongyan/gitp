#!/usr/bin/env node

require('shelljs/global');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const log = console.log;
const gitRep = require('simple-git')();
const packageJsonFile = './package.json';


function status(workingDir) {

    return new Promise((resolve, reject) => {

        const git = require('simple-git/promise');
        let statusSummary = null;
        try {
            statusSummary = git(workingDir).status();
            resolve(statusSummary);
        }
        catch (e) {
            // handle the error
            reject(null)
        }
    })


}

const questions = [
    {
        type: 'confirm',
        name: 'needToCommit',
        message: '需要提交吗?',
        default: true,
        when: function () {
            return new Promise((resolve, reject) => {

                status(process.cwd()).then(status => {

                    // console.log(status);
                    if (status === null) {
                        log(chalk.red('Error: no git repository'));
                        // exit(1)
                        resolve(false)
                    }

                    if (status.files.length > 0) {
                        log(chalk.yellow('检查到文件变化，即将提交。'));
                        // 显示文件状态
                        showFileStatus(status);

                        resolve(true)
                    } else {
                        resolve(false)
                    }
                });

            })
        }
    },
    {
        type: 'input',
        name: 'commitMsg',
        message: "请输入提交信息：",
        default: 'update',
        when: function (answers) {
            return answers.needToCommit
        }
    },
    {
        type: 'confirm',
        name: 'needToTag',
        message: '需要打tag吗?',
        default: false
    },
    {
        type: 'input',
        message: '请输入新的tag号,vX.X.X格式（X代表数字）',
        name: 'tagName',
        // todo: tag校验
        when: function (answers) {
            return new Promise((resolve, reject) => {
                gitRep
                    .tags((err, tags) => {

                        log("Latest available tag: %s", tags.latest);
                        resolve(answers.needToTag)
                    });
            })

        }
    }
];



const showFileStatus = (status) => {
    // todo: more status

    log(chalk.cyanBright('modified:'));
    status.modified.forEach(item => showMsg(item, 'yellow'));

    log(chalk.cyanBright('conflicted:'));
    status.conflicted.forEach(item => showMsg(item, 'red'));
    if (status.conflicted.length > 0) {
        log(chalk.red('please fix conflicted before commit!'));
        exit(1);
    }

    log(chalk.cyanBright('deleted:'));
    status.deleted.forEach(item => showMsg(item, 'yellow'));

    log(chalk.cyanBright('not_added:'));
    status.not_added.forEach(item => showMsg(item, 'yellow'));

    log(chalk.cyanBright('created:'));
    status.created.forEach(item => showMsg(item, 'yellow'));

    log('\n')
};

const showMsg = (msg, color = 'yellow') => {
    log(chalk[color]('\t' + msg))
};

inquirer.prompt(questions).then(function (answers) {

    console.log(JSON.stringify(answers))

    if (answers.needToCommit) {

        gitRep
            .add('./*')
            .commit(answers.commitMsg)
            .push('origin', 'master', () => {
                log(chalk.green('push change to master done'))
            });

    }

    if (answers.needToTag) {
        const tagVersion = answers.tagName;

        // todo: parse fail情况
        // update package.json version
        try {
            let packageObj  = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
            packageObj.version = tagVersion.replace(/(^v)(\d\.\d\.\d)/g, ($1, $2, $3) => $3);
            fs.writeFileSync(packageJsonFile, JSON.stringify(packageObj, null, 2));

            log(chalk.green(`package.json version is change to ${packageObj.version}`))
        } catch (e) {
            console.log('fail，请手动修改package.json中的version, 并提交')
        }

        // todo: 判断tag正确
        gitRep
            .add('./package.json')
            .commit(`new tag ${tagVersion}`)
            .push('origin', 'master', () => {
                log(chalk.green(`package.json is pushed to master`))
            })
            .tag([tagVersion], (err) => {
                log(chalk.green(`${tagVersion} is ok`));
            })
            .pushTags('origin', () => {
                log(chalk.green('new tag is pushed to master'))
            })

    }


    if (!answers.needToTag && !answers.needToCommit) {
        exit(1)
    }


});