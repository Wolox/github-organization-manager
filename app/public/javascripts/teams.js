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

  var createTeamOptions = function (teams) {
    teams.forEach(function(team) {
      var teamContainer = $('<div class="team-container"></div>');
      teamContainer.append('<input type="checkbox" value="' + team.id + '" id="' + team.id + '">');
      teamContainer.append('<label for="' + team.id + '">' + team.name + '</label>');
      teamsContainer.append(teamContainer);
    });
  }

  var teamsFilterInput = $('.teams-filter');
  teamsFilterInput.on('input', debounce(function () {
    teamsContainer.empty();
    var val = this.value;
    var teamsToShow = val
      ? teams.filter(function(team) {
        return team.name.indexOf(val) !== -1
      })
      : teams;
    createTeamOptions(teamsToShow);
  }, 150));

  var createTeamButton = $('.create-team-button');
  createTeamButton.click(function() {
    var name = $('.team-name').val();
    var token = localStorage[TOKEN];
    createTeamButton.attr('disabled', true);
    $.ajax({
      method: 'POST',
      url: '/api/teams',
      data: {
        name: name,
        token: token
      }
    }).always(function(resp) {
      createTeamButton.attr('disabled', false);
    }).then(function(resp) {
      teams.push(resp.team.data);
      teamsFilterInput.val('');
      createTeamOptions(teams);
      $.growl.notice({ message: 'Team creado!' });
    }).catch(function(err) {
      $.growl.error({ message: 'Error al crear el team. El nombre ya está en uso?' });
    });
  });
