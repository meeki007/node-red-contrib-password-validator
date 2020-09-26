//2020 David L Burrows
//Contact me @ https://github.com/meeki007
//or meeki007@gmail.com

//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at
//http://www.apache.org/licenses/LICENSE-2.0

//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

//var users = require('../users');
var passwordValidator = require("password-validator");


module.exports = function(RED)
{

  function passwordvalidatorNode(config)
  {
    RED.nodes.createNode(this,config);
    var node = this;

    // config for this nodes html file
    this.property = config.property||"payload";
    this.digits = config.digits||false;
    this.letters = config.letters||false;
    this.lowercase = config.lowercase||false;
    this.uppercase = config.uppercase||false;
    this.symbols = config.symbols||false;
    this.spaces = config.spaces||false;
    this.min = config.min||false;
    this.max = config.max||false;

    //Clear user notices Function, used for timmer after deploy
    var status_clear = function()
    {
      //clear status icon
      node.status({});
    };


    //Do Stuff when a msg is sent to this node
    this.on('input', function(msg, send, done)
    {
      // For maximum backwards compatibility, check that send exists.
      // If this node is installed in Node-RED 0.x, it will need to
      // fallback to using `node.send`
      send = send || function() { node.send.apply(node,arguments); };

      //clear status icon every new trigger input
      this.status({});

      // clear/end status msg after 3 seconds
      var timmerClear = setTimeout(status_clear, 3000);

      //user error function
      function notify_user_errors(err)
      {
        if (done)
        {
          // Node-RED 1.0 compatible
          done(err);
        }
        else
        {
          // Node-RED 0.x compatible
          node.error(err, msg);
        }
      }

      function check_and_cleanup_user_input(input, type)
      {
        input = input.trim();
        if ( input === "")
        {
          input = false;
        }
        if ( input !== false )
        {
          input = parseInt(input, 10);
          var is_a_integer = Number.isInteger(input);
          if ( is_a_integer === true )
          {
            return input;
          }
          else
          {
            notify_user_errors("node-red-contrib-password-validator - " + type + ": field is not blank or is not a whole number, please fix your input, only enter whole numbers or leave " + type + " field blank");
            return false;
          }
        }
      }

      //set user input to node to var
      var input = msg[node.property.valueOf()];
      //get the msg.name used for for input into node
      var input_name = node.property.valueOf();

///////////////// msg CHECKS /////////////////
      //check that input to this node on user defined message property or default property msg.payload
      //is not falsy
      if( !input )
      {
        notify_user_errors("message property is falsy! no input message or input value found for the message , please send this node somting");
      }

///////////////// password-validator /////////////////
      else
      {
        // Create a schema
        var schema = new passwordValidator();

        //digits
        if ( this.digits !== false )
        {
          var digits = check_and_cleanup_user_input(this.digits, "digits");
          if ( digits !== false )
          {
            if ( digits === 0 )
            {
              schema.has().not().digits();
            }
            else
            {
              schema.has().digits(digits);
            }
          }

        }

        //letters
        if ( this.letters !== false )
        {
          var letters = check_and_cleanup_user_input(this.letters, "letters");
          if ( letters !== false )
          {
            if ( letters === 0 )
            {
              schema.has().not().letters();
            }
            else
            {
              schema.has().letters(letters);
            }
          }

        }

        //lowercase
        if ( this.lowercase !== false )
        {
          var lowercase = check_and_cleanup_user_input(this.lowercase, "lowercase");
          if ( lowercase !== false )
          {
            if ( lowercase === 0 )
            {
              schema.has().not().lowercase();
            }
            else
            {
              schema.has().lowercase(lowercase);
            }
          }

        }

        //uppercase
        if ( this.uppercase !== false )
        {
          var uppercase = check_and_cleanup_user_input(this.uppercase, "uppercase");
          if ( uppercase !== false )
          {
            if ( uppercase === 0 )
            {
              schema.has().not().uppercase();
            }
            else
            {
              schema.has().uppercase(uppercase);
            }
          }

        }

        //symbols
        if ( this.symbols !== false )
        {
          var symbols = check_and_cleanup_user_input(this.symbols, "symbols");
          if ( symbols !== false )
          {
            if ( symbols === 0 )
            {
              schema.has().not().symbols();
            }
            else
            {
              schema.has().symbols(symbols);
            }
          }

        }

        //spaces
        if ( this.spaces !== false )
        {
          var spaces = check_and_cleanup_user_input(this.spaces, "spaces");
          if ( spaces !== false )
          {
            if ( spaces === 0 )
            {
              schema.has().not().spaces();
            }
            else
            {
              schema.has().spaces(spaces);
            }
          }

        }

        //min
        if ( this.min !== false )
        {
          var min = check_and_cleanup_user_input(this.min, "min");
          if ( min !== false )
          {
            if ( min === 0 )
            {
              notify_user_errors("node-red-contrib-password-validator - min: field must be greater than zero, please fix your input or leave min field blank");
            }
            else
            {
              schema.has().min(min);
            }
          }

        }

        //max
        if ( this.max !== false )
        {
          var max = check_and_cleanup_user_input(this.max, "max");
          if ( max !== false )
          {
            if ( max === 0 )
            {
              notify_user_errors("node-red-contrib-password-validator - max: field must be greater than zero, please fix your input or leave max field blank");
            }
            else
            {
              schema.has().max(max);
            }
          }

        }

        // Validate against a password string
        var validatepass = schema.validate(input);
        if ( validatepass === true )
        {
          msg[input_name] =
          {
            input : input,
            valid : true
          };

          this.status(
          {
            fill: 'blue',
            shape: 'dot',
            text: "valid: true"
          });

          send(msg);

        }
        else
        {
          // Get a full list of rules which failed
          var failedrules = schema.validate(input, { list: true });
          msg[input_name] =
          {
            input : input,
            valid : false,
            list :  failedrules
          };

          this.status(
          {
            fill: 'red',
            shape: 'dot',
            text: "valid: false"
          });

          send(msg);

        }

      }

      // Once finished, call 'done'.
      // This call is wrapped in a check that 'done' exists
      // so the node will work in earlier versions of Node-RED (<1.0)
      if (done) {
          done();
      }

    });

  }

  RED.nodes.registerType("password-validator",passwordvalidatorNode);

};
