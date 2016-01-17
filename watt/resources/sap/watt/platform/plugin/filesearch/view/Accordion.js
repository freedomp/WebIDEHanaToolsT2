jQuery.sap.declare("sap.watt.platform.plugin.filesearch.view.Accordion");

/*
 * customized Accordian control, to disable drag & drop
 * and also allow open more than 1 sections
 */
sap.ui.commons.Accordion.extend("sap.watt.platform.plugin.filesearch.view.Accordion", {
	/**
	* Initialization of the Accordion control
	* @private
	*/
	renderer: {}
});

sap.watt.platform.plugin.filesearch.view.Accordion.prototype.init = function() {
   this.bInitialRendering = false;

   // By default, only one section is opened
   this.activationMode = sap.ui.commons.Accordion.CARD_0_N;

   // Get messagebundle.properties for sap.ui.commons
   this.rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");

   // Array used to store all section titles
   this.aSectionTitles = [];
   sap.ui.commons.Accordion.aAccordions.push(this);
};
sap.watt.platform.plugin.filesearch.view.Accordion.prototype.onAfterRendering = function() {

	// Collect the dom references of the items
	var accordion = this.getDomRef();
	var leftBorder = "0px";
	var rightBorder = "0px";
	//neccessary to make sure IE8 does not deliver medium if no border width is set
	if (jQuery(accordion).css("borderLeftStyle") !== "none") {
		leftBorder = jQuery(accordion).css("border-left-width");
	}
	if (jQuery(accordion).css("borderRightStyle") !== "none") {
		rightBorder = jQuery(accordion).css("border-right-width");
	}
	var borderTotal = parseFloat(leftBorder.substring(0, leftBorder.indexOf("px"))) + parseFloat(rightBorder.substring(0, rightBorder.indexOf("px")));
	accordion.style.height = accordion.offsetHeight - borderTotal - 7 + "px";

	// disable drag & drop
	/*
	this.$().sortable({
		handle: "> div > div",
		stop: jQuery.proxy(this._onSortChange, this)
	});
	*/
};