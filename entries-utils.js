    function mergeField(existingValue, newValue, label) {
      const oldVal = Number(existingValue) || 0;
      const newVal = Number(newValue) || 0;

      if (newVal === 0) return oldVal;
      if (oldVal === 0) return newVal;

      const choice = confirm(
        `${label} gibt es an diesem Tag schon:

Vorhanden: ${oldVal}
Neu: ${newVal}

OK = neuen Wert übernehmen
Abbrechen = vorhandenen Wert behalten`
      );

      return choice ? newVal : oldVal;
    }

    function mergeEntries(existing, incoming) {
      return {
        date: existing.date,
        person: existing.person,
        steps: mergeField(existing.steps, incoming.steps, "Schritte"),
        bike: mergeField(existing.bike, incoming.bike, "Fahrrad-km"),
        squats: mergeField(existing.squats, incoming.squats, "Kniebeugen"),
        pushups: mergeField(existing.pushups, incoming.pushups, "Liegestütze"),
        exercise: existing.exercise || incoming.exercise
      };
    }

