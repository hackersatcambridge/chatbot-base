const fs = require('fs');
const fetch = require('node-fetch');

const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8');

if (!PAGE_ACCESS_TOKEN) {
  throw 'You must fill out token.txt';
}

exports.callSendApi = function callSendApi(data) {
  return fetch(`https://graph.facebook.com/v2.8/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(res => {
      if ((res.status >= 200) && (res.status < 300)) {
        return res.json();
      } else {
        return res.json().then(response => {
          throw response;
        });
      }
    })
    .then(message => {
      console.log(message);
      console.log(`Sent message ${message.message_id} to ${message.recipient_id}.`);
      return message;
    })
    .catch(error => {
      console.log('Unable to send message');
      console.log(error);
    });
}

exports.sendMessage = function sendMessage(recipientId, messageData) {
  return exports.callSendApi({
    recipient: {
      id: recipientId,
    },
    message: messageData
  });
};

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

exports.makePostbackButton = function makePostbackButton(title, payload) {
  return {
    type: 'postback',
    title,
    payload,
  };
};
