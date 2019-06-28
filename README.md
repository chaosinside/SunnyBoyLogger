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
    DB_DATABASE="database name (required)"
    DB_USERNAME="database username (required)"
    DB_PASSWORD="database password (required)"
    SB_HOST="sunnyboy inverter ip address or hostname (required)"
    SB_USERNAME="sunnyboy inverter username" ("usr" if not specified)
    SB_PASSWORD="sunnyboy inverter password (required)"
    LOGDIR="directory for log files (messages will go to console only if not specified)"

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

### The kW calculation
The app attempts to calculate the kW values, however, these don't seem to be exactly consistentent with what I'm seeing on the inverter's webpage. I've spent a significant amount of time trying to match these values up exactly with what the "PV Power" section shows and have not quite figured out that secret sauce yet. The kW values are close enough for now.

### LOGDIR
If LOGDIR is not specified in the .env file, the program will only output to console. When it is specified, messages will go both to console and to the log file. The logfiles created will be named in YYYY-MM-DD format based on the date input when running the program. It is recommended to use relative pathnames here. In .gitignore the "./logs" folder is automatically ignored.
