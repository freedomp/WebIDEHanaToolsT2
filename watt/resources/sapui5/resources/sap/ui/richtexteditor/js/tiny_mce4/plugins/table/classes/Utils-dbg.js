
define("tinymce/tableplugin/Utils", [
	"tinymce/Env"
], function(Env) {
	function getSpanVal(td, name) {
		return parseInt(td.getAttribute(name) || 1, 10);
	}

	function paddCell(cell) {
		if (!Env.ie || Env.ie > 10) {
			cell.innerHTML = '<br data-mce-bogus="1" />';
		}
	}

	return {
		getSpanVal: getSpanVal,
		paddCell: paddCell
	};
});
