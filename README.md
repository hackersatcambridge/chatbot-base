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

```js
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

```js
app.get('/webhook', utils.createValidationHandler('Richard'));
```

### Receive messages to your page

Add a route to get messages

```js
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

```js
utils.sendMessage(messageEvent.sender.id, {
  text: 'Hello!',
});
```

### Hook it up to Wit

[**Flick through the Wit docs. They'll do a much better job of explaining the ins and outs**](https://wit.ai/docs)

Manually creating responses is tedious. We will use [wit.ai](https://wit.ai) to make our lives easier.

You want to sign up to Wit, and in your new app, create a story. Once this is done, you'll need to hook
it up to your app. 

Get the server access token from the settings page and put it in `wit-token.txt`. 

Then at the top level of your index file, create your wit client, and a global context:

```js
let globalContext = { };

const witClient = utils.createWitClient({
  send(request, response) {
    utils.sendMessage(request.sessionId, {
      text: response.text,
    });

    // All actions must return a promise
    return Promise.resolve();
  }
});
```

Then, replace your message processing function with this:

```js
witClient.runActions(messageEvent.sender.id, messageEvent.message.text, globalContext)
  .then(context => {
    globalContext = context;
  })
  .catch(err => {
    console.log('Error performing actions', err);
  });
```

This will allow Wit to use your app to talk to people on Messenger.

#### How do actions work?

The object that you pass to `createWitClient` is populated with the actions that
your chatbot can do. It must at least have a send action that sends messages from the bot
to recipients.

Actions can handle operations that Wit stories cannot represent. For example, setting variables
or making requests to online services. You supply Wit with the conditions that must be met
for actions to be performed. For example, if a user asks for the weather, Wit should tell your
app to perform the `checkWeather` action.

Actions must return promises. All actions apart from `send` can return promises that resolve
to a new context object for your app. This is useful for asynchronous actions, but for your
purposes, you'd just wrap the returned context in a resolved promise:

```js
return Promise.resolve(context);
```

[Here is a quick primer on promises](https://spring.io/understanding/javascript-promises). You can search for more detailed overviews.

### Add more complex stories

Now you can make stories in Wit that require a context, and can call actions on your
app. 

### Publishing

To make a chatbot that can interact with others 24/7, you need to solve a few key issues.

#### Domains and Hosting

LocalTunnel is not a long-term solution. It's great for this quick prototyping, but it will open you up to all
kinds of issues such as people being able to hijack your domain and having to run `lt` all the time.

You should get something more permanent, like [Heroku](https://heroku.com) or [Digital Ocean](https://digitalocean.com/).
These will also give you a domain (albeit not a pretty one) that you can give to Facebook.

#### Getting Verified

Currently, only admins of the page can receive messages from your bot. This isn't useful if you want other
people to talk to it. You can submit applications for review from the apps dashboard.
