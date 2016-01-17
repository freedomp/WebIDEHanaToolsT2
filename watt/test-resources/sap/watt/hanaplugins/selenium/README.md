# WebIDE SeleniumJS tests

## To run all SeleniumJS tests locally, navigate to the 'com.sap.watt.ide.core' folder and execute:
 * ```grunt selenium```


## To run a specific SeleniumJS test locally, navigate to the 'com.sap.watt.ide.core' folder and execute:
   * ```grunt mochaTest:<The name of your test task, which was defined in the grunt file>```
   * Example: ```grunt mochaTest:example_test```
    
## SeleniumJS Tests guidelines
     
 * Each team has its own configuration file
   * see: src/main/webapp/test-resources/selenium/example/Configuration.js

 * Creating your own test user
   * see: https://wiki.wdf.sap.corp/wiki/display/HANARDL/How+to+create+a+test+SCN+user+for+HCP
 
 * Make sure that once you've create your credentials, update your configuration file accordingly.

 ## Taking selenium tests screenshots
    * In order to take screenshots for your tests, you'll have to maintian the following convension:
    a. Your 'describe' name must not include whitespaces. (use _ between words instead)
      see: src/main/webapp/test-resources/selenium/example/ExampleTest.spec.js
    b. When calling the screenshot method, all you need to pass to the function are two parameters:
            <file_name.png, this>
       for instance: return driver.saveScreenshot("Smoke_Test.png", that);
       In this case, the describe name is 'Smoke_Test'.
    c. if your it() functions > 1, maybe your should consider to call the screenshot function from each
       test, so you could pass different screenshot names, corresponded for your current test.
