// const {Worker} = require("worker_threads");
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { argv } = yargs(hideBin(process.argv))
const loadAccounts = require("./loadAccounts");
const {isBanned} = require('./isBanned');
const {Builder, Browser} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome');

const getDriver = () => {
    const builder = new Builder().forBrowser(Browser.CHROME);
    const options = new Options();
    options.excludeSwitches(['enable-logging']);
    options.windowSize({width: 500, height: 800});

    const proxy = `http://localhost:3128`;
    options.addArguments(`--proxy-server=${proxy}`);
    options.setPageLoadStrategy("eager");
    options.headless();
    builder.setChromeOptions(options);
    return builder.build();
}

let interval = null;
const main = async () => {
    if(!"filepath" in argv){
        console.log("missing argument --filepath=example.csv");
        return;
    }

    const filePath = argv.filepath;
    const driver = getDriver();
    loadAccounts(filePath, async usernames => {
        let numBanned = 0;
        for (let i = 0; i < usernames.length; i++) {
            const username = usernames[i];
            let result = "timeout";
            while(result == "timeout") {
                result = await isBanned(driver, username);
            }
            if(result){
                numBanned++;
                console.log(`[${new Date(Date.now()).toLocaleString()}] ${username}: Banned? - ${result}`);
            }

            if(numBanned == usernames.length){
                clearInterval(interval)
            }
            
        }
        console.log(`[${new Date(Date.now()).toLocaleString()}] Result for ${filePath}: ${numBanned}/${usernames.length} (${Math.floor(numBanned / usernames.length * 100)}% of batch is Banned)`);
    });
};

const prettyms = require('pretty-ms')
const ms = "interval" in argv ? argv.interval : 0;
console.log(`Checking accounts in ${argv.filepath}`)
main();
if(ms > 0){
    console.log(`running every ${prettyms(ms)}`);
    interval = setInterval(main, ms);
}