// jQuery only: no onclick attributes, no CSS transitions/animations.
window.HOOKS = window.HOOKS || {};            // extension points (used in Task 2)
const ICONS = { phone: '📱', glasses: '👓', bag: '👜', cup: '☕', crumbs: '🍰' };

const toMinutes = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const avatarUrl = n => 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + encodeURIComponent(n);
// Offline fallback: a grey circle with the first letter (used when the avatar service is blocked)
const fallbackAvatar = n => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52"><rect width="52" height="52" fill="#e3e3e3"/>' +
  '<text x="26" y="35" font-size="26" text-anchor="middle" font-family="Arial" fill="#555">' + n[0] + '</text></svg>');

// One guest card. Data is stored as classes AND data-* attributes.
function makeGuest(g, idx) {
  const classes = ['guest', 'color-' + g.color, g.aitu ? 'aitu' : 'not-aitu'];
  g.things.forEach(t => classes.push('has-' + t));
  if (!g.things.length) classes.push('no-things');

  const $card = $('<div>').addClass(classes.join(' ')).attr({
    'data-name': g.name, 'data-color': g.color, 'data-time': g.time,
    'data-minutes': toMinutes(g.time), 'data-aitu': g.aitu ? 'yes' : 'no',
    'data-things': g.things.join(','), 'data-idx': idx
  });
  $('<img class="avatar">').one('error', function () { this.src = fallbackAvatar(g.name); })
    .attr({ src: avatarUrl(g.name), alt: g.name }).appendTo($card);
  if (g.aitu) $('<span class="badge" title="AITU student">🎓</span>').appendTo($card);
  $('<div class="name">').text(g.name).appendTo($card);
  $('<div class="time">').text('◷ ' + g.time).appendTo($card);
  $('<div class="icons">').text(g.things.map(t => ICONS[t]).join(' ')).appendTo($card);
  return $card;
}

// Build the whole house from the PARTY array.
function buildParty() {
  $('#house *').stop(true);                    // kill unfinished animations
  $('.flying').stop(true).remove();
  const $house = $('#house').empty();

  [2, 1].forEach(floor => {
    const $floor = $('<div class="floor">').attr('data-floor', floor)
      .append($('<div class="floor-label">').text('FLOOR ' + floor));
    const $rooms = $('<div class="rooms">').appendTo($floor);

    PARTY.filter(r => r.floor === floor).forEach(r => {
      const $room = $('<div class="room">')
        .attr({ id: 'room-' + r.id, 'data-room': r.id, 'data-floor': floor });
      $('<div class="room-head">').append($('<h3>').text(r.name)).appendTo($room);
      const $guests = $('<div class="guests">').appendTo($room);
      r.guests.forEach((g, i) => $guests.append(makeGuest(g, i)));
      $rooms.append($room);
    });
    $house.append($floor);
  });

  $('#result').empty();
  if (HOOKS.afterBuild) HOOKS.afterBuild();
}

// Run one case: rebuild the page, run the chain, highlight, jump, report.
function runCase(i) {
  const c = CASES[i];
  buildParty();
  const $found = c.run();

  const names = $found.map(function () {
    return c.rooms ? $(this).find('h3').first().text() : $(this).data('name');
  }).get();

  $found.addClass('found');
  if (!c.noJump && !c.rooms) {
    $found.animate({ top: -16 }, 150).animate({ top: 0 }, 150);   // jump once
  }
  $('#result').html('<b>Case ' + (i + 1) + ':</b> ' + c.title + '<br><b>Found: ' +
    names.length + '</b> — ' + (names.join(', ') || 'nobody'));
  if (HOOKS.afterCase) HOOKS.afterCase($found, !!c.rooms);
}

$(function () {
  CASES.forEach((c, i) => {
    $('<button class="case-btn">').html('<b>' + (i + 1) + '</b> ' + c.title)
      .on('click', () => runCase(i)).appendTo('#cases');
  });
  buildParty();
});
