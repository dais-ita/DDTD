let COOKIE_USER = 'rf_user';
let COOKIE_UUID = 'uuid';
let IMG_URL_A = '/images/AC.png';
let IMG_URL_B = '/images/IND.png';
let currentQuestion = null;
let loadTs = null;

function init(qnum) {
    if (qnum != 'undefined') {
        currentQuestion = qnum;
    }

//    clearCookie();
    generateUuid();
    checkForUser();
    showHeader();
    setFocus();
    initPopovers();

    loadTs = Date.now();
}

function initPopovers() {
    $(function () {
        $('[data-toggle="popover"]').popover()
    });

    $('.popover-dismiss').popover({
        trigger: 'focus'
    });
}

function helpInit() {
    generateUuid();
    loadTs = Date.now();
}

function nextHelpPage(id) {
    let url = null;
    let tgtNum = null;
    let rawNum = Number(id) + 1;

    if (rawNum < 10) {
        tgtNum = '0' + rawNum;
    } else {
        tgtNum = rawNum;
    }

    url = '/help/help_' + tgtNum + '.html';

    postAction('nextHelp', id);
    window.location.replace(url);
}

function previousHelpPage(id) {
    let url = null;
    let tgtNum = null;
    let rawNum = Number(id) +-1;

    if (rawNum < 10) {
        tgtNum = '0' + rawNum;
    } else {
        tgtNum = rawNum;
    }

    url = '/help/help_' + tgtNum + '.html';

    postAction('previousHelp', id);

    window.location.replace(url);
}

function popOver(attr) {
    postAction('popOver', attr);
}

function skipTutorial(id) {
    postAction('skipTutorial_start');
    if (confirm('Are you sure you want to skip the tutorial and start the demo?')) {
        postAction('skipTutorial_done');
        startDemo();
    }
}

function setFocus() {
    let e = document.getElementById('choice_A');

    if (e) {
        e.focus();
    }
}

function generateUuid() {
    let uuid = getCookie(COOKIE_UUID);

    if (!uuid) {
        setCookie(COOKIE_UUID, uuidv5('http://ita-ce.com:3010/dtd', uuidv5.URL));
    } else if (uuid == '' | uuid == 'null') {
        setCookie(COOKIE_UUID, uuidv5('http://ita-ce.com:3010/dtd', uuidv5.URL));
    }

    console.log(uuid);
}

function showHeader() {
    let e = document.getElementById('user_name');

    e.innerHTML = '<h3>User: ' + getCookie(COOKIE_USER) + '</h3>';
}

function checkForUser() {
    if (!getCookie(COOKIE_USER)) {
        changeUser();
        checkForUser();
    }
}

function changeUser() {
    let ans = null;

    postAction('changeUser_start');

    if (currentQuestion) {
        ans = confirm('Are you sure you want to change user? You will be returned to the first question and ll your progress will be lost...')
    } else {
        ans = true;
    }

    if (ans) {
        let defName = getCookie(COOKIE_USER) || 'Choose a random word for your name like eagle27';
        let user = prompt('Please specify your user name', defName);

        if (user && (user != defName)) {
            postAction('changeUser_done', user);
            setCookie(COOKIE_USER, user);
            window.location.replace('/');
        }
    }
}

function clicked(type) {
    if (type=='AC') {
        clickedA();
    } else {
        clickedB();
    }
}

function clickedA() {
    let eImg = document.getElementById('team_member_1');
    let eRad = document.getElementById('choice_A');

    eImg.src = IMG_URL_A;
    eRad.checked = true;
    postAction('clicked_A');
}

function clickedB() {
    let eImg = document.getElementById('team_member_1');
    let eRad = document.getElementById('choice_B');

    eImg.src = IMG_URL_B;
    eRad.checked = true;
    postAction('clicked_B');
}

function radioChange() {
    let eImg = document.getElementById('team_member_1');
    let eRad = document.getElementById('choice_A');

    if (eRad.checked) {
        eImg.src = IMG_URL_A;
        postAction('radioChange_A');
    } else {
        eImg.src = IMG_URL_B;
        postAction('radioChange_B');
    }
}

function commentGotFocus() {
    postAction('commentFocus');
}

function postAnswer(nid) {
    let choice = getAnswerChoice();

    if (!choice) {
        alert('You must choose A or B before continuing...');
        postAction('submitNoChoice');
    } else {
        let http = new XMLHttpRequest();
        let url = '/question/' + nid;
        let payload = {};

        http.open('POST', url, true);

        http.setRequestHeader('Content-type', 'application/json');

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                let res = JSON.parse(http.responseText);
                window.location.replace(res.redirect);
            }
        };

        payload.uuid = getCookie(COOKIE_UUID);
        payload.user = getCookie(COOKIE_USER);
        payload.load_ts = loadTs;
        payload.submit_ts = Date.now();
        payload.thinking_time = (payload.submit_ts - payload.load_ts);
        payload.question = currentQuestion;
        payload.choice = getAnswerChoice();
        payload.comment = getAnswerComment();

        http.send(JSON.stringify(payload));
    }
}

function postAction(type, data) {
    let http = new XMLHttpRequest();
    let payload = {};
    let url = '/action/';

    http.open('POST', url, true);

    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            //Nothing needs to be done... just logging an action
        }
    };

    payload.uuid = getCookie(COOKIE_UUID);
    payload.user = getCookie(COOKIE_USER);
    payload.load_ts = loadTs;
    payload.submit_ts = Date.now();
    payload.thinking_time = (payload.submit_ts - payload.load_ts);
    payload.action = type;
    payload.data = data;

    http.send(JSON.stringify(payload));
}

function actionReload() {
    postAction('reloadPage');
}

function startDemo() {
    changeUser();
    postAction('startDemo');
    window.location.replace('/question');
}

function getAnswerChoice() {
    let result = null;
    let eA = document.getElementById('choice_A');
    let eB = document.getElementById('choice_B');

    if (eA && eA.checked) {
        result = 'A';
    }

    if (eB && eB.checked) {
        result = 'B';
    }

    return result;
}

function getAnswerComment() {
    let result = null;
    let e = document.getElementById('comment');

    if (e) {
       result = e.value;
    }

    return result;
}

function getCookie(key) {
    let result = null;
    let tgt = key + "=";
    let arr = document.cookie.split(';');

    for (let i = 0; i < arr.length; i++) {
        let thisCookie = arr[i];

        if (thisCookie.indexOf(tgt) == 1) {
            result = thisCookie.replace(tgt, '').trim();
        }
    }

    return result;
}

function setCookie(key, val, hours) {
    let d = new Date();

    if (!hours) {
        hours = 2;
    }

    d.setTime(d.getTime() + (hours*60*60*1000));
    let exp = "expires="+ d.toUTCString();
    document.cookie = key + "=" + val + ";" + exp + ";path=/";
}

function clearCookie() {
    let d = new Date();

    d.setTime(d.getTime());
    let exp = "expires="+ d.toUTCString();
    document.cookie = COOKIE_USER + "=" + temp + ";" + exp + ";path=/";
}
