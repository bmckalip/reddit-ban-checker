const { By } = require('selenium-webdriver');
const { TimeoutError } = require('selenium-webdriver/lib/error');

module.exports = {
    isBanned: async (driver, username) => {
        try {
            await driver.get(`https://www.reddit.com/user/${username}/about.json`);
            await driver.wait(async dr => {
                const readyState = await dr.executeScript("return document.readyState");
                return readyState == "complete"
            }, 3000);

            // console.log(await driver.getPageSource());
            const json = JSON.parse(await driver.findElement(By.css("body")).getText());

            if(json.error == 404){
                return true;
            } else if(json.error == 429){
                return "timeout";
            } else if(json.error == undefined) {
                return false;
            } else {
                return true;
            }

        } catch(e){
            if(!e instanceof TimeoutError){
                console.log(e);
            }
            return false;
        }
    }
}