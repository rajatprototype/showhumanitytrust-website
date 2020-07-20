const functions = require('firebase-functions');
const express = require("express");
const path = require("path");
var admin = require("firebase-admin");

const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://showhumanitytrust.firebaseio.com"
});

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({ projectId: "showhumanitytrust", keyFilename: "./serviceAccount.json" })

const app = express();

async function generateSignedUrl(bucketName, filename) {
    const options = {
        action: 'read',
        expires: '03-09-2491'
    };
    
    const url = storage
        .bucket(`gs://showhumanitytrust.appspot.com/${bucketName}`)
        .file(filename)
        .getSignedUrl(options);

    return await url;
}

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.get('/donate', (req, res) => {
    return res.render('donate', {});
})
app.get('/events', (req, res) => {

    const events = [];

    admin.database().ref('/events').once('value', (snapshot) => {
        snapshot.forEach((doc) => {
            events.push(doc.val());
        })

        return res.render('events', { data: events });
    }, 
    () => {
        return res.render('events', { data: [] });
    })
})


app.get('/gallary', (req, res) => {

    const photos = [];

    admin.database().ref('/gallary').once('value', (snapshot) => {
        snapshot.forEach((doc) => {
            photos.push(doc.val());
        })

        return res.render('gallary', { data: photos });
    },
    () => {
        return res.render('gallary', { data: [] });
    });
})
app.get('/members', (req, res) => {
    return res.render('members', {});
})
app.get('/membership', (req, res) => {
    return res.render('membership', {});
})

app.get('/admin', (req, res) => {
    return res.render('admin', {})
})

app.get('/', (req, res) => {
    return res.render('index', {});
})

app.get('/test', (req, res) => {
    return res.render('test', {});
})

app.get('/admin/print-contact/:contactId', async (req, res) => {
    const { contactId } = req.params;

    admin.database().ref(`contact/${contactId}`).once('value', (snapshot) => {
        const data = snapshot.val();
        return res.status(200).render('admin/print-contact', { data });
    })
})

app.get('/admin/print-membership/:membershipId', async (req, res) => {
    const { membershipId } = req.params;

    admin.database().ref(`membership/${membershipId}`).once('value', (snapshot) => {
        const data = snapshot.val();
        return res.status(200).render('admin/print-membership', { data });
    })
})

exports.app = functions.https.onRequest(app);
