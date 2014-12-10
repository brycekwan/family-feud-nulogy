var five = require("johnny-five");
var _ = require("lodash");
var board = new five.Board();
var Firebase = require("firebase");
var fs = require("fs");
var Speaker = require("speaker");

var bothReleased = function () { console.log("Both buttons released"); }

var buttonReleaser = (function (callback) {
  var buttons = [];

  function isReleased (button) {
    return !button.isDown;
  }

  return {
    release: function () { if(_.every(buttons, isReleased)) { callback(); } },
    addButton: function (button) { buttons.push(button) }
  };
})(bothReleased);


var buttonsConfig = [
  {
    pin: 8,
    holdTime: 200, // How many ms to wait before the button is considered to be "held down"
    isPullup: true,
    name: "button 1",
    events: {
      hold: function () { console.log("Button 1 is pressed"); sendButton("1") },
      up: buttonReleaser.release
    }
  }, {
    pin: 9,
    holdTime: 200,
    isPullup: true,
    name: "button 2",
    events: {
      hold: function () { console.log("Button 2 is pressed"); sendButton("2") },
      up: buttonReleaser.release
    }
  } , {
    pin: 10,
    holdTime: 200,
    isPullup: true,
    name: "button 3",
    events: {
      hold: function () { console.log("Button 3 is pressed"); sendButton("3") },
      up: buttonReleaser.release
    }
  }
];


var newButton = function (config) {
  console.log(config);
  var button = new five.Button(_.omit(config, ["events", "name"]));

  button.name = config.name;
  _.forOwn(config.events, function (callback, eventName) {
    button.on(eventName, callback);
  });
  buttonReleaser.addButton(button);

  return button;
};

var sendButton = _.throttle(function(buttonId) {
  var stream = fs.createReadStream("ff-ringin.wav");
  var speaker = new Speaker({
    channels: 2,
    bitDepth: 8,
    sampleRate: 11000
  });
  stream.pipe(speaker);
  var myFirebaseRef = new Firebase("https://family-feud.firebaseio.com/buttonIO");
  var currentTime = new Date();
  myFirebaseRef.set({ buttonId: buttonId, dateTime: currentTime.toLocaleString()})
}, 2000, {trailing: false});


board.on("ready", function() {

  var buttons = _.map(buttonsConfig, newButton);

  // Inject the `button` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    buttons: buttons,
    buttonsConfig: buttonsConfig
  });
});
