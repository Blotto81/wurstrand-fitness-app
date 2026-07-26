    const ENTRIES_CACHE_KEY = "wrc_entries_quickstart_v1";

    function restoreEntriesQuickstart() {
      if (allEntries.length) return false;

      try {
        const cached = JSON.parse(localStorage.getItem(ENTRIES_CACHE_KEY) || "null");
        if (!Array.isArray(cached?.entries)) return false;

        allEntries = cleanLoadedEntries(cached.entries);
        renderDashboard();
        return true;
      } catch (error) {
        console.warn("WRC quickstart cache could not be read:", error);
        return false;
      }
    }

    function rememberEntriesQuickstart(entries) {
      try {
        localStorage.setItem(ENTRIES_CACHE_KEY, JSON.stringify({
          savedAt: new Date().toISOString(),
          entries
        }));
      } catch (error) {
        console.warn("WRC quickstart cache could not be written:", error);
      }
    }

    async function loadEntries() {
      const restoredFromCache = restoreEntriesQuickstart();
      if (!restoredFromCache && !allEntries.length) {
        renderDashboard();
      }

      const { data, error } = await supabaseClient
        .from("entries")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.log(error);
        toast("Fehler beim Laden: " + (error.message || "Supabase"));
        return;
      }

      allEntries = cleanLoadedEntries(data || []);
      rememberEntriesQuickstart(allEntries);
      renderAll();
      if (typeof WRCPost !== "undefined") {
        WRCPost.syncStreakMilestones(allEntries);
      }
      if (typeof WRCYearReview !== "undefined") {
        WRCYearReview.onEntriesLoaded(allEntries);
      }
      if (typeof WRCBirthday !== "undefined") {
        WRCBirthday.onEntriesLoaded(allEntries);
      }
    }

    function getNewPersonalRecords(entry) {
      const metrics = [
        { key: "steps", label: "Schritte", decimals: 0, suffix: "", value: e => +e.steps || 0 },
        { key: "bike", label: "Fahrrad", decimals: 1, suffix: " km", value: e => +e.bike || 0 },
        { key: "squats", label: "Kniebeugen", decimals: 0, suffix: "", value: e => +e.squats || 0 },
        { key: "pushups", label: "Liegestütze", decimals: 0, suffix: "", value: e => +e.pushups || 0 },
        { key: "points", label: "Tagespunkte", decimals: 1, suffix: " Punkte", value: e => calcPoints(e).total }
      ];

      const playerEntries = allEntries.filter(e => e.person === entry.person);

      return metrics.flatMap(metric => {
        const current = metric.value(entry);
        if (current <= 0) return [];

        const oldDayBest = playerEntries
          .filter(e => e.date === entry.date)
          .reduce((best, e) => Math.max(best, metric.value(e)), 0);

        const otherDayBest = playerEntries
          .filter(e => e.date !== entry.date)
          .reduce((best, e) => Math.max(best, metric.value(e)), 0);

        const previous = Math.max(oldDayBest, otherDayBest);
        if (current <= previous) return [];

        const improvement = previous > 0
          ? ((current - previous) / previous) * 100
          : null;

        return [{
          key: metric.key,
          label: metric.label,
          decimals: metric.decimals,
          suffix: metric.suffix,
          current,
          previous,
          improvement,
          significant: improvement !== null && improvement >= 10
        }];
      });
    }

    async function saveEntry() {
      const entry = {
        date: document.getElementById("date").value,
        person: document.getElementById("person").value,
        steps: +document.getElementById("steps").value || 0,
        bike: +document.getElementById("bike").value || 0,
        squats: +document.getElementById("squats").value || 0,
        pushups: +document.getElementById("pushups").value || 0,
        exercise: document.getElementById("exercise").checked
      };

      if (!entry.date) {
        toast("Bitte Datum wählen");
        return;
      }

      const existing = allEntries.find(e =>
        e.date === entry.date &&
        e.person === entry.person &&
        e.id !== editingId
      );

      let result;
      let savedEntry = entry;
      let wasMerged = false;
      let wasEditing = !!editingId;

      if (existing) {
        const merged = mergeEntries(existing, entry);
        savedEntry = merged;
        wasMerged = true;

        result = await supabaseClient
          .from("entries")
          .update(merged)
          .eq("id", existing.id);
      } else if (editingId) {
        result = await supabaseClient
          .from("entries")
          .update(entry)
          .eq("id", editingId);
      } else {
        result = await supabaseClient
          .from("entries")
          .insert([entry]);
      }

      if (result.error) {
        console.log(result.error);
        toast("Speichern fehlgeschlagen: " + (result.error.message || "Supabase"));
        return;
      }

      const personalRecords = getNewPersonalRecords(savedEntry);
      if (typeof WRCPost !== "undefined") {
        WRCPost.rememberPlayer(savedEntry.person);
      }
      resetForm();
      await loadEntries();
      showSaveReward(buildSaveReward(savedEntry, {
        merged: wasMerged,
        editing: wasEditing,
        personalRecords
      }));
      if (personalRecords.length && typeof WRCPost !== "undefined") {
        WRCPost.maybeFromEvent("personal_record", {
          player: savedEntry.person,
          eventId: `record_${savedEntry.date}_${personalRecords.map(record => record.key).join("_")}`,
          delay: 5600
        });
      }
      showTab("dashboard", menuLinkForPanel("dashboard"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function deleteEntry(id) {
      if (!confirm("Eintrag wirklich löschen?")) return;

      const { error } = await supabaseClient
        .from("entries")
        .delete()
        .eq("id", id);

      if (error) {
        console.log(error);
        toast("Löschen fehlgeschlagen");
        return;
      }

      await loadEntries();
    }
