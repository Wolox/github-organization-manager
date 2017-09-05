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
    var authenticationButton = $(this);

    authenticationButton.attr('disabled', true);
    $.ajax({
      method: 'POST',
      url: '/auth',
      data: { username: username, password: password, otp: otp }
    }).always(function() {
      authenticationButton.attr('disabled', false);
    }).done(function(token) {
        $('.authentication-token').val(token);
        localStorage.setItem(TOKEN, token);
      });
  });

  $('.token-update-button').click(function() {
    var token = $('.authentication-token').val();
    localStorage.setItem(TOKEN, token);
  });
});
