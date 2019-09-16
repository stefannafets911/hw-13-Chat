class Store {
    constructor() {
        this._user = {};
        this._allUsers = [];
        this._activeUsers = [];
        this._isActive = '';
        this._isActive = '';
    }

    addUser(user) {
        this._allUsers.push(user);
    }

    getUsers() {
        return this._allUsers;
    }

    addActiveUser(user) {
        this._activeUsers.push(user);
    }

    getActiveUsers() {
        return this._activeUsers
    }
}
let ws;

class View {
    constructor() {
        this.usersBtn = document.getElementById('usersBtn');
        this.chatBtn = document.getElementById('chatBtn');
        this.chat = document.getElementById('chat');
        this.usersAll = document.getElementById('usersTable');
        this.usersChat = document.getElementById('usersChat');
        this.name = document.getElementById("name");
        this.email = document.getElementById("email");
        this.password = document.getElementById("password");
        this.confirm_password = document.getElementById("confirm_password");
        this.email_log = document.getElementById("email_log");
        this.password_log = document.getElementById("password_log");
        this.submitBtn = document.getElementById('submitBtn');
        this.changeTable = document.getElementById('changeTable');
        this.chatContent = document.getElementById('id="chatContent');
        this.message = document.getElementById('message');
        this.sendBtn = document.getElementById('sendBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.usersTable = document.getElementById('usersTable');
        this.chatTable = document.getElementById('chatTable');
    }

    renderUsers = (users) => {
        // console.log(users);
        const tableHeader = `<div class="users__table">
                    <table class="users__table table" id="table">
                        <tr class="table__header">
                            <th>Name</th>
                            <th>Email</th>
                        </tr>`;
        const usersList = users.map(user => {
            return `<tr class="table__body">
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                        </tr>`
        });

        const tableFooter = `</table>
                </div>`;

        return this.usersTable.innerHTML = tableHeader + usersList.join('') + tableFooter;
    };

    renderChat = () => {
        return this.chatTable.innerHTML = `<div class="users__chat chat" id="chat">
                <div class="chat__title">Chat</div>
                <div class="chat__body" >
                    <div class="chat__content" id="chatContent">
                    </div>
                    <div class="chat__footer">
                        <input class="chat__input" id="message" type="text">
                        <button class="chat__button" id="sendBtn">Send</button>
                    </div>
                </div>
            </div>`
    };

    renderChatUsers = (users) => {
        const usersHeader = `Users online:`;

        const usersList = users.map(user => {
            return `<div class="users-chat__users">
                    <li class="users-chat">${user.name}</li>                    
                </div>`
        });

        return this.usersChat.innerHTML = usersHeader + usersList.join('');
    };

    renderWithoutChatUsers = () => {
        return this.usersChat.innerHTML = ``;
    };

    dialogWindowScrollDown = () => {
        const elem = document.getElementById('chatContent');
        elem.scrollTop = elem.scrollHeight;
    };

    insertMessage = () => {
        let div = document.createElement('div');
        div.className = 'outgoing';
        div.innerHTML = `Me : ${document.getElementById('message').value}`;
        // const timeBlock = document.createElement("p");
        // const time = document.createTextNode(`${new Date()}`);
        // timeBlock.appendChild(time);
        // div.appendChild(timeBlock);
        document.getElementById('chatContent').appendChild(div);
        this.dialogWindowScrollDown();
    };

    insertSocketMessage = message => {
        let div = document.createElement('div');
        if (message.sender === 'SYSTEM_MESSAGE') {
            div.className = 'system-message';
            div.innerHTML = `${message.text}`;
            document.getElementById('chatContent').appendChild(div);
        } else if (store.user.name === message.sender) {
            div.className = 'outgoing';
            div.innerHTML = `Me : ${message.text}`;
            document.getElementById('chatContent').appendChild(div);
        } else if (!message.sender) {
            div.className = 'system-message';
            div.innerHTML = `${message.text}`;
            document.getElementById('chatContent').appendChild(div);
        } else {
            div.className = 'incoming';
            div.innerHTML = `${message.sender}: ${message.text}`;
            document.getElementById('chatContent').appendChild(div);
        }
        this.dialogWindowScrollDown();
    }
}

class App {
    constructor() {
        this.view = new View();
    }

    init() {
        const _user = sessionStorage.getItem('user');
        if (_user) {
            store.user = JSON.parse(_user);
            this.view.name.innerHTML += store.user.name;
            this.view.email.innerHTML += store.user.email;
        } else {
            location.href = 'index.html'
        }
        const _message = sessionStorage.getItem('message');

        if (_message !== 'null') {
            store.messages = JSON.parse(_message);
        }
        this.initUsers();
        this.view.renderChat();
        // this.initActiveUsers();
        this.initWs();

        const method = event => {
            switch (event.target.id) {
                case 'usersBtn':
                    this.initUsers();
                    document.getElementById('chatTable').style.display = 'none';
                    document.getElementById('usersTable').style.display = 'block';
                    break;
                case 'chatBtn':
                    document.getElementById('usersTable').style.display = 'none';
                    document.getElementById('chatTable').style.display = 'block';
                    this.view.dialogWindowScrollDown();
                    break;
                case 'sendBtn':

                    if (document.getElementById('message').value == '') {
                        break;
                    }
                    this.view.insertMessage();
                    let message = {
                        type: "USER_MESSAGE",
                        text: document.getElementById('message').value,
                        user: store.user.name,
                        sender: store.user.name,
                        time: new Date(),
                        receiver: 'all',
                    };
                    sendMessage(message);
                    document.getElementById('message').value = '';
                    break;
                case 'logoutBtn':
                    sendLogoutRequest();
                    break;
                default:
                    return;
            }
        };

        document.addEventListener('click', method);

        window.onbeforeunload = function () {
            this.view.renderChatUsers();
        };
    }

    initUsers() {
        sendRequest('users')
            .then(res => res.json())
            .then(response => {
                store.allUsers = response;
                this.view.renderUsers(store.allUsers);
                this.view.renderWithoutChatUsers();
            })
            .catch(error => {
                // console.log(error);
            });
    }

    initActiveUsers() {
        sendRequest('getActiveUsers')
            .then(res => res.json())
            .then(response => {
                store.activeUsers = response;
                this.view.renderChatUsers(store.activeUsers);
            })
            .catch(error => {
                // console.log(error);
            });
    }

    initWs() {
        ws = new WebSocket('ws://localhost:4000');

        ws.onopen = () => {
            // console.log('onopen');
            sendMessage({
                type: 'USER_MESSAGE',
                text: store.user.name + ' join',
                time: new Date(),
                user: 'SYSTEM_MESSAGE'
            });
        };

        ws.onmessage = message => {
            // console.log(message, 44);
            handleMessage(message);
        };

        ws.onclose = () => {
            console.log('onclose', 2);
            sendMessage({
                type: 'CLOSE',
                text: store.user.name + ' left',
                time: new Date(),
                user: 'SYSTEM_MESSAGE'
            });
        };
    }
}

function sendRequest(param) {
    const url = `/${param}`;

    return fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

const sendMessage = (data) => {
    ws.send(JSON.stringify(data));
};

const handleMessage = message => {
    let _message = JSON.parse(message.data);
    app.view.insertSocketMessage(_message);
};

const sendLogoutRequest = () => {
    sessionStorage.removeItem('user');
    location.href = 'index.html';
};

const store = new Store();
const app = new App();
app.init();

