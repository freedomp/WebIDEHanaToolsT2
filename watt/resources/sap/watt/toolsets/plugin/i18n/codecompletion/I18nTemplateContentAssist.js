define([
	"sap/watt/lib/orion/editor/templates"
], function(mTemplates) {

	function findPreviousChar(buffer, offset) {
		var c = "";
		while (offset >= 0) {
			c = buffer[offset];
			if (c === '\n' || c === '\r') { //$NON-NLS-1$ //$NON-NLS-0$
				//we hit the start of the line so we are done
				break;
			} else if (/\s/.test(c)) {
				offset--;
			} else {
				// a non-whitespace character, we are done
				break;
			}
		}
		return c;
	}
	
	function I18nTemplateContentAssistProvider() {
	}
	I18nTemplateContentAssistProvider.prototype = new mTemplates.TemplateContentAssist();
 
	/** 
	 * Determines if the invocation location is a valid place to use
	 * templates.  We are not being too precise here.  As an approximation,
	 * just look at the previous character.
	 *
	 * @return {Boolean} true if the current invocation location is 
	 * a valid place for template proposals to appear.
	 * This means that the invocation location is at the start of a new statement.
	 */
	I18nTemplateContentAssistProvider.prototype.isValid = function(prefix, buffer, offset, context) {
		var previousChar = findPreviousChar(buffer, offset-prefix.length-1);
		return !previousChar || previousChar === '\n' || previousChar === '\r';
	};

	return {
		I18nTemplateContentAssistProvider: I18nTemplateContentAssistProvider
	};
});