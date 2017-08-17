/* eslint-disable */

$('document').ready(function() {
  $('.authentication-button').click(function() {
    var username = $('.authentication-username').val();
    var password = $('.authentication-password').val();
    var otp = $('.authentication-otp').val();

    $.ajax({
      method: 'POST',
      url: '/auth',
      data: { username: username, password: password, otp: otp }
    }).done(function( msg ) {
        alert( 'Data Saved: ' + msg );
      });
  });
});
