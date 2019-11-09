# PCO API Tools
A growing collection of Planning Center API Utilities.

## Latest changes
- Added JavaScript console exporter.

    This script is a quick and dirty way to export JSON for all songs matching a tag.  You sign into your account, browse to api.planningcenteronline.com, open the console, paste it in and run it.  It replaces the page with the JSON document.  It inserts all of the arrangements into the song structure.

## Goals
- Strip out the fields that don't work for import.
- Create an importer to go with the above exporter.
- Create a single tool that imports from one account and imports to another account using personal access tokens for both account.

    [Stack Overflow discussion on how to do this.](https://stackoverflow.com/questions/43842793/basic-authentication-with-fetch)

- upgrade to OAuth
- Create a library for JavaScript
- Create a library for PHP
- Create a library for GoLang
- Create a separate repo with PCO custom reports

## Contact
- I'm in the PCO Slack #API Channel as Andrew Springman
- Feel free to post issues here as well.

## License
(C) Andrew Springman 2019
Released under GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007