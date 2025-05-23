# SPYC Siu Ying (v2)

Made by Software Development Club, Siu Ying (V2) is an updated version of the original Siu Ying bot, introduced in the SPYC Discord Personal Assistant workshop in January 2022. This bot aims to provide convenience by implementing a chat command (`/timetable`) to check the school timetable.

## Contribution

Any kind of contribution, including but not limited to code udpates, reviews, comments and suggestions, is welcomed.  
Please open an [issue](https://github.com/SayakoHazuki/siu-ying-v2/issues/new/choose) for suggestions/comments/bug reports, or open a [PR](https://github.com/SayakoHazuki/siu-ying-v2/compare) for code contribution.

## Technical Aspects Regarding This Bot

Environment: **NodeJS** 21.6.1  
Language: **TypeScript** (5.5.4)   
Package Manager (Recommended): **pnpm** _(Do not commit other package managers' lock files if you wish to use one)_  
Main library: **Discord.JS** (14.16.2)   
Created with [Create-discord-bot](https://www.npmjs.com/package/create-discord-bot)  
*P.S. the above may not be up-to-date. For the latest dependencies, please refer to `package.json`*

### Scripts
Refer to `package.json` for all scripts.  

Installing dependencies (Please have pnpm installed first):  
`pnpm install`

To build the program:  
`pnpm build`

To start the bot:  
`pnpm start`

To deploy Discord slash commands:  
`pnpm run deploy`

### Secrets
Please store your own secrets by creating a new file called `.env` in the root directory:
```env
DISCORD_TOKEN=A1B2C3D4E5XXXXXXXXXXXX.XXXXXX.XXXX-XXXXXXXXXXX
APPLICATION_ID=12345678999999999
SUPABASE_SERVICE_KEY=XXXXXX-YOUR-SERVICE-ROLE-KEY-XXXXXXXXXX
```
**Please do not include your secrets when making commits**


## LICENSE
<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/sayatodev/siu-ying-v2">Siu Ying</a> by <span property="cc:attributionName">SPYC Software Development Club</span> is marked with <a href="https://creativecommons.org/publicdomain/zero/1.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC0 1.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/zero.svg?ref=chooser-v1" alt=""></a></p>
<details>
  <summary>What does this mean? What can I do with this code?</summary>
  <i>You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.</i>
</details>

### Remarks
Some of the data, for example events scheduling data, are excluded from this repository due to privacy concerns.
