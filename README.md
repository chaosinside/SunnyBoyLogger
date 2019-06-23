# SunnyBoyLogger
This app connects to a SunnyBoy inverter, grabs the production logs for a day, and stores them to a mysql database. It is intended to be ran once per day via cron or task scheduler.

## Getting Started
The instructions below will guide you toward getting the app running on your PC.

### Requirements
*  Node.js

### Download and install Node.js
    https://nodejs.org/en/download/

### Clone this repository
    $ git clone https://github.com/chaosinside/SunnyBoyLogger.git

### Install project packages
    $ cd SunnyBoyLogger
    $ npm install
    
### Add your configuration to .env
    $ vi .env
    DB_HOST="database ip address or hostname" ("localhost" if not specified)
    DB_DATABASE="database name"
    DB_USERNAME="database username"
    DB_PASSWORD="database password"
    SB_HOST="sunnyboy inverter ip address or hostname"
    SB_USERNAME="sunnyboy inverter username" ("usr" if not specified)
    SB_PASSWORD="sunnyboy inverter password"

### Run the app with a date as input
    $ npm start 1/1/1970

## Table information
The output table will be created automatically upon first run and is named "production". All you need to set is a database name, login, and password (unless your database is not running on localhost, in which case you would also need to provide DB_HOST) in the .env file.

* **inverterid**: The serial number of your inverter.
* **datetime**: The datetime in UTC of the record.
* **v**: I assume this is the voltage reading at time of record.
* **kw**: This is calculated from v, and is the kw output at time of record. For the to be honestly know, the inverter should provide amps along with v, but it doesn't do that.

There is a unique constraint on the combined fields inverterid and datetime in order to prevent duplicate records. Aside from the obvious primary key "id", there are also createdAt and updatedAt fields for your convenience.

## More Info
The app attempts to calculate the kW values, however, these don't seem to be exactly consistentent with what I'm seeing on the inverter's webpage. I've spent a significant amount of time trying to match these values up exactly with what the "PV Power" section shows and have not quite figured out that secret sauce yet. The kW values are close enough for now.
