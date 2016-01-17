define(function() {


	var EditorMode =  function(type, desc, extensions) {
		this.type = type;
		this.desc = desc;
		this.mode = "ace/mode/" + type;
		if (/\^/.test(extensions)) {
			var re = extensions.replace(/\|(\^)?/g, function(a, b) {
				return "$|" + (b ? "^" : "^.*\\.");
			}) + "$";
		} else {
			var re = "^.*\\.(" + extensions + ")$";
		}
	
		this.extRe = new RegExp(re, "gi");
	};

	
	EditorMode.prototype = {
	
		supportsFile : function(filename) {
			return filename.match(this.extRe);
		}
	};
	
	return EditorMode;
});

