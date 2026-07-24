    async function loadEntries() {
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
      renderAll();
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

      resetForm();
      await loadEntries();
      showSaveReward(buildSaveReward(savedEntry, { merged: wasMerged, editing: wasEditing }));
      showTab("eintraege", document.querySelectorAll(".tab")[2]);
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

