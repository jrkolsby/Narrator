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

	var addToRead = function(t) {
		script.read += t;
		script.certain = script.certain.substring(t.length,
												  script.certain.length);
		updateTextWithScript();		
	}

	this.addToCertain = function(t) {
		script.certain += t
		updateTextWithScript();

		if (t.replace(" ", "").length > 0) {
			voice.say(t, function(e) { addToRead(e.utterance.text) });
		}
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

	var VOICE_RATE = 1,
		VOICE_PITCH = 1,
		LANG = "en-US";
		URI = 'native';

	this.say = function(u, ended) {
		var msg = new SpeechSynthesisUtterance();

		msg.text = u;
		msg.pitch = VOICE_PITCH;
		msg.rate = VOICE_RATE;
		msg.voiceURI = URI;

		msg.lang = LANG;

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
			console.log("end");
			recognition.start();
			script.addToCertain(" ");
		}

		recognition.onresult = function(event) {
			console.log("result");
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

		recognition.onspeechstart = function() {}
		recognition.onspeechend = function() {}

		recognition.start();
	}
}