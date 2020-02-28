var express = require('express');
var router = express.Router();
let conf = require('../config.js');
const fs = require('fs');

router.post('/', function(req, res, next) {
  savePostPayload(req.body);

  console.log('POST ACTION');

  //Nothing specific needs to be returned
  res.json({'status': 'SUCCESS'});
});

function savePostPayload(pp) {
  pp.server_ts = Date.now();

  console.log('Saving POST payload');

  let fname = pp.uuid + '_' + pp.server_ts;

  fs.writeFile('./data/actions/' + fname + '.json', JSON.stringify(pp, null, 1), function(err) {
    if(err) {
      console.log('Error writing to file');
      return console.log(err);
    }

    console.log('The file was saved!');
  }); }

function readQuestionJson(qid) {
  let qObj = require('../data/situations/' + qid + '.json');

  return qObj;
}

function getFirstQuestionId() {
  return conf.qList[0];
}

function getNextQuestionId(qid) {
  let result = null;

  for (let i = 0; i < conf.qList.length; i++) {
    let thisVal = conf.qList[i];

    if (thisVal == qid) {
      let nid = conf.qList[i+1];

      result = [i+1, nid];
    }
  }

  return result;
}

module.exports = router;
