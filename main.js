var Transcript = function(text, voice) {
	var script = {
		read: "",
		certain: "",
		uncertain: ""
	}

	var updateTextWithScript = function() {
		text.updateText(script.read,
						script.certain,
						script.uncertain);
	}

	this.addToCertain = function(t) {
		script.certain += t
		updateTextWithScript();

		voice.say(t, function(e) {

			var spoken = e.utterance.text;

			script.read += spoken
			script.certain = script.certain.substring(spoken.length,
													  script.certain.length);

			updateTextWithScript();

		});
	}

	this.setCertain = function(t) {
		script.certain += t;
		updateTextWithScript();
	}

	this.setUncertain = function(t) {
		script.uncertain = t
		updateTextWithScript();
	}
}

var TextInterface = function() {
	var element = {
		read: document.getElementById("spoken"),
		alert: document.getElementById("alert"),
		certain: document.getElementById("certain"),
		uncertain: document.getElementById("uncertain")
	}

	var setCertain = function(t) { element.certain.innerHTML = t }
	var setUncertain = function(t) { element.uncertain.innerHTML = t }
	var setRead = function(t) { element.read.innerHTML = t }

	this.setAlert = function(t) { element.alert.innerHTML = t }

	this.updateText = function(read, certain, uncertain) {
		setRead(read);
		setCertain(certain);
		setUncertain(uncertain);
	}

	this.UPGRADE_ALERT = "Requires Google Chrome version 24 or above";
	this.ERROR_ALERT = "Speech recognition error: ";
}

var TalkInterface = function() {

	var script = "";
	var voices = window.speechSynthesis.getVoices();

	var VOICE_RATE = 1;
	var VOICE_PITCH = 1;

	this.say = function(u, ended) {
		var msg = new SpeechSynthesisUtterance();

		msg.text = u;
		msg.pitch = VOICE_PITCH;
		msg.rate = VOICE_RATE;

		msg.onend = function(e) { ended(e) }

		window.speechSynthesis.speak(msg);
	}

}
window.onload = function() {

	var text = new TextInterface();
	var voice = new TalkInterface();

	var script = new Transcript(text, voice);

	if (!('webkitSpeechRecognition' in window)) { text.setAlert(text.UPGRADE_ALERT); }
	else {

		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = function() {}

		recognition.onend = function() {
			recognition.start();
			script.addToCertain(" ");
		}

		recognition.onresult = function(event) {
			var uncertainAggregate = "";
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				var addition = event.results[i][0].transcript;
				if (event.results[i].isFinal) { script.addToCertain(addition) }
				else { uncertainAggregate += addition }
			}
			script.setUncertain(uncertainAggregate);
		}

		recognition.onerror = function(event) {
			text.setAlert(text.ERROR_ALERT + event.error);
		}
		recognition.start();
	}
}