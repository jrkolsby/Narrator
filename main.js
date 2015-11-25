var Transcript = function(text, voice) {

	var script = {
		read: "", // Words spoken by TalkInterface
		count: "", // Aggregates words added to unread until said in groups of >=3
		unread: "", // Words not yet spoken by TalkInterface
		certain: "", // Confident words in the current phrase
		uncertain: "" // Unconfident words in the current phrase
	}

	var replace = [
		{word: "f*****", replace: "fucked"},
		{word: "f******", replace: "fucking"},
		{word: "s***", replace: "shit"},
	];

	var updateTextWithScript = function() {
		text.setRead(script.read);
		text.setUnread(script.unread);
		text.setUncertain(script.uncertain);
	}

	var compareStrings = function(a, b) {

		// From: http://stackoverflow.com/questions/8024102/javascript-compare-strings-and-get-end-difference

		var firstOccurance = b.indexOf(a);
		var newString = "";

		if (firstOccurance >= 0) {

			var aLength = a.length;

			if (firstOccurance == 0) { newString = b.substring(aLength) }
			else { newString = b.substring(0, firstOccurance) +
							   b.substring(firstOccurance + aLength) }
		} else { newString = "" }

		return newString;
	}

	var wordCount = function(s) {
		return s.replace(/\s+$/, '').split(/\s+/).length-1;
	}

	var GROUPING_MINIMUM = 2,
		CONFIDENCE_THRESHOLD = 0.4, // Set >1 to prevent speaking of non-final results

	this.handleResult = function(event) {

		var newCertain = "",
			newUncertain = "";
			isFinal = false;

		for (var i = event.resultIndex; i < event.results.length; i++) {
			if (event.results[i][0].confidence > CONFIDENCE_THRESHOLD ||
				event.results[i].isFinal) {

				newCertain = event.results[i][0].transcript;

			} else { newUncertain = event.results[i][0].transcript }

			if (event.results[i].isFinal) { isFinal = true }
		}

		script.uncertain = newUncertain;
		updateTextWithScript();

		var certainAddition = compareStrings(script.certain, newCertain);

		script.certain += certainAddition;
		script.unread += certainAddition;
		script.count += certainAddition;

		updateTextWithScript();

		if (wordCount(script.count) >= GROUPING_MINIMUM || isFinal) {

			voice.say(script.count, function(e) {
				
				var newRead = e.utterance.text;
				var newUnread = compareStrings(newRead, script.unread);

				script.read += newRead;
				script.unread = newUnread;

				updateTextWithScript();
			});

			script.count = "";
		}

		if (isFinal) { script.certain = "" }
	}
}

var TextInterface = function() {
	var element = {
		read: document.getElementById("read"),
		alert: document.getElementById("alert"),
		unread: document.getElementById("unread"),
		uncertain: document.getElementById("uncertain")
	}

	this.setUncertain = function(t) { element.uncertain.innerHTML = t }
	this.setUnread = function(t) { element.unread.innerHTML = t }
	this.setRead = function(t) { element.read.innerHTML = t }

	this.setAlert = function(t) { element.alert.innerHTML = t }

	this.UPGRADE_ALERT = "Requires Google Chrome version 24 or above";
	this.ERROR_ALERT = "Speech recognition error: ";
}

var TalkInterface = function() {

	var voices = window.speechSynthesis.getVoices();

	var VOICE_RATE = 1,
		VOICE_PITCH = 1,
		LANG = "en-US";
		URI = 'native';

	this.say = function(u, ended) {

		if (u.replace(/\s/, '').length > 0) {
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
}

window.onload = function() {

	var text = new TextInterface(),
		voice = new TalkInterface(),
		script = new Transcript(text, voice);

	if (!('webkitSpeechRecognition' in window)) { text.setAlert(text.UPGRADE_ALERT); }
	else {

		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = function() {}

		recognition.onend = function() {
			console.log("restart");
			recognition.start();
		}

		recognition.onresult = function(event) {
			script.handleResult(event);
		}

		recognition.onerror = function(event) {
			text.setAlert(text.ERROR_ALERT + event.error);
		}

		recognition.start();
	}
}