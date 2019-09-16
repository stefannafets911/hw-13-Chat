const express = require('express');
const WebSocket = require('ws');
const app = express();
const bodyParser = require('body-parser');
const constants = require('./constants');
const mongoose = require('mongoose');
const ChatDAL = require('./dal/chatDAL');
const Schema = mongoose.Schema;
const PORT = process.env.PORT || 80;

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static('public'));
app.use(express.json());
app.listen(PORT, () => {
    console.log('Listening on port %d', PORT);
});

const chatDal = new ChatDAL();
chatDal.initialize();

app.post('/auth', async (request, res) => {
    try {
        const {email, password} = JSON.parse(request.body.user);
        const user = await chatDal.readUser(email, password);
        res.status(200).send(user);
    } catch (e) {
        res.status(403).send(e.message);
    }
});

app.post('/signInUser', async (request, res) => {
    try {
        await chatDal.createUser(JSON.parse(request.body.user));
        res.status(200).send('User created');
    } catch (e) {
        res.status(409).send(e.message);
    }
});

app.post('/users', async (request, res) => {
    const users = await chatDal.readAllUsers();
    res.status(200).send(users);
});

// init WS
const server = new WebSocket.Server({port: 4000}, () => {
    console.log('WS server started on port 4000');
});

const handleMessage = (message, ws) => {
    const data = JSON.parse(message);

    const time = new Date();

    switch (data.type) {
        case "USER_MESSAGE":

            if (data.user !== 'SYSTEM_MESSAGE') {
                server.broadcast(JSON.stringify({...data, time: time}), ws);
                //загрузка сообщений в бд, не загружаю системные сообщения
                chatDal.createMessage({...data});
            }
            break;
        case "CLOSE":
            server.broadcast(JSON.stringify({...data, time: time}), ws);
            break;
        default:
            return;
    }
};

// Broadcast to all
server.broadcast = (data, ws) => {
    server.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(data);
        }
    });
};

// ws server
server.on('connection', ws => {
    ws.send(JSON.stringify({
        type: 'SERVER_MESSAGE',
        text: 'Welcome!',
        time: new Date()
    }));

    //загрузка писем из бд
    chatDal.readPublicMessages(ws);

    ws.on('message', message => {
        handleMessage(message, ws);
    });

    ws.on('close', () => {
        // console.log('onclose');
        const message = JSON.stringify({
            type: 'CLOSE',
            text: `Goodbye!`,
            time: new Date()
        });

        handleMessage(message, ws);
    });
});


//подключить 2 бд, mySQL, REDIS
//view перевести на REACT
//новая клиент-серверная приложуха
//исправить старые баги