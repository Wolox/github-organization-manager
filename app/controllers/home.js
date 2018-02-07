exports.index = (req, res, next) => {
  res.status(200);
  res.render('home');
};
