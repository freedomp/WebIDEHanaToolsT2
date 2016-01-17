    // Navigation constructor
	function Navigation() {
	    this.aTabsHistory = [];
	    this.iLastEditTabIndex = -1;
    	this.iSelectedTabIndex = -1;
    	this.MAX_TABS_LENGTH = 50;
	}
	
	Navigation.prototype.getSelectedTabIndex = function() {
	    return this.iSelectedTabIndex;
	};
	
	Navigation.prototype.getLastEditTabIndex = function() {
	    return this.iLastEditTabIndex;
	};
	
	Navigation.prototype.setLastEditTabIndex = function(iTabIndex) {
	    this.iLastEditTabIndex = iTabIndex;
	};
	
	Navigation.prototype.getSelectedTabId = function() {
	    if (this.iSelectedTabIndex > -1 && this.iSelectedTabIndex < this.aTabsHistory.length){
	        return this.aTabsHistory[this.iSelectedTabIndex];
	    }
	    return "";
	};

    Navigation.prototype.navigateToLastEdit = function() {
        if (this.hasNavigateToLastEdit()){
            return this.iLastEditTabIndex;
        } else {
            return -1;
        }
	    
	};
	
	Navigation.prototype.navigateBack = function() {
        if (this.hasNavigateBack()){
            this.iSelectedTabIndex--;
        } else {
            return -1;
        }
	    return this.getSelectedTabIndex();
	};
	
	Navigation.prototype.navigateForward = function() {
        if (this.hasNavigateForward()){
            this.iSelectedTabIndex++;
        } else {
            return -1;
        }
	    return this.getSelectedTabIndex();
	};
	
	Navigation.prototype.addTab = function(iTabdId) {
	    if (iTabdId) {
	        // After rendering the last tab is selected again, ignore it!
	        if (this.hasTabs() && this.aTabsHistory[this.aTabsHistory.length - 1] === iTabdId) {
	            return;
	        }

	        this.aTabsHistory.push(iTabdId);
	        this.iSelectedTabIndex = this.aTabsHistory.length - 1;
	        this._handleMaxTabsLength();
	    }
	};
	
	/*
	    Remove the tabs with the name sFullPathName
	*/
	Navigation.prototype.removeTabs = function(iTabId, iClosedIndex) {
	    if (!this.hasTabs() || !iTabId) {
	        return -1;
	    }
	    //handle last edit tab on tab deletions
	    if(this.getLastEditTabIndex() === iClosedIndex){//if the closed is the last edit -> update no more last edit -1
            this.setLastEditTabIndex(-1);
        }else if(this.getLastEditTabIndex() > iClosedIndex){//if the closed is lower than the last edited, decrease the index by 1
            this.iLastEditTabIndex--;
        }
        
		var aTempTabs = [];
        for (var i = 0; i < this.aTabsHistory.length; i++) {
        	if(i === this.iSelectedTabIndex){
        		if (this.aTabsHistory[i] === iTabId || this.aTabsHistory[i] === aTempTabs[aTempTabs.length-1]) { // current history tab is the closed one
					this.iSelectedTabIndex = aTempTabs.length-1;
        		} else {
        			this.iSelectedTabIndex = aTempTabs.length;
        		}
        	}
	    	if (this.aTabsHistory[i] !== iTabId && (aTempTabs.length === 0 || aTempTabs[aTempTabs.length-1] !== this.aTabsHistory[i])) {
	    		aTempTabs.push(this.aTabsHistory[i]);
	    	}
	    }
        this.aTabsHistory = aTempTabs;
        
	    if (this.iSelectedTabIndex === -1 && this.hasTabs()){
	        this.navigateForward();
	    }
	    return this.iSelectedTabIndex;
	};

   
	/*
	    A tab is selected at the first time after open or after click on the tab and select it.
	*/
	Navigation.prototype.selectTab = function(iTabdId) {
	    if (!iTabdId || iTabdId == -1) {
	        return;
	    }
	    // if the tab doesn't exist then it is new just add it at the end and update the iSelectedTabIndex.
	    var iFoundIndex = this.aTabsHistory.indexOf(iTabdId);
        if (iFoundIndex === -1) {
            // Add a new tab
            this.addTab(iTabdId);
        } else if (iFoundIndex !== this.iSelectedTabIndex) {
            var beginSlice = this.iSelectedTabIndex + 1;
            var iHowManyTabsToRemove = this.aTabsHistory.length - this.iSelectedTabIndex;
            if (iHowManyTabsToRemove > 0) {
                this.aTabsHistory.splice(beginSlice, iHowManyTabsToRemove);
            }
            this.addTab(iTabdId);
        }
        /*else if (iFoundIndex === this.iSelectedTabIndex) then do nothing.
        }*/
	};
	
	Navigation.prototype.hasNavigateBack = function() {	
        if (this.hasTabs() && this.iSelectedTabIndex > 0) {
            return true;
        }
        return false;
    };
    
    Navigation.prototype.hasNavigateToLastEdit = function(iIndex) {	
        if (this.iLastEditTabIndex >= 0 && this.iLastEditTabIndex != iIndex) {
            return true;
        }
        return false;
    };

    Navigation.prototype.hasNavigateForward = function() {	
        if (this.hasTabs() && this.iSelectedTabIndex < this.aTabsHistory.length - 1) {
            return true;
        }
        return false;
    };
   
   Navigation.prototype.hasTabs = function() {	
        if (this.aTabsHistory.length > 0) {
            return true;
        }
        return false;
    };
    
    Navigation.prototype._handleMaxTabsLength = function() {
      if (this.aTabsHistory.length > this.MAX_TABS_LENGTH) {
            this.aTabsHistory.splice(0, 1);
      }
    };