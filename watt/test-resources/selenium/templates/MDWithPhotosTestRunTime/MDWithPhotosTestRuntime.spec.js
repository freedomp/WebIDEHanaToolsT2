'use strict';

var webdriver = require('selenium-webdriver'),
    test = require('selenium-webdriver/testing'),
    assert = require('selenium-webdriver/testing/assert'),
    webide = require('../../pageobjects/WebIDE'),
    utils = require('../../pageobjects/Utils'),
    appruntime = require('../../pageobjects/AppRunTime'),
    projectwizard = require('../../pageobjects/ProjectWizard'),
    path = require('path'),
    configuration = require('./Configuration.js');

var By = webdriver.By,
    until = webdriver.until;


var mappings = {

    imagesListItems : {type : 'xpath' , path : '//*[contains(@id, "attachmentsCarousel")][@role="listitem"]'},
    addButton : {type : 'css' , path : 'span[aria-label=add]'},
    removeButton : {type : 'css' , path : 'span[aria-label="less"]'},
    inputFile : {type : 'css' , path : '#fileInput'},
    runMenuBar : {type : 'css' , path : '#menubarapplicationMenu-run'},
    okBtn : {type : 'xpath' , path : '//*[contains(@id, "okDialogButton")][@type="button"]'},
    okRemoveBtn : {type : 'xpath' , path : '//*[contains(@id, "okRemoveDialogButton")][@type="button"]'},
    cancelBtn : {type : 'xpath' , path : '//*[@class="sapMBtnContent"][text()="Cancel"]'},
    appRejLabel : {type : 'xpath' , path : '//*[contains(@id, "oStatusId")]//span[1]'},
    approveBtn : {type : 'xpath' , path : '//*[contains(@id, "approve")][@type="button"]'},
    rejectBtn : {type : 'xpath' , path : '//*[contains(@id, "reject")][@type="button"]'},
    saveBtn : {type : 'xpath' , path : '//*[contains(@id, "save")][@type="button"]'},
    cameraImg : {type : 'xpath' , path : '//*[contains(@id, "attachmentsCarousel")][@role="listitem"]//*//img[@class="sapMImg sapMPointer"]'},
    topAmountNumber : {type : 'css' , path : 'span.sapMObjectNumberText'},
    savedAlert : {type : 'xpath' , path : '//*[@class="sapMMessageToast sapUiSelectable"][@role="alert"]'}
};


describe('Generate MD with Photos - Check Run Time', function () {
    'use strict';
    this.timeout(configuration.startupTimeout);
    var driver;

    test.before(function () {
        var caps = webdriver.Capabilities.chrome();
        driver = new webdriver.Builder().withCapabilities(caps).build();
    });

    test.after(function () {
        driver.quit();
    });

    var checkForLabelsInApplicationRunTime  = function(){
        var aLabels = ["CheckedOn","ClaimedsumAmount","Comment","Images"];
        var appRunTime = new appruntime(driver, By, until, configuration);

        for(var i = 0 ; i<aLabels.length ; i++){
            appRunTime.isLabelExists(aLabels[i]);
        }
    };

    var insertAndSaveValue = function(oLocator, sValue){

        return waitingForMessageHidden().then(function() {
            var saveBtnLocator = utils.toLocator(mappings.saveBtn);
            return driver.myWait(oLocator, configuration.defaultTimeout).then(function (oNumericAtt) {
                return driver.doubleClick(oNumericAtt).then(function () {
                    return driver.myWaitAndSendKeys(sValue, oLocator, configuration.defaultTimeout).then(function () {
                        return driver.myWaitAndClick(saveBtnLocator, configuration.defaultTimeout);
                    });
                });
            });
        });
    };

    var getTopAmount = function(){

        return waitingForMessageHidden().then(function() {
            var topAmountNumberLocator = utils.toLocator(mappings.topAmountNumber);

            return driver.myWait(topAmountNumberLocator, configuration.defaultTimeout).then(function (oTopAmount) {
                return oTopAmount.getAttribute("innerHTML").then(function (sAmount) {
                    return sAmount;
                });
            });
        });
    };

    var updateTextFieldValue = function(){

        var sAmountText = "120.00";
        var numericAtt = {type : 'xpath' , path : '//*[contains(@id, "numericAttributeInputField-inner")]'};
        var numericAttLocator = utils.toLocator(numericAtt);

        return waitingForMessageHidden().then(function() {
            return getTopAmount().then(function (sOrigAmount) {
                return insertAndSaveValue(numericAttLocator, sAmountText).then(function () {
                    return waitingForMessageHidden().then(function() {
                        return getTopAmount().then(function (sNewAmount) {
                            console.log("Update amount to " + sAmountText);
                            assert(sNewAmount).equalTo(sAmountText);
                            // update back the parameter
                            return insertAndSaveValue(numericAttLocator, sOrigAmount);
                        });
                    });
                });
            });
        });
    };

    var waitingForMessageHidden = function(){
        var savedAlert = utils.toLocator(mappings.savedAlert);

        return driver.isElementPresent(savedAlert).then(function(oRes) {
            if (oRes){
                return waitingForMessageHidden();
            }
            else{
                driver.sleep(2000);
                return;
            }
        });


    };

    var checkApproveRejectStatus = function(oBtn , appRejLocator, expectedStatus) {

        var btnLocator = utils.toLocator(oBtn);

        return driver.myWaitAndClick(btnLocator, configuration.defaultTimeout).then(function() {
            return waitingForMessageHidden().then(function() {
                return driver.myWait(appRejLocator, configuration.defaultTimeout).then(function(oLabelStatus) {
                    return oLabelStatus.getAttribute("innerHTML").then(function(sStatus){
                        console.log("Update report to " + expectedStatus + " status.");
                        assert(sStatus).equalTo(expectedStatus);
                    });
                });
            });
        });
    };

    var updateApproveRejectStatus = function(){

        var appRejLocator = utils.toLocator(mappings.appRejLabel);

        return waitingForMessageHidden().then(function() {
            return driver.myWait(appRejLocator, configuration.defaultTimeout).then(function (oElement) {
                return oElement.getAttribute("innerHTML").then(function (sStatus) {
                    if (sStatus === "Approved") {
                        checkApproveRejectStatus(mappings.rejectBtn, appRejLocator, "Rejected");
                        // Change back to orig status
                        checkApproveRejectStatus(mappings.approveBtn, appRejLocator, "Approved");
                    }
                    else {
                        checkApproveRejectStatus(mappings.approveBtn, appRejLocator, "Approved");
                        // Change back to orig status
                        checkApproveRejectStatus(mappings.rejectBtn, appRejLocator, "Rejected");
                    }
                });
            });
        });
    };

    var switchWindowAndClose = function(){

        return driver.getWindowHandle().then(function(oCurrentWindow) {
            driver.sleep(2000);
            console.log("Current window - " + oCurrentWindow);
            return driver.getAllWindowHandles().then(function (aHandles) {
                var oNewHandle;
                aHandles.forEach(function (oHandle, index) {
                    if (oHandle !== oCurrentWindow) {
                        return driver.close().then(function(){
                            return  driver.switchTo().window(oHandle);
                        });
                    }
                });
            });
        });
    };


    var runAndSwitchToPreviewWindow = function(webIDE){
        var runMenuBar = utils.toLocator(mappings.runMenuBar);

        return driver.wait(until.elementLocated(runMenuBar), configuration.defaultTimeout).then(function() {
            return webIDE.goThroughMenubarItemsAndSelect(["Run", "Run as", "Web Application  "]).then(function () {
                return driver.getWindowHandle().then(function(oCurrentWindow) {
                    driver.sleep(2000);
                    console.log("Current window - " + oCurrentWindow);
                    return driver.getAllWindowHandles().then(function (aHandles) {
                        var oNewHandle;
                        aHandles.forEach(function (oHandle, index) {
                            if (oHandle !== oCurrentWindow) {
                                oNewHandle = oHandle;
                            }
                        });
                        return oNewHandle;
                    });
                });
            });
        });
    };

    var getNumberOfImages = function() {

        driver.sleep(5000);
        var imagesListItems = utils.toLocator(mappings.imagesListItems);

        return driver.wait(until.elementLocated(imagesListItems), configuration.defaultTimeout).then(function() {
            return driver.findElements(imagesListItems).then(function (aImagesListItems) {
                    return aImagesListItems.length;
            });
        });
    };

    var removeImageToCarouselAndCheck = function(){

        return getNumberOfImages().then(function(numberOfImagesBefore){
            return driver.myWaitAndClick(utils.toLocator(mappings.removeButton), configuration.defaultTimeout).then(function(){
                return driver.myWaitAndClick(utils.toLocator(mappings.okRemoveBtn) , configuration.startupTimeout).then(function() {
                    return getNumberOfImages().then(function(numberOfImagesAfter){
                        console.log("Remove image from carousel, number of images - " + numberOfImagesAfter);
                        assert(numberOfImagesAfter).equalTo(--numberOfImagesBefore);
                        return driver.myWaitAndClick(utils.toLocator(mappings.removeButton), configuration.defaultTimeout).then(function(){
                            return driver.myWaitAndClick(utils.toLocator(mappings.okRemoveBtn) , configuration.startupTimeout);
                        });
                    });
                });
            });
        });
    };

    var addImageToCarouselAndCheck = function(){

        return driver.myWaitAndClick(utils.toLocator(mappings.addButton), configuration.defaultTimeout).then(function(){
            return addImageInDialog().then(function(){
                return getNumberOfImages().then(function(numberOfImagesBefore){
                    return driver.myWaitAndClick(utils.toLocator(mappings.addButton), configuration.defaultTimeout).then(function(){
                        return addImageInDialog().then(function(){
                            return getNumberOfImages().then(function (numberOfImagesAfter) {
                                console.log("Add image to carousel, number of images - " + numberOfImagesAfter);
                                assert(numberOfImagesAfter).equalTo(++numberOfImagesBefore);
                            });
                        });
                    });
                });
            });
        });
    };

    var addImageInDialog = function(){
        var sZipPath = path.resolve(__dirname, 'images/sap.jpg');

        return driver.myWait(utils.toLocator(mappings.inputFile) , configuration.startupTimeout).then(function(inputFileElement) {
            driver.sleep(1000);
            return inputFileElement.sendKeys(sZipPath).then(function () {
                return driver.myWaitAndClick(utils.toLocator(mappings.okBtn), configuration.startupTimeout);
            });
        });
    };

    var addAndRemvoeImage = function(){
        return addImageToCarouselAndCheck().then(function () {
            return removeImageToCarouselAndCheck();
        });
    };

    test.it(
        'Generate MD with photos project - Check Run Time',
        function (done) {
            driver.get(configuration.getParam(configuration.KEYS.HOST));

            var hcpLoginPage = new HcpLoginPage(driver);
            hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
            hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
            hcpLoginPage.login();

            var webIDE = new webide(driver, By, until, configuration);
            return webIDE.loadAndOpenWelcomePerspective().then(function() {
                var projectWizard = new projectwizard(driver, By, until, configuration);
                var isWithPhotosTemplate = true;
                return projectWizard.generateNewMDWithPhotosProject(isWithPhotosTemplate);
            }).then(function() {
                var generatedProjectLocator = By.css("li[title='" + configuration.projectName + "']");
                return driver.wait(until.elementLocated(generatedProjectLocator), configuration.defaultTimeout);
            }).then(function(){
                return runAndSwitchToPreviewWindow(webIDE);
            }).then(function(oNewHandle){
                return driver.switchTo().window(oNewHandle);
            }).then(function(){
                var iFrame =   utils.toLocator({type : 'css' , path :"#display"});
                return driver.wait(until.elementLocated(iFrame), configuration.startupTimeout);
            }).then(function(){
                return driver.switchTo().frame("display");
            }).then(function(){
                console.log("Add and remove images");
                return addAndRemvoeImage();
            }).then(function(){
                console.log("Check - Update text fields");
                return updateTextFieldValue();
            }).then(function(){
                console.log("Check - Approve and Reject Status");
                return updateApproveRejectStatus();
            }).then(function(){
                console.log("Check Labels Exists");
                return checkForLabelsInApplicationRunTime();
            }).then(function() {
                return switchWindowAndClose();
            }).then(function() {
                console.log("Delete Project");
                return webIDE.deleteProjectByName(configuration.projectName);
            }).then(function() {
                assert(true).isTrue();
                done();
            });
        });
});
