$(document).ready(function() {

	/* table of content */

	$(".VListToggle").on('click', function() {

		$(this).toggleClass("opened");
		$(this).parent().find("ul").toggle();

	});

	/* off-canvas navigation */

	$("#ToggleMenuButton").on('click', function() {

		$(this).toggleClass("selected");
		$(".navigationOffCanvas").toggleClass("indented");
		$(".content").toggleClass("indented");

	});

	/* target vs implementation */

	$("#TabTargetDesign").on('click', function() {
		$(this).toggleClass("selected");
		$("#TabImplementation").toggleClass("selected");
		$("#ContainerTargetDesign").show();
		$("#ContainerImplementation").hide();
	});

	$("#TabImplementation").on('click', function() {
		$(this).toggleClass("selected");
		$("#TabTargetDesign").toggleClass("selected");
		$("#ContainerTargetDesign").hide();
		$("#ContainerImplementation").show();
	});

});

function loadTableOfContent(highlight) {
	$.get("sections/TableOfContent.html", function(html) {

		if (highlight == "Home") {

			$(".navigationOffCanvas").html(
					html.replace('index.html">' + highlight + '</a>', 'index.html"><span class="selected">' + highlight + '</span></a>'));

		} else {

			$(".navigationOffCanvas").html(
					html.replace(removeWhiteSpace(highlight) + '.html">' + highlight + '</a>', removeWhiteSpace(highlight)
							+ '.html"><span class="selected">' + highlight + '</span></a>'));
		}

	});
}

function removeWhiteSpace(text) {
	text = text.replace(/ |\t/g, '');
	return text;
}