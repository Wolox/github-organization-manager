/* eslint-disable */

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

var TOKEN = 'token';


$('document').ready(function() {
  var teams = [];

  var addTeamButton = $('.add-team-button');
  var teamsContainer = addTeamButton.prev();


  var createTeamOptions = function (teams) {
    teams.forEach(function(team) {
      var teamContainer = $('<div class="team-container"></div>');
      teamContainer.append('<input type="checkbox" value="' + team.id + '" id="' + team.id + '">');
      teamContainer.append('<label for="' + team.id + '">' + team.name + '</label>');
      teamsContainer.append(teamContainer);
    });
  }

  $('.teams-filter').on('input', debounce(function () {
    teamsContainer.empty();
    var val = this.value;
    var teamsToShow = val
      ? teams.filter(function(team) {
        return team.name.indexOf(val) !== -1
      })
      : teams;
    createTeamOptions(teamsToShow);
  }, 150));

  $.ajax({
    method: 'GET',
    url: '/api/teams',
    data: {
      token: localStorage[TOKEN]
    }
  }).then(function(res) {
    teams = res.teams;
    $('.teams-title').text('Teams');
    addTeamButton.attr('disabled', false);
    createTeamOptions(res.teams);
  });

  //
  // $('.repository-create-button').click(function() {
  //   var name = $('.repository-name').val();
  //   var priv = $('.repository-private').val();
  //   var tech = $('input[name=tech]:checked').val();
  //   var token = localStorage[TOKEN];
  //   var repositorycreationMessages = 'repository-creation-messages';
  //   var repositoryCreateButton = $(this);
  //
  //   if (name && tech) {
  //     repositoryCreateButton.attr('disabled', true);
  //     $('.' + repositorycreationMessages).remove();
  //
  //     $.ajax({
  //       method: 'POST',
  //       url: '/api/repositories',
  //       data: {
  //         name: name + '-' + tech,
  //         private: priv,
  //         token: token
  //       }
  //     }).always(function() {
  //       repositoryCreateButton.attr('disabled', false);
  //     }).then(function(res) {
  //       $('.repository-creation-messages-container').append(
  //         '<div class="' + repositorycreationMessages + '"">' +
  //           '<a href="' + res.link + '">' +
  //             res.name +
  //           '</a> repo has been created successfully!' +
  //         '</div>'
  //       );
  //     }).catch(function(err) {
  //       var jsonErr = err.responseJSON;
  //       $('.repository-creation-messages-container').append(
  //         '<div class="' + repositorycreationMessages + '"">' +
  //           '<h5> Error: ' + jsonErr.message + '</h5>' +
  //           (jsonErr.errors && jsonErr.errors.length ?
  //             '<ul>' +
  //               jsonErr.errors.map(function (e) { return '<li>' + JSON.stringify(e) + '</li>' }) +
  //             '</ul>'
  //           : '') +
  //         '</div>'
  //       );
  //     });
  //   }
  // });
});
