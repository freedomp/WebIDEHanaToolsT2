REM this bat(windows env only) is used to generate index files for ui5 libraries
REM please check the config file in each library folder to make sure the library resource can be located
pause

call npm install -g jszip
call npm install -g xml2js
call npm install -g esprima

set NODE_PATH=%appdata%\npm\node_modules

set logdir=target_log
if not exist %logdir% mkdir %logdir%

cd ui5\
node ui5Parser > ../%logdir%/ui5_parser.log
node ui5Generator > ../%logdir%/ui5_generator.log
cd ..
