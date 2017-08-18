/* eslint-disable */

$('document').ready(function() {
  var TOKEN = 'token';

  if (localStorage[TOKEN]) {
    $('.authentication-token').val(localStorage[TOKEN]);
  }

  $('.authentication-button').click(function() {
    var username = $('.authentication-username').val();
    var password = $('.authentication-password').val();
    var otp = $('.authentication-otp').val();

    $.ajax({
      method: 'POST',
      url: '/auth',
      data: { username: username, password: password, otp: otp }
    }).done(function(token) {
        $('.authentication-token').val(token);
        localStorage.setItem(TOKEN, token);
      });
  });

  $('.token-update-button').click(function() {
    var token = $('.authentication-token').val();
    localStorage.setItem(TOKEN, token);
  });

  $('.repository-create-button').click(function() {
    var name = $('.repository-name').val();
    var priv = $('.repository-private').val();
    var token = localStorage[TOKEN];
    var repositorycreationMessages = 'repository-creation-messages';

    $.ajax({
      method: 'POST',
      url: '/repositories',
      data: { name: name, private: priv, token: token }
    }).always(function() {
      $('.' + repositorycreationMessages).remove();
    }).then(function(res) {
      $('.repository-creation-container').append(
        '<div class="' + repositorycreationMessages + '"">' +
          '<a href="' + res.link + '">' +
            res.name +
          '</a> repo has been created successfully!' +
        '</div>'
      );
    }).catch(function(err) {
      var jsonErr = err.responseJSON;
      $('.repository-creation-container').append(
        '<div class="' + repositorycreationMessages + '"">' +
          '<h5> Error: ' + jsonErr.message +
          (jsonErr.errors && jsonErr.errors.length ?
            '<ul>' +
              jsonErr.errors.map(function (e) { return '<li>' + JSON.stringify(e) + '</li>' }) +
            '</ul>'
          : '') +
        '</div>'
      );
    });
  });
});
