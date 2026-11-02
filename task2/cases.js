// All 20 cases. Every case is ONE jQuery chain that searches the PAGE (not the array).
// rooms:true  -> the case finds rooms, not guests
// noJump:true -> the found guest is animated by the case itself (fadeIn / fadeOut)
const CASES = [
  { title: 'Who is in the hall?',
    run: () => $('#room-hall .guest') },

  { title: 'Who is dressed in yellow or purple?',
    run: () => $('.guest').filter('.color-yellow, .color-purple') },

  { title: 'Which AITU students are upstairs?',
    run: () => $('.room[data-floor="2"] .guest.aitu') },

  { title: 'Who has glasses or a bag?',
    run: () => $('.guest.has-glasses, .guest.has-bag') },

  { title: 'Who came with nothing at all?',
    run: () => $('.guest.no-things') },

  { title: 'Who has a phone but no bag?',
    run: () => $('.guest.has-phone:not(.has-bag)') },

  { title: 'Who arrived between 20:30 and 21:00 (both included)?',
    run: () => $('.guest')
      .filter(function () { const m = $(this).data('minutes'); return m >= 1230 && m <= 1260; }) },

  { title: 'Who arrived after 21:00 and is not an AITU student?',
    run: () => $('.guest.not-aitu')
      .filter(function () { return $(this).data('minutes') > 1260; }) },

  { title: 'Who stands right next to Askar?',
    run: () => $('.guest[data-name="Askar"]').prev()
      .add($('.guest[data-name="Askar"]').next()) },

  { title: 'Who stands last in each room?',
    run: () => $('.guests .guest:last-child') },

  { title: 'Who stands third in each room?',
    run: () => $('.guests .guest:nth-child(3)') },

  { title: 'Who stands after Timur in his room?',
    run: () => $('.guest[data-name="Timur"]').nextAll() },

  { title: 'Who stands right before someone in black?',
    run: () => $('.guest.color-black').prev() },

  { title: 'In which room is Aruzhan?', rooms: true,
    run: () => $('.guest[data-name="Aruzhan"]').closest('.room') },

  { title: 'Which rooms have fewer than 6 guests?', rooms: true,
    run: () => $('.room:not(:has(.guest:nth-child(6)))') },

  { title: 'In which rooms does somebody have a cup, but nobody wears glasses?', rooms: true,
    run: () => $('.room:has(.has-cup):not(:has(.has-glasses))') },

  { title: 'Who came first to each room?',
    run: () => $('.guests .guest:first-child') },

  { title: 'Miras (AITU, blue, 21:20, phone) joins between Askar and Inkar', noJump: true,
    run: () => makeGuest(MIRAS, 3.5).hide()
      .insertAfter('.guest[data-name="Askar"]').fadeIn(800) },

  { title: 'Natasha goes home (fadeOut + remove)', noJump: true,
    run: () => $('.guest[data-name="Natasha"]')
      .fadeOut(800, function () { $(this).remove(); }) },

  { title: 'Who took the cake? (the thief)',
    run: () => $('.room[data-floor="1"] .guest.has-crumbs:not(.has-cup)')
      .filter(function () { const m = $(this).data('minutes'); return m > 1260 && m < 1290; })
      .filter(function () { return $(this).prev().add($(this).next()).filter('.aitu').length > 0; }) }
];
