const WRCDailyStorage = {
  getStates() {
    try {
      return JSON.parse(
        localStorage.getItem(this.statesKey) || "{}"
      );
    } catch (error) {
      console.error("Daily-Zustände konnten nicht gelesen werden:", error);
      return {};
    }
  },

  getLocalHistory() {
    try {
      return JSON.parse(
        localStorage.getItem(this.historyKey) || "[]"
      );
    } catch (error) {
      console.error("Lokale Daily-Historie konnte nicht gelesen werden:", error);
      return [];
    }
  },

  saveLocalHistory(entry) {
    const history = this.getLocalHistory();

    const alreadySaved = history.some(item =>
      item.player === entry.player &&
      item.date === entry.date &&
      item.id === entry.id
    );

    if (alreadySaved) {
      return;
    }

    history.push(entry);

    localStorage.setItem(
      this.historyKey,
      JSON.stringify(history)
    );
  },

getJokersUsed(player) {
  try {
    const allJokers = JSON.parse(
      localStorage.getItem(this.jokerKey) || "{}"
    );

    const key = `${this.getMonthKey()}__${player}`;

    return allJokers[key] || 0;
  } catch {
    return 0;
  }
},

useJoker(player) {
  const used = this.getJokersUsed(player);

  if (used >= this.maxJokersPerMonth) {
    return false;
  }

  const allJokers = JSON.parse(
    localStorage.getItem(this.jokerKey) || "{}"
  );

  const key = `${this.getMonthKey()}__${player}`;

  allJokers[key] = used + 1;

  localStorage.setItem(
    this.jokerKey,
    JSON.stringify(allJokers)
  );

  return true;
},
};
