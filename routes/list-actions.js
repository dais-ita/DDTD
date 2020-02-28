var express = require('express');
var router = express.Router();
let conf = require('../config.js');
const path = require('path');
const fs = require('fs');
const DATA_FOLDER = '../data/actions/';

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('GET list-actions');

  let acList = getAllActions();

  res.render('list-actions', {'result': acList});
});


function getAllActions() {
  let acList = getActionObjects();
  let hdr = [];
  let table = [];

  hdr.push('ts');
  hdr.push('uuid');
  hdr.push('username');
  hdr.push('action');
  hdr.push('data');
  hdr.push('time');

  table.push(hdr);

  for (let [k1, v1] of Object.entries(acList)) {

    for (let [k2, v2] of Object.entries(v1.actions)) {
      let thisRow = [ v1.server_ts, v1.uuid, v1.user ];
      thisRow.push(v2.action, v2.data, v2.thinking_time)
      table.push(thisRow);
    }
  }

  return table;
}

function getActionObjects() {
  const directoryPath = path.join(__dirname, DATA_FOLDER);
  let result = {};

  let files = fs.readdirSync(directoryPath);

  files.forEach(function (file) {
    let obj = null;

    try {
      obj = JSON.parse(fs.readFileSync(path.join(__dirname, DATA_FOLDER + file), 'utf8'));
    } catch(e) {
      console.log(file);
      console.log(e);
    }

    if (obj) {
      let uid = obj.uuid + ':' + obj.user;
      let thisRow = result[uid];

      if (!thisRow) {
        result[uid] = { 'server_ts': obj.server_ts, 'uuid': obj.uuid, 'user': obj.user, 'actions': [] };
        thisRow = result[uid];
      }

      let thisAction = {};
      thisAction.action = obj.action;
      thisAction.data = obj.data;
      thisAction.thinking_time = obj.thinking_time;

      thisRow.actions.push(thisAction);
    }
  });

  return result;
}

module.exports = router;
