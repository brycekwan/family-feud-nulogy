var five = require("johnny-five");
var _ = require("lodash");
var board = new five.Board();


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
      hold: function () { console.log("Button 1 is pressed"); },
      up: buttonReleaser.release
    }
  }, {
    pin: 9,
    holdTime: 200,
    isPullup: true,
    name: "button 2",
    events: {
      hold: function () { console.log("Button 2 is pressed"); },
      up: buttonReleaser.release
    }
  }
];


var newButton = function (config) {
  var button = new five.Button(_.omit(config, ["events", "name"]));

  button.name = config.name;
  _.forOwn(config.events, function (callback, eventName) {
    button.on(eventName, callback);
  });
  buttonReleaser.addButton(button);

  return button;
};


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