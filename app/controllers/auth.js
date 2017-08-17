const github = require('../services/github');

exports.init = (req, res) => {
  github.auth(req.body.username, req.body.password, req.body.otp).then(token => {
    res.status(200);
    res.send(token);
  });
};
