// iteration 0 ok
/* global jQuery,sap, $, window */

(function() {
    "use strict";

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchHelper');
    var module = sap.ushell.renderers.fiori2.search.SearchHelper = {};

    jQuery.sap.require('jquery.sap.storage');

    // =======================================================================
    // Regex Tester
    // =======================================================================            
    module.Tester = function() {
        this.init.apply(this, arguments);
    };
    module.Tester.prototype = {

        init: function(sSearchTerms) {

            // normalize searchterms in string format
            sSearchTerms = sSearchTerms || "*";

            // escape special chars
            sSearchTerms = sSearchTerms.replace(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1");

            // store tokenized search terms array
            this.aSearchTerms = this.tokenizeSearchTerms(sSearchTerms);
            for (var j = 0; j < this.aSearchTerms.length; ++j) {
                // * has special meaning in enterprise search context 
                // (use [^\s]* and not [^\s]+ because sap* shall match sap)
                this.aSearchTerms[j] = this.aSearchTerms[j].replace(/\*/g, "[^\\s]*");
                // check if search term is Chinese (in unicode Chinese characters interval).
                var bIsChinese = this.aSearchTerms[j].match(/[\u3400-\u9faf]/) !== null ? true : false;
                if (bIsChinese) {
                    // match any place of the word, case insensitive
                    // \b \w are evil regarding unicode
                    this.aSearchTerms[j] = new RegExp(this.aSearchTerms[j], 'gi');
                } else {
                    // only match beginnings of the word, case insensitive
                    // \b \w are evil regarding unicode
                    this.aSearchTerms[j] = new RegExp('(?:^|\\s)' + this.aSearchTerms[j], 'gi');
                }
            }

        },

        // If the text to be searched contains all of search terms, 
        // return object with match flag and highlighted text or space in case of not match
        test: function(sText2BeSearched) {
            var oReturn = {
                bMatch: false,
                sHighlightedText: ''
            };

            if (!sText2BeSearched) {
                return oReturn;
            }

            this.initializeBoldArray(sText2BeSearched);

            // global flag is there is any bold char
            this.globalBold = false;
            var oRegSearchTerm;
            var bMatch = false;
            var aMatchResult;


            for (var j = 0; j < this.aSearchTerms.length; ++j) {
                // only match beginnings of the word, case insensitive
                oRegSearchTerm = this.aSearchTerms[j];

                // check for wildcard * search -> wildcard always matches -> continue with next term
                if (oRegSearchTerm.toString() === '/(?:^|\\s)[^\\s]*/gi' ||
                    oRegSearchTerm.toString() === '/[^\\s]*/gi') {
                    continue;
                }

                bMatch = false;
                // match?
                var lastIndex = -1;
                while ((aMatchResult = oRegSearchTerm.exec(sText2BeSearched)) !== null) {
                    bMatch = true;

                    // prevent endless loop, should not happen but who knows...
                    if (oRegSearchTerm.lastIndex === lastIndex) {
                        break;
                    }
                    lastIndex = oRegSearchTerm.lastIndex;

                    //aMatchResult.index: the start position of matching term
                    //oRegSearchTerm.lastIndex: the start position of next search
                    var startIndex = this.indexOfFirstNoneWhiteSpaceChar(sText2BeSearched, aMatchResult.index);
                    if (startIndex < 0) {
                        continue;
                    }
                    this.markBoldArray(startIndex, oRegSearchTerm.lastIndex);

                }

                if (bMatch === false) {
                    return oReturn;
                }

            }

            // search terms have logical "and" relation, all of them must be available in text
            oReturn.bMatch = true;
            oReturn.sHighlightedText = this.render(sText2BeSearched);

            return oReturn;

        },

        indexOfFirstNoneWhiteSpaceChar: function(text, startIndex) {
            text = text.substring(startIndex);
            var match = /[^\s]/.exec(text);
            if (!match) {
                return -1;
            }
            return match.index + startIndex;
        },

        //tokenize search terms splitted by spaces
        tokenizeSearchTerms: function(terms) {
            var termsSeparatedBySpace = terms.split(" ");
            var newTerms = [];
            //Split search terms with space and wildcard into array
            $.each(termsSeparatedBySpace, function(i, termSpace) {
                termSpace = $.trim(termSpace);
                if (termSpace.length > 0 && termSpace !== '.*') {
                    //                var termsSeparatedByWildcard = termSpace.split("*");
                    //                $.each(termsSeparatedByWildcard, function (i, term) {
                    //                    if (term.length > 0) {
                    //                        newTerms.push(term);
                    //                    }
                    //                });
                    newTerms.push(termSpace);
                }
            });
            return newTerms;
        },

        // initialize the bold array 
        initializeBoldArray: function(sText) {
            // create array which stores flag whether character is bold or not
            this.bold = new Array(sText.length);
            for (var i = 0; i < this.bold.length; ++i) {
                this.bold[i] = false;
            }
        },

        // mark bold array
        markBoldArray: function(nStartIndex, nEndIndexPlus1) {
            // mark bold characters in global array 
            for (var i = nStartIndex; i < nEndIndexPlus1; i++) {
                this.bold[i] = true;
                this.globalBold = true;
            }
        },

        // render original text with <b> tag
        render: function(sOriginalText) {

            // short cut if there is nothing to do
            if (!this.globalBold) {
                return sOriginalText;
            }

            // highlight sOriginalText according to information in this.bold
            var bold = false;
            var result = [];
            var start = 0;
            var i;
            for (i = 0; i < sOriginalText.length; ++i) {
                if ((!bold && this.bold[i]) || // check for begin of bold sequence
                    (bold && !this.bold[i])) { // check for end of bold sequence
                    result.push(sOriginalText.substring(start, i));
                    if (bold) {
                        // bold section ends
                        result.push("</b>");
                    } else {
                        // bold section starts
                        result.push("<b>");
                    }
                    bold = !bold;
                    start = i;
                }
            }

            // add last part
            result.push(sOriginalText.substring(start, i));
            if (bold) {
                result.push("</b>");
            }
            return result.join("");
        }
    };


    // =======================================================================
    // decorator for delayed execution 
    // =======================================================================            
    module.delayedExecution = function(originalFunction, delay) {
        var timerId = null;
        var decorator = function() {
            var args = arguments;
            var that = this;
            if (timerId) {
                window.clearTimeout(timerId);
            }
            timerId = window.setTimeout(function() {
                timerId = null;
                originalFunction.apply(that, args);
            }, delay);
        };
        decorator.abort = function() {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
        return decorator;
    };

    // =======================================================================
    // decorator for refusing outdated requests
    // =======================================================================            
    module.refuseOutdatedRequests = function(originalFunction, requestGroupId) {
        /* eslint new-cap:0 */
        var lastRequestId = 0;
        var decorator = function() {
            var args = arguments;
            var that = this;
            var requestId = ++lastRequestId;
            var deferred = new jQuery.Deferred();
            //console.log(requestGroupId + ' start ', requestId);
            originalFunction.apply(that, args).done(function() {
                if (requestId !== lastRequestId) {
                    //console.log(requestGroupId + ' throw ', requestId, ' because max', maxRequestId);
                    return; // throw away outdated requests                
                }
                //console.log(requestGroupId + ' accept ', requestId);
                deferred.resolve.apply(deferred, arguments);
            }).fail(function() {
                if (requestId !== lastRequestId) {
                    return;
                } // throw away outdated requests
                deferred.reject.apply(deferred, arguments);
            });
            return deferred;
        };
        decorator.abort = function() {
            ++lastRequestId;
            //console.log(id + ' abort', maxRequestId);
        };
        if (requestGroupId) {
            module.outdatedRequestAdministration.registerDecorator(requestGroupId, decorator);
        }
        return decorator;
    };

    // =======================================================================
    // abort all requests for a given requestGroupId
    // =======================================================================            
    module.abortRequests = function(requestGroupId) {
        var decorators = module.outdatedRequestAdministration.getDecorators(requestGroupId);
        for (var i = 0; i < decorators.length; ++i) {
            var decorator = decorators[i];
            decorator.abort();
        }
    };

    // =======================================================================
    // administration of outdated request decorators
    // =======================================================================            
    module.outdatedRequestAdministration = {

        decoratorMap: {},

        registerDecorator: function(requestGroupId, decorator) {
            var decorators = this.decoratorMap[requestGroupId];
            if (!decorators) {
                decorators = [];
                this.decoratorMap[requestGroupId] = decorators;
            }
            decorators.push(decorator);
        },

        getDecorators: function(requestGroupId) {
            var decorators = this.decoratorMap[requestGroupId];
            if (!decorators) {
                decorators = [];
            }
            return decorators;
        }

    };

    // =======================================================================
    // <b>, <i> tag unescaper
    // ======================================================================= 
    module.boldTagUnescaper = function(domref) {
        var innerhtml = domref.innerHTML;
        while (innerhtml.indexOf('&lt;b&gt;') + innerhtml.indexOf('&lt;/b&gt;') >= -1) { // while these tags are found
            innerhtml = innerhtml.replace('&lt;b&gt;', '<b>');
            innerhtml = innerhtml.replace('&lt;/b&gt;', '</b>');
        }
        while (innerhtml.indexOf('&lt;i&gt;') + innerhtml.indexOf('&lt;/i&gt;') >= -1) { // while these tags are found
            innerhtml = innerhtml.replace('&lt;i&gt;', '<i>');
            innerhtml = innerhtml.replace('&lt;/i&gt;', '</i>');
        }
        domref.innerHTML = innerhtml;
    };

    // =======================================================================
    // <b> tag unescaper with the help of text() 
    // ======================================================================= 
    module.boldTagUnescaperByText = function(domref) {
        var $d = $(domref);

        // Security check, whether $d.text() contains tags other than <b> and </b>
        var s = $d.text().replace(/<b>/gi, '').replace(/<\/b>/gi, ''); /// Only those two HTML tags are allowed.

        // If not
        if (s.indexOf('<') === -1) {
            $d.html($d.text());
        }
    };

    // =======================================================================
    // emphasize whyfound in case of ellipsis
    // ======================================================================= 
    module.forwardEllipsis4Whyfound = function(domref) {
        var $d = $(domref);

        var posOfWhyfound = $d.html().indexOf("<b>");
        if (posOfWhyfound > 2 && domref.offsetWidth < domref.scrollWidth) {
            var emphasizeWhyfound = "..." + $d.html().substring(posOfWhyfound);
            $d.html(emphasizeWhyfound);
        }
    };


    // =======================================================================
    // Hasher  
    // using window.hasher does not work because
    // hasher always use encodeURL for the whole hash but for example we need
    // - to encode '=' in a value (of name value pair) 
    // but not the '=' separating name and value
    // =======================================================================            
    module.hasher = {

        hash: null,

        setHash: function(hash) {
            // compare using decodeURIComponent because encoding may slightly differ
            // (Saved tiles scramble the URL. The URL of a saved tile is different
            //  to the URL serialized by search app)
            if (decodeURIComponent(window.location.hash) !== decodeURIComponent(hash)) {
                try {
                    window.location.hash = hash;
                } catch (error) {
                    // in IE url cannot be update if longer than 2083 chars -> show error message to the user
                    this.showUrlUpdateError(error);
                }
            }
            this.hash = hash;
        },

        hasChanged: function() {
            if (decodeURIComponent(this.hash) !== decodeURIComponent(window.location.hash)) {
                return true;
            }
            return false;
        },

        showUrlUpdateError: function(error) {

            // display error only one times
            if (this.urlError) {
                return;
            }
            this.urlError = true;

            // show message box
            jQuery.sap.require("sap.m.MessageBox");
            var message = sap.ushell.resources.i18n.getText('searchUrlErrorMessage', error.toString());
            sap.m.MessageBox.alert(message, {
                title: sap.ushell.resources.i18n.getText('searchUrlErrorTitle'),
                icon: sap.m.MessageBox.Icon.ERROR
            });
        }

    };


    // =======================================================================
    // Check whether the filter button status is pressed or not
    // ======================================================================= 
    module.loadFilterButtonStatus = function() {
        if (jQuery.sap.storage && jQuery.sap.storage.isSupported()) {
            var facetsShown = jQuery.sap.storage.get("showSearchFacets");
            if (!facetsShown) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    };

    // =======================================================================
    // Set button status in sap storage
    // ======================================================================= 
    module.saveFilterButtonStatus = function(areFacetsShown) {
        if (jQuery.sap.storage.isSupported()) {
            jQuery.sap.storage.put("showSearchFacets", areFacetsShown);
        }
    };

    // =======================================================================
    // Subscribe the given event only once
    // ======================================================================= 
    module.idMap = {};

    module.subscribeOnlyOnce = function(id, eventName, callBack, selfControl) {
        if (module.idMap[id]) {
            module.idMap[id].unsubscribe();
        }
        var wrapper = function() {
            callBack.apply(selfControl);
            sap.ui.getCore().getEventBus().unsubscribe(eventName, wrapper, selfControl);
        };
        sap.ui.getCore().getEventBus().subscribe(eventName, wrapper, selfControl);
        module.idMap[id] = {
            unsubscribe: function() {
                sap.ui.getCore().getEventBus().unsubscribe(eventName, wrapper, selfControl);
            }
        };
    };

    // =======================================================================
    // Focus Handler
    // =======================================================================            
    module.SearchFocusHandler = function() {
        this.init.apply(this, arguments);
    };
    module.SearchFocusHandler.prototype = {

        init: function(oSearchView) {
            this.oSearchView = oSearchView;
        },

        // get the controlDomRef to be focused
        get2BeFocusedControlDomRef: function() {
            if (!this.oModel) {
                this.oModel = this.oSearchView.getModel();
            }

            var index = 0;
            var control = null;
            var controlDomRef = null;
            var skip = this.oModel.getSkip(); // skip>0 showMore else initial load
            if (this.oModel.getProperty('/boCount') > 0 && this.oModel.getProperty('/appCount') > 0) { // mixed result list
                index = (skip > 0) ? (skip + 1) : 0;
                control = this.oSearchView.resultList.getItems()[index];
                if (control && control.getDomRef) {
                    controlDomRef = control.getDomRef();
                }
                //expand detail area with animation
                //control.getContent()[0].showDetails();
            } else if (this.oModel.getProperty('/boCount') > 0) { // bo result items only
                index = (skip > 0) ? skip : 0;
                control = this.oSearchView.resultList.getItems()[index];
                //expand detail area with animation
                //control.getContent()[0].showDetails();
                if (control && control.getDomRef) {
                    controlDomRef = control.getDomRef();
                }
            } else if (this.oModel.getProperty('/appCount') > 0) { // app result items only
                var oTilesContainer = this.oSearchView.appSearchResult;
                index = (skip > 0) ? (Math.floor((skip + 1) / oTilesContainer.getTilesPerRow()) * oTilesContainer.getTilesPerRow() - 1) : 0;

                // control is jsview
                control = oTilesContainer.getTiles()[index];
                if (control && control.getDomRef) {
                    controlDomRef = window.$(control.getDomRef()).closest(".sapUshellSearchTileWrapper")[0];
                }

            }

            return controlDomRef;
        },

        // set focus
        // ===================================================================        
        setFocus: function() {
            /* eslint no-lonely-if:0 */

            // this method is called  
            // 1) after event allSearchFinished (see registration in Search.controller)
            // 2) after event afterNavigate (see registration in searchshellhelper)

            var that = this;
            var retries = 10;

            // method for setting the focus with periodic retry
            var doSetFocus = function() {

                that.focusSetter = null;

                var controlDomRef = that.get2BeFocusedControlDomRef();

                // check that all conditions for setting the focus are fullfilled
                if (!controlDomRef || // condition 1
                    sap.ui.getCore().getUIDirty() || // condition 2
                    sap.ui.getCore().byId('loadingDialog').isOpen() || // condition 3
                    jQuery('.sapUshellSearchTileContainerDirty').length > 0 || // condition 4
                    jQuery('.sapMBusyDialog').length > 0) { // condition 5
                    if (--retries) {
                        that.focusSetter = setTimeout(doSetFocus, 100);
                    }
                    return;
                }

                // condition 1:
                // control and its domref do need to exist
                // condition 2:
                // no rendering process is running
                // focus can only be set after ui5 rendering is finished because ui5 preserves the focus
                // condition 3:
                // loading dialog (app loading) is closed
                // loading dialog restores old focus (using timeout 300ms) so we need to wait until loading dialog has finished
                // condition 4:
                // wait that app tile container has finished rendering
                // app tile container has two rendering steps. First step is just for calculating number of tiles.
                // condition 5:
                // wait that buys indicators are finished

                // set focus
                controlDomRef.focus();

                // expand result líst item
                var control = sap.ui.getCore().byId(controlDomRef.getAttribute('id'));
                if (control && control.getContent && control.getContent()[0]) {
                    var resultListItem = control.getContent()[0];
                    if (resultListItem.showDetails) {
                        resultListItem.showDetails();
                    }
                }

                // Fix Result List Keyboard Navigation                
                that.oSearchView.resultList.collectListItemsForNavigation();
            };

            // cancel any scheduled focusSetter
            if (this.focusSetter) {
                clearTimeout(this.focusSetter);
                this.focusSetter = null;
            }

            // set focus
            doSetFocus();

        }

    };
})();
