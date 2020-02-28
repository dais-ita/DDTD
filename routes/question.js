var express = require('express');
var router = express.Router();
let conf = require('../config.js');
const fs = require('fs');

/* GET home page. */
router.get('/:qid?', function(req, res, next) {
  let qid = req.params.qid;
  let qObj = null;
  let nid = null;

  console.log('GET ' + qid);
  if (!qid) {
    qid = getFirstQuestionId();
  }

  if (qid != 'end') {
    qObj = readQuestionJson(qid);
    nid = getNextQuestionId(qid);
    res.render('question', { question: qObj, qnum: nid[0], next: nid[1], qmax: 12 });
  } else {
    res.render('thankyou', { });
  }
});

router.post('/:qid?', function(req, res, next) {
  let qid = req.params.qid;
  let nid = null;

  savePostPayload(req.body);

  console.log('POST ' + qid);
  if (!qid) {
    qid = getFirstQuestionId();
  }

  if (qid != 'end') {
    nid = getNextQuestionId(qid);

    if (nid[1]) {
      res.json({ redirect: '/question/' + nid[1]});
    } else {
      res.json({ redirect: '/question/end'});
    }
  } else {
    res.json({ redirect: '/question/end'});
  }
});

function savePostPayload(pp) {
  pp.server_ts = Date.now();

  console.log('Saving POST payload');

  let fname = pp.uuid + '_' + pp.server_ts;

  fs.writeFile('./data/answers/' + fname + '.json', JSON.stringify(pp, null, 1), function(err) {
    if(err) {
      console.log('Error writing to file');
      return console.log(err);
    }

    console.log('The file was saved!');
  }); }

function readQuestionJson(qid) {
  let qObj = require('../data/situations/' + qid + '.json');

  doModifications(qObj);

  return qObj;
}

function doModifications(obj) {
  doReplacements(obj);
  insertUserSummaries(obj);
}

function insertUserSummaries(obj) {
  obj.options.first.preferences = conf.preferences[obj.options.first.type];
  obj.options.second.preferences = conf.preferences[obj.options.second.type];
}

function doReplacements(obj) {
  let rawSkill = obj.task.main_skill;
  let rawFormat = obj.task.format;
  let newSkill = conf.main_skills[rawSkill];
  let newFormat = conf.formats[rawFormat];

  if (newSkill) {
    obj.task.main_skill = newSkill;
  } else {
    console.log('Could not identify skill: ' + rawSkill + ' -> ' + newSkill);
  }

  if (newFormat) {
    obj.task.format = newFormat;
  } else {
    console.log('Could not identify format: ' + rawFormat + ' -> ' + newFormat);
  }
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
