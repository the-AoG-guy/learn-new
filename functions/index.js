'use strict';

const {
  dialogflow,
  Suggestions,
  Image,
  BasicCard,
  Button,
  SimpleResponse,
} = require('actions-on-google');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = dialogflow({ debug: true });

admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });

const auth = admin.auth();
const db = admin.firestore();

const dataRef = db.collection('data');

app.intent('Default Welcome Intent', (conv) => {
  if(conv.data.count == 1) {
    conv.ask(new SimpleResponse({
      speech: `What is the domain or subject that you want to learn about? You can say it out loud or chose from the suggestions given below.`,
      text: `What is the domain or subject that you want to learn📚 about? You can say it out loud or chose from the suggestions given below.`,
    }));
    conv.ask(new Suggestions(['Computer Science', 'Physics', 'Biology', 'Chemistry', 'Mathematics']));
  }
  else {
  conv.ask(new SimpleResponse({
    speech: `Hey there. Learn New here. Hope you're ready to absorb some knowledge now! I'm your customized education assistant  and I'm here to suggest you educational content whenever you get a knack for some learning. Let's do this. But first,`,
    text: `Hey there👋. Learn New here. Hope you're ready to absorb some knowledge now! I'm your customized education assistant🤖  and I'm here to suggest you educational content🧠 whenever you get a knack for some learning. Let's do this. But first,`,
  }));
  conv.ask(new SimpleResponse({
    speech: `What is the domain or subject that you want to learn about? You can say it out loud or chose from the suggestions given below.`,
    text: `What is the domain or subject that you want to learn📚 about? You can say it out loud or chose from the suggestions given below.`,
  }));
  conv.ask(new Suggestions(['Computer Science', 'Physics', 'Biology', 'Chemistry', 'Mathematics']));
}
});

app.intent('brain', (conv, { domain }) => {
  conv.data.domain = domain;
  conv.ask(new SimpleResponse({
    speech: `Cool. Now tell me what part of your brain would you like to chose? The part divisions are simplified to help you focus at the right part of your cerebrum.`,
    text: `Cool. Now tell me what part of your brain would you like to chose🤔? The part divisions are simplified to help you focus at the right part of your cerebrum🧠.`,
  }));
  conv.ask(new Suggestions(['Analytical', 'Experimental', 'Analogical']));

});

app.intent('level', (conv, { brain }) => {
  conv.data.brain = brain;
  conv.ask(new SimpleResponse({
    speech: `Right on. Now coming to the final question. What would you like as the level of difficulty for the knowledge clip you want right now?`,
    text: `Right on. Now coming to the final question🧐. What would you like as the level of difficulty🤯 for the knowledge clip you want right now?`,
  }));
  conv.ask(new Suggestions(['Amateur', 'Semi-Pro', 'World Class']));

});

app.intent('output', (conv, { level }) => {
  conv.data.count == 1;
  conv.data.level = level;
  var domain = conv.data.domain;
  var brain = conv.data.brain;
  var term = domain.concat("-", brain);
  term = term.concat("-", level);

  var queryRef = dataRef.doc(`${term}`);
  return queryRef.get()
    .then(doc => {
      const { title, text, url, image } = doc.data();
      conv.ask(`According to my sixth sense, I suggest you ${title}.`);
      conv.ask(`${text}`);
      conv.ask(new BasicCard({
        buttons: new Button({
          title: `Learn more with an interactive video`,
          url: `${url}`,
        }),
        image: new Image({
          url: `${image}`,
          alt: `${title}`,
        }),
        display: 'WHITE',
      }));
      conv.ask(new Suggestions(['One More ?', 'Close the Action']));
      return Promise.resolve('Read complete');
    })
    .catch(err => {
      var newqueryRef = dataRef.doc(`${domain}`);
      return newqueryRef.get()
        .then(doc => {
          const { title, text, url, image } = doc.data();
          conv.ask(`According to my sixth sense, I suggest you ${title}.`);
          conv.ask(`${text}`);
          conv.ask(new BasicCard({
            buttons: new Button({
              title: `Learn more with an interactive video`,
              url: `${url}`,
            }),
            image: new Image({
              url: `${image}`,
              alt: `${title}`,
            }),
            display: 'WHITE',
          }));
          conv.ask(new Suggestions(['One More ?', 'Close the Action']));
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    });
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
