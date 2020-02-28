let express = require('express');
let router = express.Router();
let conf = require('../config.js');
const path = require('path');
const fs = require('fs');
const DATA_FOLDER = '../data/answers/';

/* GET home page. */
router.get('/:user', function(req, res, next) {
  console.log('GET show-results');
  let user = req.params.user;
  let ansList = getAllAnswers(12);
  let thisRow = null;

  for (let [k1, v1] of Object.entries(ansList)) {
    if (v1[2] == user) {
      thisRow = [ v1[3][0], v1[4][0], v1[5][0],v1[6][0],v1[7][0],v1[7][0],v1[9][0],v1[10][0],v1[11][0],v1[12][0],v1[13][0],v1[14][0]];
    }
  }

  let aiAnswers = [ 'A',  'A', 'I', 'A', 'I', 'I', 'A',  'A', 'I', 'A', 'I', 'I' ];
  let realAnswers = [ 'I', 'A', 'A', 'A', 'A', 'I', 'I', 'A', 'A', 'A', 'A', 'I' ];
  //004N', '002', '007N', '027', '016N', '031
  //REAL/AI
  //I/A, A/A, A/I, A/A, A/I, I/I

  console.log(thisRow);
  console.log(user);

  res.render('show-results', {'result': ansList});
});

function getAllAnswers(qlimit) {
  let ansList = getUserObjects();
  let hdr = [];
  let table = [];

  hdr.push('ts');
  hdr.push('uuid');
  hdr.push('username');

  for (let i = 1; i <= qlimit; i++) {
    hdr.push('Q' + i);
  }

  table.push(hdr);

  for (let [k1, v1] of Object.entries(ansList)) {
    let thisRow = [];

    thisRow.push(v1.server_ts);
    thisRow.push(v1.uuid);
    thisRow.push(v1.user);

    for (let i = 1; i <= qlimit; i++) {
      if (v1.answers[i]) {
        thisRow.push([ v1.answers[i].choice, v1.answers[i].comment, v1.answers[i].time ]);
      } else {
        thisRow.push([null, null, null]);
      }
    }

    table.push(thisRow);
  }

  return table;
}

function getUserObjects() {
  const directoryPath = path.join(__dirname, DATA_FOLDER);
  let result = {};

  let files = fs.readdirSync(directoryPath);

  files.forEach(function (file) {
    let obj = JSON.parse(fs.readFileSync(path.join(__dirname, DATA_FOLDER + file), 'utf8'));
    let uid = obj.uuid + ':' + obj.user;
    let thisRow = result[uid];

    if (!thisRow) {
      result[uid] = { 'uuid':obj.uuid, 'user': obj.user, 'answers': {} };
      thisRow = result[uid];
    }

    let thisCell = thisRow.answers[obj.question];

    if (!thisCell) {
      thisRow.answers[obj.question] = {};
      thisCell = thisRow.answers[obj.question];
    }

    thisCell.question = obj.question;
    thisCell.choice = obj.choice;
    thisCell.comment = obj.comment;
    thisCell.time = obj.thinking_time;
    thisRow.server_ts = obj.server_ts;
  });

  return result;
}

module.exports = router;
