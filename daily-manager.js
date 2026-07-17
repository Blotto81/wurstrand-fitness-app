// ======================================
// WRC DAILY MANAGER
// Version 3.0
// ======================================

const DailyManager = {

  // -----------------------------
  // Einstellungen
  // -----------------------------

  recentDailyLimit: 20,

  recentCategoryLimit: 3,

  // -----------------------------
  // Neue Daily
  // -----------------------------
getDailyById(id) {
  return DAILY_POOL.find(
    daily => daily.id === id
  ) || null;
},
  getDaily(player) {

    const history = WRCDaily
      .getLocalHistory()
      .filter(h => h.player === player);

    const recentIds = history
      .slice(-this.recentDailyLimit)
      .map(h => h.id);

    const recentCategories = history
      .slice(-this.recentCategoryLimit)
      .map(h => h.category);

    const categories = [
      ...new Set(
        DAILY_POOL
          .filter(d => d.active !== false)
          .map(d => d.category)
      )
    ];

    let availableCategories =
      categories.filter(
        c => !recentCategories.includes(c)
      );

    if (availableCategories.length === 0) {
      availableCategories = [...categories];
    }

    this.shuffle(availableCategories);

    for (const category of availableCategories) {

      let pool = DAILY_POOL.filter(d =>
        d.active !== false &&
        d.category === category &&
        !recentIds.includes(d.id)
      );

      if (pool.length === 0) {

        pool = DAILY_POOL.filter(d =>
          d.active !== false &&
          d.category === category
        );

      }

      if (pool.length > 0) {

        return this.random(pool);

      }

    }

    return this.random(
      DAILY_POOL.filter(
        d => d.active !== false
      )
    );

  },

  // -----------------------------
  // Joker
  // -----------------------------

  getJokerDaily(player, currentId) {

  const history = WRCDaily
    .getLocalHistory()
    .filter(h => h.player === player);

  const recentIds = history
    .slice(-this.recentDailyLimit)
    .map(h => h.id);

  const recentCategories = history
    .slice(-this.recentCategoryLimit)
    .map(h => h.category);

  const currentDaily = DAILY_POOL.find(
    d => d.id === currentId
  );

  const categories = [
    ...new Set(
      DAILY_POOL
        .filter(d => d.active !== false)
        .map(d => d.category)
    )
  ];

  let availableCategories = categories.filter(
    c =>
      c !== currentDaily.category &&
      !recentCategories.includes(c)
  );

  if (availableCategories.length === 0) {
    availableCategories = categories.filter(
      c => c !== currentDaily.category
    );
  }

  if (availableCategories.length === 0) {
    availableCategories = categories;
  }

  this.shuffle(availableCategories);

  for (const category of availableCategories) {

    let pool = DAILY_POOL.filter(
      d =>
        d.active !== false &&
        d.category === category &&
        d.id !== currentId &&
        !recentIds.includes(d.id)
    );

    if (pool.length === 0) {

      pool = DAILY_POOL.filter(
        d =>
          d.active !== false &&
          d.category === category &&
          d.id !== currentId
      );

    }

    if (pool.length > 0) {
      return this.random(pool);
    }

  }

  return this.random(
    DAILY_POOL.filter(
      d =>
        d.active !== false &&
        d.id !== currentId
    )
  );

},

  // -----------------------------
  // Zufall
  // -----------------------------

  random(array) {

    return array[
      Math.floor(
        Math.random() *
        array.length
      )
    ];

  },

  // -----------------------------
  // Mischen
  // -----------------------------

  shuffle(array) {

    for (
      let i = array.length - 1;
      i > 0;
      i--
    ) {

      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [
        array[i],
        array[j]
      ] = [
        array[j],
        array[i]
      ];

    }

    return array;

  }

};