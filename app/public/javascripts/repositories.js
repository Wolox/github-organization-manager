/* eslint-disable */

$('document').ready(function() {
  var TOKEN = 'token';

  $('.repository-create-button').click(function() {
    var name = $('.repository-name').val();
    var priv = $('.repository-private').val();
    var tech = $('input[name=tech]:checked').val();
    var token = localStorage[TOKEN];
    var repositorycreationMessages = 'repository-creation-messages';
    var repositoryCreateButton = $(this);

    if (name && tech) {
      repositoryCreateButton.attr('disabled', true);
      $('.' + repositorycreationMessages).remove();

      $.ajax({
        method: 'POST',
        url: '/api/repositories',
        data: {
          name: name + '-' + tech,
          private: priv,
          token: token
        }
      }).always(function() {
        repositoryCreateButton.attr('disabled', false);
      }).then(function(res) {
        $('.repository-creation-messages-container').append(
          '<div class="' + repositorycreationMessages + '"">' +
            '<a href="' + res.link + '">' +
              res.name +
            '</a> repo has been created successfully!' +
          '</div>'
        );
      }).catch(function(err) {
        var jsonErr = err.responseJSON;
        $('.repository-creation-messages-container').append(
          '<div class="' + repositorycreationMessages + '"">' +
            '<h5> Error: ' + jsonErr.message + '</h5>' +
            (jsonErr.errors && jsonErr.errors.length ?
              '<ul>' +
                jsonErr.errors.map(function (e) { return '<li>' + JSON.stringify(e) + '</li>' }) +
              '</ul>'
            : '') +
          '</div>'
        );
      });
    }
  });
});
