

const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const session = require('express-session');
const validator = require('validator');
const API = require('./lib/API');
const { sessionName, sessionKeys } = require('./config');

var mySession = {session:{}}
app.disable('x-powered-by');

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieSession({
    name: sessionName,
    keys: sessionKeys
}));



app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

app.get('/', async (req, res) => {
    console.log("STARTING")
    console.log("Session: ",mySession.session.authorized)
    const isAuthorized = (mySession.session.authorized);
    if(!isAuthorized) {
        console.log("NOT AUTHORIZED")
        res.render('index', { isAuthorized, id: '' });
    } else { 
        console.log("AUTHORIZED");
        try {
            const id = await API.getLinkedinId(req,mySession.session.token);
            console.log("TOKEN", mySession.session.token);
            res.render('index', { isAuthorized, id });
            const token = mySession.session.token;
            const askUpload = await API.askUploadImage(req, id,token);
        } catch(err) {
            res.send(err);
        }
    }    
});

app.get('/auth', (req, res) => {
    console.log("Authorizing")
    res.redirect(API.getAuthorizationUrl());
});

app.get('/callback', async (req, res) => {
    console.log("RECEIVE CALLBACK")
    console.log("Code: ",req.query.code)
    if(!req.query.code) {
        res.redirect('/');
        return;
    }
    try {
        console.log("GOT CODE")
        const data = await API.getAccessToken(req);
        console.log("TOKEN: ", data.access_token)
        if(data.access_token) {
            req.session.token = data.access_token;
            req.session.authorized = true;
            mySession.session.token = data.access_token;
            mySession.session.authorized = true;
            res.redirect("/");
            // req.session.save(function(err) {
            //     if(!err) {
            //         //Data get lost here
            //         res.redirect("/");
            //     }
            //  });
        }
        
        
    } catch(err) {
        res.json(err);
    }
});

app.post('/publish', async (req, res) => {
    const { title, text, url, thumb, id } = req.body;
    const errors = [];

    // if(validator.isEmpty(title)) {
    //     errors.push({ param: 'title', msg: 'Invalid value.'});
    // }
    // if(validator.isEmpty(text)) {
    //     errors.push({ param: 'text', msg: 'Invalid value.'});
    // }
    // if(!validator.isURL(url)) {
    //     errors.push({ param: 'url', msg: 'Invalid value.'});
    // }
    // if(!validator.isURL(thumb)) {
    //     errors.push({ param: 'thumb', msg: 'Invalid value.'});
    // }

    if(errors.length > 0) {
        res.json({ errors });
    } else {
        const content = {
            title: title || "",
            text: text || "",
            shareUrl: url || "",
            shareThumbnailUrl: thumb || ""
        };

        try {
            console.log("TOKEN:", mySession.session.token)
            const token = mySession.session.token;
            //const askUpload = await API.askUploadImage(req, id, content,token);
            //const upload = await API.uploadImage(req, id, content,token);
            const response = await API.publishContent(req, id, content,token);
            res.json({ success: 'Post published successfully.' });
        } catch(err) {
            console.log(err);
            res.json({ error: 'Unable to publish your post.' });
        }
    }
});

app.listen(port);