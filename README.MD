The New York State [HCRA Elector list](https://www.health.ny.gov/regulations/hcra/elector/about.htm) is not user friendly and not easy to quickly get all the data from their website. 

The list is updated once a month, so it's handy to have an automated way of getting new data, and being able to search on it

This project will

 1. Scrape the website to pull the elector list into a MySQL database
 2. Give you API endpoints to search the elector list

Steps

    git clone https://github.com/maafk/hcraApi.git
    cd hcraApi
    npm install
You'll want to edit `app.js` and `getElectors.js` to input MySQL credentials.

Once edited, pull the elector list.

    node getElectors.js
Once the data has been pulled to the Database, you can run a node server and query the elector list

    node bin/www
 This will start your node server.  Now you can send `GET` requests with your search term.
 
Endpoints are formatted as

    /api/:search/:state/:city

The only required field is the `:search` field.  Use the `:state` and `:city` to narrow down your search.

Give it a try!