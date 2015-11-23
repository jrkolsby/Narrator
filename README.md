#Narrator

This is a small application built for the production of Columbia University's "Late Night" play: _How to Business_, directed by Alexandra Warrick and Nathaniel Jameson. It takes spoken input from a browser's input, converts it to text, and outputs it verbally using Google's Web Speech and Speech Synthesis APIs. 

##TODO

* Improve turnaround time from input to output by using recognition.stop() whenever the certainty of a non-final result is above a certain threshhold, then immediately restart. 
* Implement recognition of contenteditable changes made to the certain element
* Fix error in Transcript's addToRead() function where the endings of script.certain strings would be retained when getting added to script.read