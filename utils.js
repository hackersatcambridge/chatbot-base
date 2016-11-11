const fs = require('fs');
const fetch = require('node-fetch');
const wit = require('node-wit');

const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').replace(/\n/g, '');
const WIT_ACCESS_TOKEN = fs.readFileSync('wit-token.txt', 'utf8').replace(/\n/g, '');

if (!PAGE_ACCESS_TOKEN) {
  throw 'You must fill out token.txt';
}

// Display unhandled rejections of promises if they occur
process.on('unhandledRejection', (reason, promise) => {
  console.log("Possibly Unhandled Rejection at: Promise ", promise, " reason: ", reason);
});

/**
 * Creates a validation handler so Facebook can verify your domain.
 *
 * Use it in a GET route:
 *
 * ```
 * app.get('/webhook', createValidationHandler('Richard'));
 * ```
 *
 * @param {string} token - The token entered into your Facebook app dashboard for
 *   domain verification.
 * @return {function} Function to pass into a route handler
 */
exports.createValidationHandler = function createValidationHandler(token) {
  return (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === token) {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      res.sendStatus(403);
    }
  }
};

/**
 * Takes a subscription event from Facebook and calls a function on every
 * message event found inside it.
 *
 * @param {object} data - The data from the Facebook API
 * @param {function} messageCallback - A function that takes the message event as its only argument
 */
exports.processSubscriptionMessages = function processSubscriptionMessages(data, messageCallback) {
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      const pageID = entry.id;
      const timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          messageCallback(event);
        } if (event.postback) {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
  }
};

/**
 * Calls the Facebook messenger API with arbitrary data.
 *
 * To see what kind of values you can send, check out the send API docs
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference
 *
 * @param {object} data - The data to send to the Messenger API
 * @returns {Promise} Promise that resolves when the send is complete
 */
exports.callSendApi = function callSendApi(data) {
  return fetch(`https://graph.facebook.com/v2.8/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(res => res.json())
    .then(message => {
      if (message.error) {
        throw message.error;
      }

      return message;
    })
    .then(message => {
      console.log(`Sent message ${message.message_id} to ${message.recipient_id}.`);
      return message;
    })
    .catch(error => {
      console.log('Unable to send message');
      console.log(error);
    });
}

/**
 * Helper method for sending messages to a particular recpient
 *
 * @param {string} recipientId - The ID of the person to send a message to
 * @param {object} messageData - The data to go into the message field of the request.
 *   See https://developers.facebook.com/docs/messenger-platform/send-api-reference for details
 *
 * @returns {Promise} Same as callSendApi
 */
exports.sendMessage = function sendMessage(recipientId, messageData) {
  return exports.callSendApi({
    recipient: {
      id: recipientId,
    },
    message: messageData
  });
};

/**
 * Creates a wit client that you can use to plug into your app
 *
 * Remember to fill out wit-token.txt before using this
 *
 * @param {object} actions - An object that contains the actions your chatbot
 *   can perform. The `send` action is required.
 * @returns {object} The wit client
 */
exports.createWitClient = function createWitClient(actions) {
  if (!WIT_ACCESS_TOKEN) {
    throw 'You must fill out wit-token.txt';
  }

  return new wit.Wit({
    accessToken: WIT_ACCESS_TOKEN,
    actions,
    logger: new wit.log.Logger(wit.log.DEBUG),
  });
}
