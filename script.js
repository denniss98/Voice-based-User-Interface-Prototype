//WORKKKKKK
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

// Output:
var synth = window.speechSynthesis;

var grammar = "#JSGF V1.0; grammar student assistant; public <student assistant> =  ...;";
// Set a reminder
// Set a reminder of <bobs lecture>
// Set a reminder of <bobs lecture> for <friday 10 40 am>
// Remind me
// Remind me of <bobs lecture>
// Remind me of <bobs lecture> for <friday 10 40 am>

// Same as Version 4 - but allows a greater variety of utterances:

//Regular expressions for the different utternaces
var u1=/.*set a (?:reminder)$/i;
var u2=/.*set a (?:reminder) of (.*)$/i;
var u3=/.*set a (?:reminder) of (.*) for (.*)$/i;

var u4=/(?:of)?\s*(.*)/i;
var u5=/(?:for)?\s*(.*)/i;
var u6=/.*remind me$/i; 
var u7=/.*remind me of (.*)$/i; 
var u8=/.*remind me of (.*) for (.*)$/i; 
var u9=/.*list|show deadline$/i; 
var u10=/.*list|show deadline$/i; 

var recognition = new SpeechRecognition();
var speechGramList = new SpeechGrammarList();
//speechGramList.addFromString(grammar, 1);
//recognition.grammars = speechGramList;

// Parameters of the decognition:
recognition.continuous = false;
recognition.lang = 'en-GB';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.output');
var resp = document.querySelector('.response');

document.body.onclick = function() {
  iconchange();
  resp.textContent="...";
  console.log('Ready to receive voice command.');
  enterState(0);
}

var state = 0;
var startPlace=null;
var endPlace=null;

function iconchange() {
  document.getElementById("microphone-icon").src = "img/speak.svg";
}

function showcalendar() {
  var calendar = document.getElementById("tooltip");
  //buggy var calendartwo = document.getElementsByClassName("tooltiptext");
  calendar.style.display = "inline-block";
  calendar.style.color = "blue";
  //buggy calendartwo.style.display = "block";
}

function enterState(s){
  console.log("Entering state:", s);
  // set new state0
  state=s;
  // say something for this state
  // Note need to pass in the function that does the next thing as a parameter,
  // so that in can be done after the speech.
  sayState(state, function(){if(isFinal(state)){
    showcalendar();
    var msg="You've made a reminder" +startPlace+ " shceduled for " +endPlace;
    utterThis = new SpeechSynthesisUtterance(msg);
    synth.speak(utterThis);
  } else { recognition.start(); }});
}

function isFinal(s){ return s==5;}
// Things it can say in the different states.
var sayings = {
  0: "Student assistant, how can I help you?",
  1: "What you want to be reminded of?",
  3: "When do you want to be reminded?",
  5: "Reminder has been set!"
  // 6: "What deadline do you want to set?"
  // 7: "When do you want to set this deadline?"
  // 8: "Deadline has been set!"
}

function sayState(s, afterSpeechCallback){
  var textOut=sayings[s];
  resp.textContent=textOut;

  var utterThis = new SpeechSynthesisUtterance(textOut);
  utterThis.onend = function (event) {
    console.log('SpeechSynthesisUtterance.onend');
  }
  utterThis.onerror = function (event) {
    console.error('SpeechSynthesisUtterance.onerror');
  } 
  utterThis.onend = afterSpeechCallback;

  synth.speak(utterThis);
}

recognition.onresult = function(event) {
  console.log('onresult');

  var text = event.results[0][0].transcript;
  diagnostic.textContent = 'I heard: ' + text + '.';

  // figure out what they've said;
  // record slot fillers
  // what they've said + state -> new state
  // enterState(newState);

  console.log("State:", state);
  // What speech we are expecting depends on the state we're in:
  switch(state ){
    case 0:
    if(text.match(u1) || text.match(u6)){ enterState(1);}  
    else if (m=text.match(u3) || (m=text.match(u8))) { startPlace = m[1]; endPlace=m[2]; enterState(5);} // "...from .... to ..."
    else if (m=text.match(u2) || (m=text.match(u7))) { startPlace = m[1]; enterState(3);} // "...from ...."
    else {
      // re-enter the current state.
      // would be better to give an error message here as well:
      var errormsg="I did not get that. Please try again.";
      utterThis = new SpeechSynthesisUtterance(errormsg);
      synth.speak(utterThis);
      diagnostic.textContent = 'I did not get that. Please try again.';
      //enterState(state);
    }
    break;

    case 1:
    if(m = text.match(u4)){ // "...from ...."
      console.log("Matched - pickup"); startPlace = m[1]; enterState(3);
    } else {
      // re-enter the current state.
      // would be better to give an error message here as well:
      
      diagnostic.textContent = 'I did not get that. Please try again.';
      enterState(state);
    }
    break;

    case 3:
    if(m=text.match(u5)){
      console.log("Matched - destination");
      endPlace = m[1]; enterState(5);
    } else {
      // re-enter the current state.
      // would be better to give an error message here as well:
      ddiagnostic.textContent = 'I did not get that. Please try again.';
      enterState(state);
    }
    break;

    case 5:
    break;
  }

  console.log(event.results);
  console.log('Confidence: ' + event.results[0][0].confidence);

}

// recognition.onaudiostart = function() { console.log("onaudiostart"); }
// recognition.onaudioend = function() { console.log("onaudioend"); }
//
// recognition.onsoundstart = function() { console.log("onsoundstart"); }
// recognition.onsoundend = function() { console.log("onsoundend"); }
//
// recognition.onspeechstart = function() { console.log("onspeechstart"); }
recognition.onspeechend = function() { //console.log("onspeechend");
  recognition.stop();
}

// recognition.onstart = function() { console.log("onstart"); }
// recognition.onend = function() { console.log("onsend"); }

recognition.onnomatch = function(event) {
  //console.log('onnomatch', event);
  diagnostic.textContent = "I didn't recognise that.";
}

recognition.onerror = function(event) {
  //console.log('onerror', event);
  diagnostic.textContent = 'I did not recognise that: ' + event.error;
}
