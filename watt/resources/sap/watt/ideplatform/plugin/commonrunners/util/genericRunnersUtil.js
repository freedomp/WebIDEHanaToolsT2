define({
	removeById: function(sId, aArray) {
		aArray = jQuery.grep(aArray, function(value) {
			return ("" + value) !== ("" + sId);
		});
	},

	contains: function(sId, aArray) {
		for (var i = 0; i < aArray.length; i++) {
			if (aArray[i] === sId) {
				return true;
			}
		}
		return false;
	}
});