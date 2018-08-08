const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const fs = require('fs');

(async () => {
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    async function login() {
        await page.goto('https://www.linkedin.com');

        const email = (await inquirer.prompt({
            type: 'input',
            name: 'value',
            message: 'What\'s your LinkedIn email address?'
        })).value;

        const password = (await inquirer.prompt({
            type: 'password',
            name: 'value',
            message: 'And what\'s your password?',
            mask: '*'
        })).value;

        console.log('Attempting to log in...');
        await page.type('#login-email', email, {delay: 100});
        await page.type('#login-password', password, {delay: 100});

        await page.click('#login-submit');

        await page.waitForNavigation();

        await page.goto('https://www.linkedin.com/mynetwork/invite-connect/connections/');
    }

    async function harvestConnections() {
        let connections = [];

        console.log('Searching for connections...');

        while (true) {
            const allConnectionEls = await page.$$('[data-control-name="connection_profile"]');

            let newConnections = [];
            let newConnectionEls = [];

            for (let connectionEl of allConnectionEls) {
                const connection = await page.evaluate(e => ({
                    name: e.textContent.trim(),
                    url: e.getAttribute('href')
                }), connectionEl);

                if (
                    newConnections.every(c => c.url !== connection.url) &&
                    connections.every(c => c.url !== connection.url)
                ) {
                    newConnections.push(connection);
                    newConnectionEls.push(connectionEl);
                }
            }

            if (newConnections.length > 0) {
                connections = [...connections, ...newConnections];
                console.log(`Found ${connections.length} connections so far...`);
            } else {
                break;
            }

            for (let resultEl of newConnectionEls) {
                await resultEl.hover();
                await page.waitFor(200);
            }

            if (connections.length > 10) {
                break;
            }
        }

        console.log(`Looks like that's everyone! Found ${connections.length} connections overall.`);

        return connections;
    }

    async function promptConnectionsForUnfollowDecisions(connections) {
        const connectionsToUnfollow = [];

        for (let connection of connections) {
            const shouldUnfollow = (await inquirer.prompt({
                type: 'confirm',
                message: `${connections.indexOf(connection) + 1}/${connections.length}: ` +
                `Unfollow ${connection.name} [${connection.url}]?`,
                name: 'value',
                default: false
            })).value;

            if (shouldUnfollow) {
                connectionsToUnfollow.push(connection);
            }
        }

        return connectionsToUnfollow;
    }

    async function unfollowConnection(connection, number, total) {
        try {
            console.log(`(${number}/${total}) Attempting to unfollow ${connection.name} [${connection.url}]...`);
            await page.goto(`https://linkedin.com${connection.url}`);
            await page.click('.pv-s-profile-actions__overflow-toggle');
            await page.waitFor(200);
            const unfollowButton = await page.$('.pv-s-profile-actions--unfollow');

            if (!unfollowButton) {
                console.log(`> You have already unfollowed ${connection.name}.`);
            } else {
                await unfollowButton.click();
                await page.waitFor(200);
                console.log(`> Successfully unfollowed ${connection.name}.`);
            }
        } catch (e) {
            console.log(
                `> Failed to unfollow ${connection.name}. A screenshot has been saved for debugging.`
            );
            await page.screenshot({path: `screenshots/ERROR_${connection.url}_${Date.now()}.png`});
        }
    }

    async function unfollowConnections(connections) {
        console.log('Applying your changes...');
        for (let connection of connections) {
            await unfollowConnection(connection, connections.indexOf(connection) + 1, connections.length);
        }
        console.log('All done!');
    }

    async function main() {
        try {
            await login();
            const connections = await harvestConnections();
            const unfollows = await promptConnectionsForUnfollowDecisions(connections);
            await unfollowConnections(unfollows);
        } catch (e) {
            console.error(e);
            console.log(`An error occurred. A screenshot has been saved for debugging.`);
            await page.screenshot({path: `screenshots/ERROR_${Date.now()}.png`});
        }
    }

    await main();

    await browser.close();
})();
