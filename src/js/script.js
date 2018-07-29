var menu = document.getElementById("menu");
var toggle = document.getElementById("toggle");

toggle.addEventListener(
	"click",
	function() {
		if (menu.classList.contains("show-menu")) {
			menu.classList.remove("show-menu");
		} else {
			menu.classList.add("show-menu");
		}
	},
	false
);
