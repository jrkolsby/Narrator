window.onload = function() {
	if (!('webkitSpeechRecognition' in window)) {
		upgrade();
	} else {
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = function() {
			console.log("hi");
		}
		recognition.onresult = function(event) {
			console.log(event);
		}
		recognition.onerror = function(event) {}
		recognition.onend = function() {}
	}
}