// Task 2: effects. Everything is jQuery (animate, fadeTo, stop, offset, clone, ...).
(function () {
  const sortState = {};            // roomId -> true when the room is sorted by time
  let openName = null;             // name of the guest whose card is open
  let pending = [];                // moves that are still flying
  const $card = $('<div id="card">').appendTo('body');
  const THINGS = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };

  const guestEl = name => $('#house .guest[data-name="' + name + '"]');
  const joinList = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const dataFromEl = $g => ({
    name: $g.attr('data-name'), color: $g.attr('data-color'), time: $g.attr('data-time'),
    aitu: $g.attr('data-aitu') === 'yes', things: ($g.attr('data-things') || '').split(',').filter(Boolean)
  });

  /* ---------- order helpers (sort by time) ---------- */
  function orderOf($guests, sorted) {
    return $guests.children('.guest').get().sort((a, b) => {
      const A = $(a), B = $(b);
      if (sorted) { const d = A.data('minutes') - B.data('minutes'); if (d) return d; }
      return A.data('idx') - B.data('idx');                 // picture order
    });
  }
  function reorder($guests, sorted) {                       // instant
    $.each(orderOf($guests, sorted), (i, el) => $guests.append(el));
    $guests.children('.guest-slot').appendTo($guests);      // arriving place stays last
  }
  // FLIP: remember where the cards are, reorder, then slide every card from the old place.
  function animateOrder($room, sorted) {
    const $g = $room.find('.guests'), $cards = $g.children('.guest');
    $cards.stop(true);                                      // fast clicks: no queue
    const before = $cards.map(function () { return $(this).offset(); }).get();
    $cards.css({ left: 0, top: 0 });
    reorder($g, sorted);
    $cards.each(function (i) {
      const now = $(this).offset();
      $(this).css({ left: before[i].left - now.left, top: before[i].top - now.top })
             .animate({ left: 0, top: 0 }, 600);
    });
  }

  /* ---------- hooks used by app.js ---------- */
  HOOKS.afterBuild = function () {
    pending = [];
    $card.stop(true).hide(); openName = null;
    $('.room').each(function () {
      const id = $(this).data('room');
      $('<button class="sort-btn">Sort by time</button>').toggleClass('on', !!sortState[id])
        .appendTo($(this).find('.room-head'));
      if (sortState[id]) reorder($(this).find('.guests'), true);
    });
  };
  // 1. Spotlight: found guests stay bright, the others fade to 20% in 0.3 s
  HOOKS.afterCase = function ($found, isRooms) {
    const $keep = isRooms ? $found.find('.guest') : $found;
    $('#house .guest').not($keep).stop(true).fadeTo(300, 0.2);
  };
  $(document).on('click', '#clear', function () {
    $('#house .guest').stop(true).css({ left: 0, top: 0 }).fadeTo(300, 1);
    $('.found').removeClass('found');
    $('#result').empty();
  });

  /* ---------- 4. Sort by time ---------- */
  $(document).on('click', '.sort-btn', function () {
    const $room = $(this).closest('.room'), id = $room.data('room');
    sortState[id] = !sortState[id];
    $(this).toggleClass('on', sortState[id]);
    animateOrder($room, sortState[id]);
  });

  /* ---------- 2. Guest card ---------- */
  function cardTarget(r) {
    const W = 280, H = 300, st = $(window).scrollTop();
    const left = Math.max(8, Math.min(r.left + r.width / 2 - W / 2, $(document).width() - W - 8));
    const top = Math.max(st + 8, Math.min(r.top + r.height + 8, st + $(window).height() - H - 8));
    return { left: left, top: top, width: W, height: H };
  }
  const rectOf = $g => { const $a = $g.find('.avatar'), o = $a.offset();
    return { left: o.left, top: o.top, width: $a.outerWidth(), height: $a.outerHeight() }; };

  function cardBody($g) {
    const d = dataFromEl($g), roomId = $g.closest('.room').data('room');
    const room = PARTY.find(r => r.id === roomId) || { name: '' };
    const $b = $('<div class="card-body">');
    $('<h4>').text(d.name).appendTo($b);
    $('<p>').text('Came at ' + d.time).appendTo($b);
    $('<p>').text(d.aitu ? 'AITU student' : 'Not an AITU student').appendTo($b);
    $('<p>').text('Wearing ' + d.color).appendTo($b);
    $('<p>').text(d.things.length ? 'Has ' + joinList(d.things.map(t => THINGS[t])) : 'Came with nothing').appendTo($b);
    $('<p>').text('Now in the ' + room.name.toLowerCase()).appendTo($b);
    PARTY.filter(r => r.id !== roomId).forEach(r =>
      $('<button class="move-btn">').attr('data-to', r.id).text('Move to the ' + r.name.toLowerCase()).appendTo($b));
    return $b;
  }
  function openCard($g) {
    const r = rectOf($g), t = cardTarget(r);
    openName = $g.attr('data-name');
    $card.stop(true).empty().append(cardBody($g)).css({ display: 'block', opacity: 0.3,
      left: r.left, top: r.top, width: r.width, height: r.height });
    $card.find('.card-body').hide();
    $card.animate({ left: t.left, top: t.top, width: t.width, height: t.height, opacity: 1 }, 350,
      function () { $card.find('.card-body').fadeIn(150); });
  }
  function closeCard(done) {
    if (!openName) { if (done) done(); return; }
    const $g = guestEl(openName); openName = null;
    $card.stop(true).find('.card-body').stop(true).hide();
    if (!$g.length) { $card.hide(); if (done) done(); return; }
    const r = rectOf($g);
    $card.animate({ left: r.left, top: r.top, width: r.width, height: r.height, opacity: 0.3 }, 250,
      function () { $card.hide(); if (done) done(); });
  }
  $(document).on('click', '.guest', function () {
    const $g = $(this); if ($g.hasClass('flying')) return;
    if (openName === $g.attr('data-name')) return closeCard();
    if (openName) closeCard(() => openCard($g)); else openCard($g);
  });
  $(document).on('click', e => { if (!$(e.target).closest('#card, .guest').length) closeCard(); });
  $(document).on('keydown', e => { if (e.key === 'Escape') closeCard(); });

  /* ---------- 3. Move ---------- */
  $card.on('click', '.move-btn', function (e) {
    e.stopPropagation();
    const name = openName, to = $(this).data('to');
    $card.stop(true).hide(); openName = null;
    moveGuest(name, to);
  });

  function moveGuest(name, toId) {
    const $old = guestEl(name);
    if (!$old.length || $old.closest('.room').data('room') === toId) return;
    pending.slice().forEach(p => p.land());                 // finish earlier moves first
    const data = dataFromEl($old);
    PARTY.forEach(r => { const k = r.guests.findIndex(g => g.name === name); if (k > -1) r.guests.splice(k, 1); });
    const toRoom = PARTY.find(r => r.id === toId);
    toRoom.guests.push(data);                               // the array changes too
    const idx = toRoom.guests.length - 1;

    const W = $old.outerWidth(true), m = parseInt($old.css('marginLeft'), 10);
    const $slot = $('<div class="guest-slot">').appendTo('#room-' + toId + ' .guests');
    $slot.css('width', W); const dest = $slot.offset(); $slot.css('width', 0);   // where the card will stand
    const from = $old.offset();
    const $fly = $old.clone().addClass('flying')
      .css({ position: 'absolute', left: from.left, top: from.top, margin: 0, zIndex: 900 }).appendTo('body');

    const mv = { land: function () {
      pending = pending.filter(p => p !== mv);
      $old.stop(true).remove(); $fly.stop(true).remove();
      $slot.stop(true).replaceWith(makeGuest(data, idx));
      const $room = $('#room-' + toId);
      if (sortState[toId]) { sortState[toId] = false; $room.find('.sort-btn').removeClass('on'); animateOrder($room, false); }
    }};
    pending.push(mv);

    $old.css({ visibility: 'hidden', overflow: 'hidden' })              // old place closes slowly
        .animate({ width: 0, marginLeft: 0, marginRight: 0 }, 700);
    $slot.animate({ width: W }, 700);                                   // new place opens slowly
    $fly.animate({ left: dest.left + m, top: dest.top }, 900, mv.land); // the card flies
  }
})();
