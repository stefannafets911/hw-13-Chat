const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirm_password = document.getElementById("confirm_password");
const email_log = document.getElementById("email_log");
const password_log = document.getElementById("password_log");
const submitBtnSignIn = document.getElementById("submitBtnSignIn");
const submitBtnSignUp = document.getElementById("submitBtn");

if (submitBtnSignIn) {
    submitBtnSignIn.addEventListener('click', signIn, false);
}

if (submitBtnSignUp) {
    submitBtnSignUp.addEventListener('click', signUp, false);
}

function setToStorage(key) {
    sessionStorage.setItem('user', key);
}

function signIn() {
    if (!name.value || !email.value || !password.value || password.value !== confirm_password.value) {
        alert("Try again");
    } else if (name.value && email.value && password.value && password.value === confirm_password.value) {
        let newUser = {};
        newUser.name = name.value;
        newUser.email = email.value;
        newUser.password = password.value;

        let body = 'user=' + encodeURIComponent(JSON.stringify(newUser));
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.open("POST", '/signInUser', true);
        xhr.onload = function () {
            let status = xhr.status;
            let jsonResponse = xhr.response;

            if (status === 409) {
                alert(jsonResponse);
            } else if (status === 200) {
                alert(jsonResponse);
                location.href = 'index.html'
            }
        };
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
    }
}

function signUp() {
    if (!email_log.value || !password_log.value) {
        alert("Try again");
    } else if (email_log.value || password_log.value) {
        let loginUser = {};
        loginUser.email = email_log.value;
        loginUser.password = password_log.value;
        console.log(loginUser);
        let body = 'user=' + encodeURIComponent(JSON.stringify(loginUser));
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.open("POST", '/auth', true);
        xhr.onload = function () {
            let status = xhr.status;
            let jsonResponse = xhr.response;
            load();

            if (status === 403) {
                sleep(2000, function () {
                    errorLogIn();
                    sleep(300, function () {
                        location.href = 'Index.html';
                    });
                });
            } else if (status === 200) {
                setToStorage(jsonResponse);
                sleep(2000, function () {
                    successLoad();
                    sleep(300, function () {
                        location.href = 'users.html';
                    });
                });
            }
        };
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
    }
}
