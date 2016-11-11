# Hackers at Cambridge Chatbot Base

Use this to get started making the next big chatbot!

## Quick Links

- [Setup video for this repo](https://youtu.be/kkpBYpg6YHk)
- [Facebook For Developers](https://developers.facebook.com)
- [Messenger API](https://developers.facebook.com/docs/messenger-platform)
- [Messenger Getting Started Doc](https://developers.facebook.com/docs/messenger-platform/guides/quick-start)
- [Detailed Sample Node.js Messenger Bot](https://github.com/fbsamples/messenger-platform-samples)
- [wit.ai](http://wit.ai/)
- [wit.ai docs](https://wit.ai/docs)

## Steps We Take

This is a very brief overview of how we'll be using this starter in the workshop. It is not
intended to be comprehensive, but something you can come back to if you can't remember a
few details.

### Set up the project

Watch the instruction video to figure out how to do this

### A note on restarting

Restarting node every time you make changes is really boring and error prone.

Make your life easier with `nodemon`!

```
npm install -g nodemon
```

```
nodemon index
```

Now, your server will restart automatically when you change your code.

### Add a home route

Add

```
app.get('/', (req, res) => {
  res.end('This is where my chatbot lives');
});
```

To your index file. Put it after the comment about making a chatbot.

### Set up localtunnel

Install localtunnel

```
npm install -g localtunnel
```

With a domain chosen, start up localtunnel

```
lt --port 3000 --subdomain YOURSUBDOMAIN
```

It will give you a domain, check that it works by visiting it.

Note: This is not suitable as a long-term solution. 

### Validate your domain

Check out the [Facebook docs on how to do this](https://developers.facebook.com/docs/messenger-platform/guides/setup#webhook_setup).

We've also set up a util function for you to use to create your validation route:

```
app.get('/webhook', utils.createValidationHandler('Richard'));
```

### Receive messages to your page

Add a route to get messages

```
app.post('/webhook', (req, res) => {
  utils.processSubscriptionMessages(req.body, (messageEvent) => {
    console.log(messageEvent);
  });
});
```

Go to your bot's facebook page and click "Message" to start a conversation. After sending it messages,
make sure they're appearing in your app's log.

### Send messages back

Based on the message's content, you can send messages to the recipient like so:

```
utils.sendMessage(messageEvent.sender.id, {
  text: 'Hello!',
});
```

### Hook it up to Wit

[**Flick through the Wit docs. They'll do a much better job of explaining the ins and outs**](https://wit.ai/docs)

Manually creating responses is tedious. We will use [wit.ai](wit.ai) to make our lives easier.

You want to sign up to Wit, and in your new app, create a story. Once this is done, you'll need to hook
it up to your app. 

Get the server access token from the settings page and put it in `wit-token.txt`. 

Then at the top level of your index file, create your wit client, and a global context:

```
let globalContext = { };

const witClient = utils.createWitClient({
  send(request, response) {
    utils.sendMessage(request.senderId, response.text);

    // All actions must return a promise
    return Promise.resolve();
  }
});
```

Then, replace your message processing function with this:

```
witClient.runActions(event.sender.id, event.message.text, globalContext)
  .then(context => {
    globalContext = context;
  })
  .catch(err => {
    console.log('Error performing actions', err);
  });
```

This will allow Wit to use your app to talk to people on Messenger.

### Add more complex stories

Now you can make stories in Wit that require a context, and can call actions on your
app. 
