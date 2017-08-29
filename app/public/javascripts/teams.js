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
  var repoTeamsContainer = $('.repo-teams-container');
  var userTeamsContainer = $('.user-teams-container');
  var repoTeamsFilterInput = $('.repo-teams-filter');
  var userTeamsFilterInput = $('.user-teams-filter');
  var createTeamButton = $('.create-team-button');
  var addTeamButton = $('.add-team-button');
  var addMemberButton = $('.add-member-button')

  // get teams
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
    createTeamOptions(repoTeamsContainer);
    createTeamOptions(userTeamsContainer);
  });

  // create team handler
  createTeamButton.click(function() {
    createTeamButton.attr('disabled', true);

    var name = $('.team-name').val();
    var token = localStorage[TOKEN];

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
      repoTeamsFilterInput.val('');
      createTeamOptions(repoTeamsContainer);
      userTeamsFilterInput.val('');
      createTeamOptions(userTeamsContainer);
      $.growl.notice({ message: 'Team creado!' });
    }).catch(function(err) {
      $.growl.error({ message: 'Error al crear el team. El nombre ya está en uso?' });
    });
  });

  // shows a filtered list of checkboxes in the team container
  var createTeamOptions = function (container, filter) {
    var containerPreffix = container.attr('class').split('-')[0] + '-';
    container.empty();
    var teamsToShow = filter
      ? teams.filter(function(team) {
        return team.name.indexOf(filter) !== -1
      })
      : teams;
    teamsToShow.forEach(function(team) {
      var teamContainer = $('<div class="team-container"></div>');
      teamContainer.append('<input type="checkbox" value="' + team.name + '" id="' + containerPreffix + team.id + '">');
      teamContainer.append('<label for="' + containerPreffix + team.id + '">' + team.name + '</label>');
      container.append(teamContainer);
    });
  }

  // filter teams on filter change
  repoTeamsFilterInput.on('input', debounce(function () {
    createTeamOptions(repoTeamsContainer, repoTeamsFilterInput.val());
  }, 150));
  userTeamsFilterInput.on('input', debounce(function () {
    createTeamOptions(userTeamsContainer, userTeamsFilterInput.val());
  }, 150));

  // add team to repositories handler
  addTeamButton.click(function() {
    addTeamButton.attr('disabled', true);

    var repositoryName = $('.team-target-repo').val();
    var token = localStorage[TOKEN];
    var teamIds = repoTeamsContainer.find('input[type="checkbox"]:checked')
                                    .map((index, teamInput) => ({ id: teamInput.id.split('-')[1], name: teamInput.value }));

    teamIds.each((index, team) => {
      $.ajax({
        method: 'POST',
        url: '/api/repositories/' + repositoryName + '/teams/' + team.id,
        data: { token: token }
      }).always(function(resp) {
        addTeamButton.attr('disabled', false);
      }).then(function(resp) {
        $.growl.notice({ message: team.name + ' agregado a ' + repositoryName });
      }).catch(function(err) {
        $.growl.error({ message: 'Error al agregar ' + team.name + ' a ' + repositoryName });
      });
    })
  });

  // add members to team handler
  addMemberButton.click(function() {
    addMemberButton.attr('disabled', true);

    var teamIds = userTeamsContainer.find('input[type="checkbox"]:checked')
                                    .map((index, teamInput) => ({ id: teamInput.id.split('-')[1], name: teamInput.value }));
    var githubUsername = $('.target-user-name').val();
    var maintainer = $('.user-maintainer').is(':checked');
    var token = localStorage[TOKEN];

    teamIds.each((index, team) => {
      $.ajax({
        method: 'POST',
        url: '/api/teams/' + team.id + '/members/' + githubUsername,
        data: { token: token, maintainer: maintainer }
      }).always(function(resp) {
        addMemberButton.attr('disabled', false);
      }).then(function(resp) {
        $.growl.notice({ message: githubUsername + ' agregado a ' + team.name });
      }).catch(function(err) {
        $.growl.error({ message: 'Error al agregar ' + githubUsername + ' a ' + team.name });
      });
    })
  });
});
