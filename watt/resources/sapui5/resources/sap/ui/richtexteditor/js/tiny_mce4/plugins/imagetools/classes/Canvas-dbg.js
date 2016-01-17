
define("tinymce/imagetoolsplugin/Canvas", [], function() {
	function create(width, height) {
		return resize(document.createElement('canvas'), width, height);
	}

	function get2dContext(canvas) {
		return canvas.getContext("2d");
	}

	function resize(canvas, width, height) {
		canvas.width = width;
		canvas.height = height;

		return canvas;
	}

	return {
		create: create,
		resize: resize,
		get2dContext: get2dContext
	};
});
