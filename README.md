# linkedin-batch-unfollow
A quick Node.js script to batch-unfollow people on LinkedIn. Written in ES 2017 using [Puppeteer](https://github.com/GoogleChrome/puppeteer) and [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/).

## Why?
I wanted a way to batch-unfollow people on LinkedIn and couldn't find that functionality in the UI (or API docs).

## How does it work?
This script uses Puppeteer to drive a headless Chrome instance, and actually unfollows people by navigating to their profile pages and clicking the "Unfollow" button. 

...Yeah, I know. But I wanted to play around with Puppeteer anyway.

## How do I use it?
Clone this repo and run `npm install` then `npm start`.

## I'm getting errors!
I've found Puppeteer and LinkedIn to both be quite flaky so if you're having issues the first thing to do is... try running it again. If that doesn't work, try increasing some of the "wait" timeouts as LinkedIn uses a lot of lazy-loaded lists which might just not be resolving in time on your internet connection.

## Do you save my password?
No.

## Are you planning to add any features?
Nope.

## Is it against the LinkedIn terms of use to run this script?
Maybe. Run it or don't, I'm not your dad<sup>*</sup>.

<br/>
<br/>
<br/>
<br/>
<br/>

<sup>*</sup> Unless you have dim memories of being left in a wicker basket outside a Dixons in Slough, alongside a scrawled note reading "Treat him better than I ever could". In which case - hi Sean.

