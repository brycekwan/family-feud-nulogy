var five = require("johnny-five");
var _ = require("lodash");
var board = new five.Board();


var buttonsConfig = [
  {
    pin: 8,
    holdTime: 200, // How many ms to wait before the button is considered to be "held down"
    isPullup: true,
    name: "button 1",
    events: {
      hold: function () { console.log("Button 1 is pressed"); },
      // up: function () { console.log("Button 1 is released"); }, // Disabled because it is almost always triggered
    }
  }, {
    pin: 9,
    holdTime: 200,
    isPullup: true,
    name: "button 2",
    events: {
      hold: function () { console.log("Button 2 is pressed"); },
      // up: function () { console.log("Button 2 is released"); },
    }
  }
];


var newButton = function (config) {
  var button = new five.Button(_.omit(config, ["events", "name"]));

  button.name = config.name;
  _.forOwn(config.events, function (callback, eventName) {
    button.on(eventName, callback);
  });

  return button;
};


// Debug function to check the status of the buttons
function checkButtonStatus(button) {
  var str = button.name + " ";

  if(button.isDown) {
    str += "is down";
  } else {
    str += "is up";
  }

  console.log(str);
}


board.on("ready", function() {

  var buttons = _.map(buttonsConfig, newButton);

  // Inject the `button` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    buttons: buttons,
    buttonsConfig: buttonsConfig,
    checkButtonStatus: checkButtonStatus,
    _: _
  });

  _.map(buttons, checkButtonStatus);
});