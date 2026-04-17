import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Bike, Footprints, Flame, Dumbbell, CalendarDays, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const PEOPLE = ["Thorsten", "Basti", "Marian", "Fabi"];
const STORAGE_KEY = "wurstrand-fitness-app-v2";
const SQUAT_POINTS_UNIT = 5;
const PUSHUP_POINTS_UNIT = 3;

const MONTHLY_GOALS = {
  "2026-02": { title: "Fit Februar", target: 650, type: "steps" },
  "2026-03": { title: "Mächtiger März", target: 1600, type: "points" },
  "2026-04": { title: "Aktiver April", target: 1600, type: "points" },
  "2026-05": { title: "Mission Mai", target: 1800, type: "points" },
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function monthKeyFromDate(dateString) {
  return String(dateString || "").slice(0, 7);
}

function monthLabel(monthKey) {
  if (!monthKey) return "-";
  const [year, month] = monthKey.split("-");
  const names = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${names[Number(month) - 1] || month}.${year}`;
}

function monthMotivation(progress) {
  if (progress >= 100) return "👑 Monatsziel geknackt. Starkes Ding.";
  if (progress >= 85) return "🚀 Endspurt. Das Ziel ist greifbar nah.";
  if (progress >= 60) return "🔥 Ihr seid richtig unterwegs.";
  if (progress >= 35) return "🙂 Solide Basis. Jetzt weiter einsammeln.";
  return "⚡ Monat läuft – aber da geht noch einiges.";
}

const INITIAL_ENTRIES = [{"date": "2026-02-01", "person": "Thorsten", "steps": 5236, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-1", "points": 5.24}, {"date": "2026-02-01", "person": "Basti", "steps": 4200, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-2", "points": 4.2}, {"date": "2026-02-01", "person": "Fabi", "steps": 5192, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-3", "points": 5.19}, {"date": "2026-02-02", "person": "Thorsten", "steps": 4886, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-4", "points": 4.89}, {"date": "2026-02-02", "person": "Basti", "steps": 4180, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-5", "points": 4.18}, {"date": "2026-02-02", "person": "Fabi", "steps": 3213, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-6", "points": 3.21}, {"date": "2026-02-03", "person": "Thorsten", "steps": 10207, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-7", "points": 10.21}, {"date": "2026-02-03", "person": "Basti", "steps": 3257, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-8", "points": 3.26}, {"date": "2026-02-03", "person": "Fabi", "steps": 5291, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-9", "points": 5.29}, {"date": "2026-02-04", "person": "Thorsten", "steps": 4886, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-10", "points": 4.89}, {"date": "2026-02-04", "person": "Basti", "steps": 8662, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-11", "points": 8.66}, {"date": "2026-02-04", "person": "Marian", "steps": 7538, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-12", "points": 7.54}, {"date": "2026-02-04", "person": "Fabi", "steps": 5916, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-13", "points": 5.92}, {"date": "2026-02-05", "person": "Thorsten", "steps": 8324, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-14", "points": 8.32}, {"date": "2026-02-05", "person": "Basti", "steps": 12097, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-15", "points": 12.1}, {"date": "2026-02-05", "person": "Marian", "steps": 10880, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-16", "points": 10.88}, {"date": "2026-02-05", "person": "Fabi", "steps": 8075, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-17", "points": 8.07}, {"date": "2026-02-06", "person": "Thorsten", "steps": 6101, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-18", "points": 6.1}, {"date": "2026-02-06", "person": "Basti", "steps": 11476, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-19", "points": 11.48}, {"date": "2026-02-06", "person": "Marian", "steps": 2779, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-20", "points": 2.78}, {"date": "2026-02-06", "person": "Fabi", "steps": 12155, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-21", "points": 12.15}, {"date": "2026-02-07", "person": "Thorsten", "steps": 2897, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-22", "points": 2.9}, {"date": "2026-02-07", "person": "Basti", "steps": 10888, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-23", "points": 10.89}, {"date": "2026-02-07", "person": "Marian", "steps": 1287, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-24", "points": 1.29}, {"date": "2026-02-07", "person": "Fabi", "steps": 17307, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-25", "points": 17.31}, {"date": "2026-02-08", "person": "Thorsten", "steps": 10498, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-26", "points": 10.5}, {"date": "2026-02-08", "person": "Basti", "steps": 6683, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-27", "points": 6.68}, {"date": "2026-02-08", "person": "Marian", "steps": 12945, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-28", "points": 12.95}, {"date": "2026-02-08", "person": "Fabi", "steps": 7472, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-29", "points": 7.47}, {"date": "2026-02-09", "person": "Thorsten", "steps": 12676, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-30", "points": 12.68}, {"date": "2026-02-09", "person": "Basti", "steps": 7068, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-31", "points": 7.07}, {"date": "2026-02-09", "person": "Marian", "steps": 7409, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-32", "points": 7.41}, {"date": "2026-02-09", "person": "Fabi", "steps": 12136, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-33", "points": 12.14}, {"date": "2026-02-10", "person": "Thorsten", "steps": 15772, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-34", "points": 15.77}, {"date": "2026-02-10", "person": "Basti", "steps": 6978, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-35", "points": 6.98}, {"date": "2026-02-10", "person": "Marian", "steps": 9132, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-36", "points": 9.13}, {"date": "2026-02-10", "person": "Fabi", "steps": 9964, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-37", "points": 9.96}, {"date": "2026-02-11", "person": "Thorsten", "steps": 8934, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-38", "points": 8.93}, {"date": "2026-02-11", "person": "Basti", "steps": 13067, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-39", "points": 13.07}, {"date": "2026-02-11", "person": "Marian", "steps": 13415, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-40", "points": 13.41}, {"date": "2026-02-11", "person": "Fabi", "steps": 12110, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-41", "points": 12.11}, {"date": "2026-02-12", "person": "Thorsten", "steps": 9353, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-42", "points": 9.35}, {"date": "2026-02-12", "person": "Basti", "steps": 7295, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-43", "points": 7.29}, {"date": "2026-02-12", "person": "Marian", "steps": 2432, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-44", "points": 2.43}, {"date": "2026-02-12", "person": "Fabi", "steps": 11685, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-45", "points": 11.69}, {"date": "2026-02-13", "person": "Thorsten", "steps": 14720, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-46", "points": 14.72}, {"date": "2026-02-13", "person": "Basti", "steps": 9424, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-47", "points": 9.42}, {"date": "2026-02-13", "person": "Marian", "steps": 3361, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-48", "points": 3.36}, {"date": "2026-02-13", "person": "Fabi", "steps": 10397, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-49", "points": 10.4}, {"date": "2026-02-14", "person": "Thorsten", "steps": 5179, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-50", "points": 5.18}, {"date": "2026-02-14", "person": "Basti", "steps": 6728, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-51", "points": 6.73}, {"date": "2026-02-14", "person": "Marian", "steps": 5491, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-52", "points": 5.49}, {"date": "2026-02-14", "person": "Fabi", "steps": 9319, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-53", "points": 9.32}, {"date": "2026-02-15", "person": "Thorsten", "steps": 3223, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-54", "points": 3.22}, {"date": "2026-02-15", "person": "Basti", "steps": 7766, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-55", "points": 7.77}, {"date": "2026-02-15", "person": "Marian", "steps": 80, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-56", "points": 0.08}, {"date": "2026-02-15", "person": "Fabi", "steps": 12624, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-57", "points": 12.62}, {"date": "2026-02-16", "person": "Thorsten", "steps": 11323, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-58", "points": 11.32}, {"date": "2026-02-16", "person": "Basti", "steps": 9610, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-59", "points": 9.61}, {"date": "2026-02-16", "person": "Marian", "steps": 450, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-60", "points": 0.45}, {"date": "2026-02-16", "person": "Fabi", "steps": 10368, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-61", "points": 10.37}, {"date": "2026-02-17", "person": "Thorsten", "steps": 14038, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-62", "points": 14.04}, {"date": "2026-02-17", "person": "Basti", "steps": 9925, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-63", "points": 9.93}, {"date": "2026-02-17", "person": "Marian", "steps": 2464, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-64", "points": 2.46}, {"date": "2026-02-17", "person": "Fabi", "steps": 11157, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-65", "points": 11.16}, {"date": "2026-02-18", "person": "Thorsten", "steps": 7666, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-66", "points": 7.67}, {"date": "2026-02-18", "person": "Basti", "steps": 9274, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-67", "points": 9.27}, {"date": "2026-02-18", "person": "Marian", "steps": 6194, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-68", "points": 6.19}, {"date": "2026-02-18", "person": "Fabi", "steps": 11369, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-69", "points": 11.37}, {"date": "2026-02-19", "person": "Thorsten", "steps": 11409, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-70", "points": 11.41}, {"date": "2026-02-19", "person": "Basti", "steps": 7862, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-71", "points": 7.86}, {"date": "2026-02-19", "person": "Marian", "steps": 3040, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-72", "points": 3.04}, {"date": "2026-02-19", "person": "Fabi", "steps": 8049, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-73", "points": 8.05}, {"date": "2026-02-20", "person": "Thorsten", "steps": 8442, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-74", "points": 8.44}, {"date": "2026-02-20", "person": "Basti", "steps": 6582, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-75", "points": 6.58}, {"date": "2026-02-20", "person": "Marian", "steps": 3040, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-76", "points": 3.04}, {"date": "2026-02-20", "person": "Fabi", "steps": 8635, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-77", "points": 8.63}, {"date": "2026-02-21", "person": "Thorsten", "steps": 26996, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-78", "points": 27}, {"date": "2026-02-21", "person": "Basti", "steps": 6897, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-79", "points": 6.9}, {"date": "2026-02-21", "person": "Marian", "steps": 8566, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-80", "points": 8.57}, {"date": "2026-02-21", "person": "Fabi", "steps": 4720, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-81", "points": 4.72}, {"date": "2026-02-22", "person": "Thorsten", "steps": 5230, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-82", "points": 5.23}, {"date": "2026-02-22", "person": "Basti", "steps": 8212, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-83", "points": 8.21}, {"date": "2026-02-22", "person": "Marian", "steps": 1137, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-84", "points": 1.14}, {"date": "2026-02-22", "person": "Fabi", "steps": 5477, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-85", "points": 5.48}, {"date": "2026-02-23", "person": "Thorsten", "steps": 11552, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-86", "points": 11.55}, {"date": "2026-02-23", "person": "Basti", "steps": 12388, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-87", "points": 12.39}, {"date": "2026-02-23", "person": "Marian", "steps": 3573, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-88", "points": 3.57}, {"date": "2026-02-23", "person": "Fabi", "steps": 6406, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-89", "points": 6.41}, {"date": "2026-02-24", "person": "Thorsten", "steps": 3725, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-90", "points": 3.73}, {"date": "2026-02-24", "person": "Basti", "steps": 11813, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-91", "points": 11.81}, {"date": "2026-02-24", "person": "Marian", "steps": 4913, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-92", "points": 4.91}, {"date": "2026-02-24", "person": "Fabi", "steps": 5415, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-93", "points": 5.42}, {"date": "2026-02-25", "person": "Thorsten", "steps": 11050, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-94", "points": 11.05}, {"date": "2026-02-25", "person": "Basti", "steps": 15302, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-95", "points": 15.3}, {"date": "2026-02-25", "person": "Marian", "steps": 5344, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-96", "points": 5.34}, {"date": "2026-02-25", "person": "Fabi", "steps": 5227, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-97", "points": 5.23}, {"date": "2026-02-26", "person": "Thorsten", "steps": 12056, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-98", "points": 12.06}, {"date": "2026-02-26", "person": "Basti", "steps": 15949, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-99", "points": 15.95}, {"date": "2026-02-26", "person": "Marian", "steps": 2964, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-100", "points": 2.96}, {"date": "2026-02-26", "person": "Fabi", "steps": 5582, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-101", "points": 5.58}, {"date": "2026-02-27", "person": "Thorsten", "steps": 3774, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-102", "points": 3.77}, {"date": "2026-02-27", "person": "Basti", "steps": 14723, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-103", "points": 14.72}, {"date": "2026-02-27", "person": "Marian", "steps": 2475, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-104", "points": 2.48}, {"date": "2026-02-27", "person": "Fabi", "steps": 7724, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-105", "points": 7.72}, {"date": "2026-02-28", "person": "Thorsten", "steps": 10849, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-106", "points": 10.85}, {"date": "2026-02-28", "person": "Basti", "steps": 9378, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-107", "points": 9.38}, {"date": "2026-02-28", "person": "Marian", "steps": 2879, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-108", "points": 2.88}, {"date": "2026-02-28", "person": "Fabi", "steps": 7886, "bikeKm": 0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-109", "points": 7.89}, {"date": "2026-03-01", "person": "Thorsten", "steps": 3303, "bikeKm": 2.5, "squats": 10, "pushups": 0, "bonus": false, "exercise": true, "id": "import-110", "points": 7.8}, {"date": "2026-03-01", "person": "Basti", "steps": 12687, "bikeKm": 0.0, "squats": 20, "pushups": 0, "bonus": false, "exercise": true, "id": "import-111", "points": 16.69}, {"date": "2026-03-01", "person": "Marian", "steps": 6916, "bikeKm": 27.4, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-112", "points": 34.32}, {"date": "2026-03-01", "person": "Fabi", "steps": 2658, "bikeKm": 12.46, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-113", "points": 15.12}, {"date": "2026-03-02", "person": "Thorsten", "steps": 11016, "bikeKm": 13.5, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-114", "points": 30.52}, {"date": "2026-03-02", "person": "Basti", "steps": 14697, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-115", "points": 14.7}, {"date": "2026-03-02", "person": "Marian", "steps": 6537, "bikeKm": 31.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-116", "points": 37.74}, {"date": "2026-03-02", "person": "Fabi", "steps": 9476, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-117", "points": 9.48}, {"date": "2026-03-03", "person": "Thorsten", "steps": 7288, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-118", "points": 7.29}, {"date": "2026-03-03", "person": "Basti", "steps": 9425, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-119", "points": 9.43}, {"date": "2026-03-03", "person": "Marian", "steps": 8067, "bikeKm": 10.5, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-120", "points": 18.57}, {"date": "2026-03-03", "person": "Fabi", "steps": 8170, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-121", "points": 8.17}, {"date": "2026-03-04", "person": "Thorsten", "steps": 7767, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-122", "points": 13.77}, {"date": "2026-03-04", "person": "Basti", "steps": 5920, "bikeKm": 0.0, "squats": 10, "pushups": 0, "bonus": false, "exercise": true, "id": "import-123", "points": 7.92}, {"date": "2026-03-04", "person": "Marian", "steps": 6549, "bikeKm": 8.4, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-124", "points": 14.95}, {"date": "2026-03-04", "person": "Fabi", "steps": 2183, "bikeKm": 3.16, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-125", "points": 5.34}, {"date": "2026-03-05", "person": "Thorsten", "steps": 2251, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-126", "points": 8.25}, {"date": "2026-03-05", "person": "Basti", "steps": 10061, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-127", "points": 10.06}, {"date": "2026-03-05", "person": "Marian", "steps": 3584, "bikeKm": 28.6, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-128", "points": 32.18}, {"date": "2026-03-05", "person": "Fabi", "steps": 10552, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-129", "points": 10.55}, {"date": "2026-03-06", "person": "Thorsten", "steps": 13302, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-130", "points": 19.3}, {"date": "2026-03-06", "person": "Basti", "steps": 9064, "bikeKm": 0.0, "squats": 10, "pushups": 0, "bonus": false, "exercise": true, "id": "import-131", "points": 11.06}, {"date": "2026-03-06", "person": "Marian", "steps": 6961, "bikeKm": 18.6, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-132", "points": 25.56}, {"date": "2026-03-06", "person": "Fabi", "steps": 14776, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-133", "points": 14.78}, {"date": "2026-03-07", "person": "Thorsten", "steps": 10693, "bikeKm": 2.5, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-134", "points": 13.19}, {"date": "2026-03-07", "person": "Basti", "steps": 3613, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-135", "points": 3.61}, {"date": "2026-03-07", "person": "Marian", "steps": 10874, "bikeKm": 5.8, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-136", "points": 16.67}, {"date": "2026-03-07", "person": "Fabi", "steps": 9316, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-137", "points": 9.32}, {"date": "2026-03-08", "person": "Thorsten", "steps": 7853, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-138", "points": 7.85}, {"date": "2026-03-08", "person": "Basti", "steps": 5588, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-139", "points": 5.59}, {"date": "2026-03-08", "person": "Marian", "steps": 11147, "bikeKm": 19.6, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-140", "points": 30.75}, {"date": "2026-03-08", "person": "Fabi", "steps": 12924, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-141", "points": 12.92}, {"date": "2026-03-09", "person": "Thorsten", "steps": 9330, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-142", "points": 15.33}, {"date": "2026-03-09", "person": "Basti", "steps": 8537, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-143", "points": 8.54}, {"date": "2026-03-09", "person": "Marian", "steps": 5815, "bikeKm": 9.7, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-144", "points": 15.51}, {"date": "2026-03-09", "person": "Fabi", "steps": 7439, "bikeKm": 3.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-145", "points": 10.44}, {"date": "2026-03-10", "person": "Thorsten", "steps": 5960, "bikeKm": 26.3, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-146", "points": 32.26}, {"date": "2026-03-10", "person": "Basti", "steps": 10125, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-147", "points": 10.12}, {"date": "2026-03-10", "person": "Marian", "steps": 5543, "bikeKm": 32.9, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-148", "points": 38.44}, {"date": "2026-03-10", "person": "Fabi", "steps": 2411, "bikeKm": 3.1, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-149", "points": 5.51}, {"date": "2026-03-11", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-150", "points": 0}, {"date": "2026-03-11", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-151", "points": 0}, {"date": "2026-03-11", "person": "Marian", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-152", "points": 0}, {"date": "2026-03-11", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-153", "points": 0}, {"date": "2026-03-12", "person": "Thorsten", "steps": 13498, "bikeKm": 0.0, "squats": 10, "pushups": 0, "bonus": false, "exercise": true, "id": "import-154", "points": 15.5}, {"date": "2026-03-12", "person": "Basti", "steps": 4707, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-155", "points": 4.71}, {"date": "2026-03-12", "person": "Marian", "steps": 14154, "bikeKm": 11.9, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-156", "points": 32.05}, {"date": "2026-03-12", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-157", "points": 0}, {"date": "2026-03-13", "person": "Thorsten", "steps": 4009, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-158", "points": 10.01}, {"date": "2026-03-13", "person": "Basti", "steps": 8581, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-159", "points": 8.58}, {"date": "2026-03-13", "person": "Marian", "steps": 8897, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-160", "points": 8.9}, {"date": "2026-03-13", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-161", "points": 0}, {"date": "2026-03-14", "person": "Thorsten", "steps": 7742, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-162", "points": 7.74}, {"date": "2026-03-14", "person": "Basti", "steps": 9568, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-163", "points": 9.57}, {"date": "2026-03-14", "person": "Marian", "steps": 8053, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-164", "points": 8.05}, {"date": "2026-03-14", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-165", "points": 0}, {"date": "2026-03-15", "person": "Thorsten", "steps": 11946, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-166", "points": 11.95}, {"date": "2026-03-15", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-167", "points": 0}, {"date": "2026-03-15", "person": "Marian", "steps": 3856, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-168", "points": 3.86}, {"date": "2026-03-15", "person": "Fabi", "steps": 7623, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-169", "points": 7.62}, {"date": "2026-03-16", "person": "Thorsten", "steps": 10196, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-170", "points": 10.2}, {"date": "2026-03-16", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-171", "points": 0}, {"date": "2026-03-16", "person": "Marian", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-172", "points": 0}, {"date": "2026-03-16", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-173", "points": 0}, {"date": "2026-03-17", "person": "Thorsten", "steps": 6701, "bikeKm": 0.0, "squats": 10, "pushups": 0, "bonus": false, "exercise": true, "id": "import-174", "points": 8.7}, {"date": "2026-03-17", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-175", "points": 0}, {"date": "2026-03-17", "person": "Marian", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-176", "points": 0}, {"date": "2026-03-17", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-177", "points": 0}, {"date": "2026-03-18", "person": "Thorsten", "steps": 10754, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-178", "points": 16.75}, {"date": "2026-03-18", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-179", "points": 0}, {"date": "2026-03-18", "person": "Marian", "steps": 13991, "bikeKm": 18.9, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-180", "points": 32.89}, {"date": "2026-03-18", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-181", "points": 0}, {"date": "2026-03-19", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-182", "points": 0}, {"date": "2026-03-19", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-183", "points": 0}, {"date": "2026-03-19", "person": "Marian", "steps": 11118, "bikeKm": 0.0, "squats": 10, "pushups": 0, "bonus": false, "exercise": true, "id": "import-184", "points": 13.12}, {"date": "2026-03-19", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-185", "points": 0}, {"date": "2026-03-20", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-186", "points": 0}, {"date": "2026-03-20", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-187", "points": 0}, {"date": "2026-03-20", "person": "Marian", "steps": 8757, "bikeKm": 7.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-188", "points": 15.76}, {"date": "2026-03-20", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-189", "points": 0}, {"date": "2026-03-21", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-190", "points": 0}, {"date": "2026-03-21", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-191", "points": 0}, {"date": "2026-03-21", "person": "Marian", "steps": 10927, "bikeKm": 6.6, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-192", "points": 17.53}, {"date": "2026-03-21", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-193", "points": 0}, {"date": "2026-03-22", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-194", "points": 0}, {"date": "2026-03-22", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-195", "points": 0}, {"date": "2026-03-22", "person": "Marian", "steps": 6739, "bikeKm": 8.1, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-196", "points": 14.84}, {"date": "2026-03-22", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-197", "points": 0}, {"date": "2026-03-23", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-198", "points": 0}, {"date": "2026-03-23", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-199", "points": 0}, {"date": "2026-03-23", "person": "Marian", "steps": 0, "bikeKm": 7.5, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-200", "points": 7.5}, {"date": "2026-03-23", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-201", "points": 0}, {"date": "2026-03-24", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-202", "points": 0}, {"date": "2026-03-24", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-203", "points": 0}, {"date": "2026-03-24", "person": "Marian", "steps": 0, "bikeKm": 4.8, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-204", "points": 4.8}, {"date": "2026-03-24", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-205", "points": 0}, {"date": "2026-03-25", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-206", "points": 0}, {"date": "2026-03-25", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-207", "points": 0}, {"date": "2026-03-25", "person": "Marian", "steps": 0, "bikeKm": 5.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-208", "points": 5.2}, {"date": "2026-03-25", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-209", "points": 0}, {"date": "2026-03-26", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-210", "points": 0}, {"date": "2026-03-26", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-211", "points": 0}, {"date": "2026-03-26", "person": "Marian", "steps": 0, "bikeKm": 5.4, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-212", "points": 5.4}, {"date": "2026-03-26", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-213", "points": 0}, {"date": "2026-03-27", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-214", "points": 0}, {"date": "2026-03-27", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-215", "points": 0}, {"date": "2026-03-27", "person": "Marian", "steps": 0, "bikeKm": 7.9, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-216", "points": 7.9}, {"date": "2026-03-27", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-217", "points": 0}, {"date": "2026-03-28", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-218", "points": 0}, {"date": "2026-03-28", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-219", "points": 0}, {"date": "2026-03-28", "person": "Marian", "steps": 0, "bikeKm": 28.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-220", "points": 28.2}, {"date": "2026-03-28", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-221", "points": 0}, {"date": "2026-03-29", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-222", "points": 0}, {"date": "2026-03-29", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-223", "points": 0}, {"date": "2026-03-29", "person": "Marian", "steps": 0, "bikeKm": 24.3, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-224", "points": 24.3}, {"date": "2026-03-29", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-225", "points": 0}, {"date": "2026-03-30", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-226", "points": 0}, {"date": "2026-03-30", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-227", "points": 0}, {"date": "2026-03-30", "person": "Marian", "steps": 0, "bikeKm": 13.3, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-228", "points": 13.3}, {"date": "2026-03-30", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-229", "points": 0}, {"date": "2026-03-31", "person": "Thorsten", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-230", "points": 0}, {"date": "2026-03-31", "person": "Basti", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-231", "points": 0}, {"date": "2026-03-31", "person": "Marian", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-232", "points": 0}, {"date": "2026-03-31", "person": "Fabi", "steps": 0, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-233", "points": 0}, {"date": "2026-04-01", "person": "Thorsten", "steps": 10595, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-234", "points": 10.6}, {"date": "2026-04-01", "person": "Basti", "steps": 10704, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-235", "points": 10.7}, {"date": "2026-04-01", "person": "Marian", "steps": 9089, "bikeKm": 7.6, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-236", "points": 16.69}, {"date": "2026-04-01", "person": "Fabi", "steps": 2368, "bikeKm": 5.04, "squats": 0, "pushups": 0, "bonus": true, "exercise": true, "id": "import-237", "points": 11.41}, {"date": "2026-04-02", "person": "Thorsten", "steps": 8939, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": false, "exercise": true, "id": "import-238", "points": 14.94}, {"date": "2026-04-02", "person": "Basti", "steps": 11134, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-239", "points": 11.13}, {"date": "2026-04-02", "person": "Marian", "steps": 3088, "bikeKm": 7.8, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-240", "points": 10.89}, {"date": "2026-04-02", "person": "Fabi", "steps": 8374, "bikeKm": 1.55, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-241", "points": 9.92}, {"date": "2026-04-03", "person": "Thorsten", "steps": 4757, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-242", "points": 4.76}, {"date": "2026-04-03", "person": "Basti", "steps": 10167, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-243", "points": 10.17}, {"date": "2026-04-03", "person": "Marian", "steps": 4563, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-244", "points": 4.56}, {"date": "2026-04-03", "person": "Fabi", "steps": 9220, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-245", "points": 9.22}, {"date": "2026-04-04", "person": "Thorsten", "steps": 11620, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": true, "exercise": true, "id": "import-246", "points": 21.62}, {"date": "2026-04-04", "person": "Basti", "steps": 12195, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-247", "points": 12.2}, {"date": "2026-04-04", "person": "Marian", "steps": 2450, "bikeKm": 23.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-248", "points": 25.65}, {"date": "2026-04-04", "person": "Fabi", "steps": 10659, "bikeKm": 0.0, "squats": 10, "pushups": 0, "bonus": true, "exercise": true, "id": "import-249", "points": 16.66}, {"date": "2026-04-05", "person": "Thorsten", "steps": 13435, "bikeKm": 4.54, "squats": 30, "pushups": 0, "bonus": true, "exercise": true, "id": "import-250", "points": 27.98}, {"date": "2026-04-05", "person": "Basti", "steps": 8719, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-251", "points": 8.72}, {"date": "2026-04-05", "person": "Marian", "steps": 2742, "bikeKm": 22.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-252", "points": 24.74}, {"date": "2026-04-05", "person": "Fabi", "steps": 11037, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-253", "points": 11.04}, {"date": "2026-04-06", "person": "Thorsten", "steps": 8862, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-254", "points": 8.86}, {"date": "2026-04-06", "person": "Basti", "steps": 2235, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-255", "points": 2.23}, {"date": "2026-04-06", "person": "Marian", "steps": 2308, "bikeKm": 11.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-256", "points": 13.51}, {"date": "2026-04-06", "person": "Fabi", "steps": 8771, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-257", "points": 8.77}, {"date": "2026-04-07", "person": "Thorsten", "steps": 6421, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": true, "exercise": true, "id": "import-258", "points": 16.42}, {"date": "2026-04-07", "person": "Basti", "steps": 7384, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-259", "points": 7.38}, {"date": "2026-04-07", "person": "Marian", "steps": 3112, "bikeKm": 51.1, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-260", "points": 54.21}, {"date": "2026-04-07", "person": "Fabi", "steps": 16626, "bikeKm": 2.4, "squats": 0, "pushups": 0, "bonus": true, "exercise": true, "id": "import-261", "points": 23.03}, {"date": "2026-04-08", "person": "Thorsten", "steps": 9621, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-262", "points": 9.62}, {"date": "2026-04-08", "person": "Basti", "steps": 13078, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-263", "points": 13.08}, {"date": "2026-04-08", "person": "Marian", "steps": 7883, "bikeKm": 9.7, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-264", "points": 17.58}, {"date": "2026-04-08", "person": "Fabi", "steps": 6280, "bikeKm": 5.8, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-265", "points": 12.08}, {"date": "2026-04-09", "person": "Thorsten", "steps": 5809, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": true, "exercise": true, "id": "import-266", "points": 15.81}, {"date": "2026-04-09", "person": "Basti", "steps": 8941, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-267", "points": 8.94}, {"date": "2026-04-09", "person": "Marian", "steps": 4319, "bikeKm": 32.4, "squats": 3, "pushups": 0, "bonus": true, "exercise": true, "id": "import-268", "points": 40.32}, {"date": "2026-04-09", "person": "Fabi", "steps": 12131, "bikeKm": 1.75, "squats": 37, "pushups": 0, "bonus": true, "exercise": true, "id": "import-269", "points": 25.28}, {"date": "2026-04-10", "person": "Thorsten", "steps": 11531, "bikeKm": 0.0, "squats": 30, "pushups": 0, "bonus": true, "exercise": true, "id": "import-270", "points": 21.53}, {"date": "2026-04-10", "person": "Basti", "steps": 3436, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-271", "points": 3.44}, {"date": "2026-04-10", "person": "Marian", "steps": 7860, "bikeKm": 12.3, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-272", "points": 20.16}, {"date": "2026-04-10", "person": "Fabi", "steps": 2072, "bikeKm": 1.8, "squats": 0, "pushups": 0, "bonus": true, "exercise": true, "id": "import-273", "points": 7.87}, {"date": "2026-04-11", "person": "Thorsten", "steps": 8574, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-274", "points": 8.57}, {"date": "2026-04-11", "person": "Basti", "steps": 12156, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-275", "points": 12.16}, {"date": "2026-04-11", "person": "Marian", "steps": 2476, "bikeKm": 4.9, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-276", "points": 7.38}, {"date": "2026-04-11", "person": "Fabi", "steps": 16434, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-277", "points": 16.43}, {"date": "2026-04-12", "person": "Thorsten", "steps": 6442, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-278", "points": 6.44}, {"date": "2026-04-12", "person": "Basti", "steps": 7212, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-279", "points": 7.21}, {"date": "2026-04-12", "person": "Marian", "steps": 10070, "bikeKm": 11.8, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-280", "points": 21.87}, {"date": "2026-04-12", "person": "Fabi", "steps": 5461, "bikeKm": 2.7, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-281", "points": 8.16}, {"date": "2026-04-13", "person": "Thorsten", "steps": 8894, "bikeKm": 0.0, "squats": 5, "pushups": 0, "bonus": false, "exercise": false, "id": "import-282", "points": 9.89}, {"date": "2026-04-13", "person": "Basti", "steps": 7764, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-283", "points": 7.76}, {"date": "2026-04-13", "person": "Marian", "steps": 13568, "bikeKm": 8.2, "squats": 15, "pushups": 0, "bonus": false, "exercise": true, "id": "import-284", "points": 24.77}, {"date": "2026-04-13", "person": "Fabi", "steps": 10142, "bikeKm": 0.0, "squats": 15, "pushups": 0, "bonus": false, "exercise": false, "id": "import-285", "points": 13.14}, {"date": "2026-04-14", "person": "Thorsten", "steps": 3762, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-286", "points": 3.76}, {"date": "2026-04-14", "person": "Basti", "steps": 7626, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-287", "points": 7.63}, {"date": "2026-04-14", "person": "Marian", "steps": 1307, "bikeKm": 9.4, "squats": 0, "pushups": 0, "bonus": false, "exercise": true, "id": "import-288", "points": 10.71}, {"date": "2026-04-14", "person": "Fabi", "steps": 2533, "bikeKm": 3.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-289", "points": 5.73}, {"date": "2026-04-15", "person": "Thorsten", "steps": 3650, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-290", "points": 3.65}, {"date": "2026-04-15", "person": "Basti", "steps": 9458, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-291", "points": 9.46}, {"date": "2026-04-15", "person": "Marian", "steps": 1665, "bikeKm": 12.0, "squats": 20, "pushups": 0, "bonus": true, "exercise": true, "id": "import-292", "points": 21.66}, {"date": "2026-04-15", "person": "Fabi", "steps": 8512, "bikeKm": 5.3, "squats": 0, "pushups": 0, "bonus": true, "exercise": true, "id": "import-293", "points": 17.81}, {"date": "2026-04-16", "person": "Thorsten", "steps": 2323, "bikeKm": 0.0, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-294", "points": 2.32}, {"date": "2026-04-16", "person": "Marian", "steps": 0, "bikeKm": 17.2, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-295", "points": 17.2}, {"date": "2026-04-16", "person": "Fabi", "steps": 2528, "bikeKm": 12.8, "squats": 0, "pushups": 0, "bonus": false, "exercise": false, "id": "import-296", "points": 15.33}];

function pointsFromEntry(entry) {
  const stepPoints = (Number(entry.steps) || 0) / 1000;
  const bikePoints = Number(entry.bikeKm) || 0;
  const bonusPoints = entry.bonus ? 4 : 0;
  const squatPoints = (Number(entry.squats) || 0) / SQUAT_POINTS_UNIT;
  const pushupPoints = (Number(entry.pushups) || 0) / PUSHUP_POINTS_UNIT;
  return stepPoints + bikePoints + bonusPoints + squatPoints + pushupPoints;
}

function App() {
  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [form, setForm] = useState({
    date: todayISO(),
    person: PEOPLE[0],
    steps: "",
    bikeKm: "",
    squats: "",
    pushups: "",
    bonus: false,
    exercise: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setEntries(JSON.parse(raw));
      } else {
        setEntries(INITIAL_ENTRIES);
      }
    } catch (e) {
      console.error("Fehler beim Laden:", e);
      setEntries(INITIAL_ENTRIES);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Fehler beim Speichern:", e);
    }
  }, [entries, selectedMonth]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date) || a.person.localeCompare(b.person)),
    [entries]
  );

  const stats = useMemo(() => {
    const totalSteps = entries.reduce((sum, e) => sum + (Number(e.steps) || 0), 0);
    const totalBikeKm = entries.reduce((sum, e) => sum + (Number(e.bikeKm) || 0), 0);
    const totalBonusPoints = entries.reduce((sum, e) => sum + (e.bonus ? 4 : 0), 0);
    const totalSquats = entries.reduce((sum, e) => sum + (Number(e.squats) || 0), 0);
    const totalPushups = entries.reduce((sum, e) => sum + (Number(e.pushups) || 0), 0);
    const squatPoints = totalSquats / SQUAT_POINTS_UNIT;
    const pushupPoints = totalPushups / PUSHUP_POINTS_UNIT;
    const bonusCount = entries.filter((e) => e.bonus).length;
    const exerciseCount = entries.filter((e) => e.exercise).length;
    const over10kCount = entries.filter((e) => (Number(e.steps) || 0) > 10000).length;
    const avgSteps = entries.length ? totalSteps / entries.length : 0;
    const bikeActiveCount = entries.filter((e) => (Number(e.bikeKm) || 0) > 0).length;
    const avgBikeKm = bikeActiveCount ? totalBikeKm / bikeActiveCount : 0;
    const ratio = totalBikeKm > 0 ? (totalSteps / 1000) / totalBikeKm : 0;
    const stepsPct = totalSteps > 0 || totalBikeKm > 0 ? ((totalSteps / 1000) / ((totalSteps / 1000) + totalBikeKm || 1)) * 100 : 0;
    const bikePct = totalSteps > 0 || totalBikeKm > 0 ? (totalBikeKm / ((totalSteps / 1000) + totalBikeKm || 1)) * 100 : 0;

    const maxStepsEntry = entries.reduce(
      (best, e) => ((Number(e.steps) || 0) > (Number(best?.steps) || 0) ? e : best),
      null
    );
    const maxBikeEntry = entries.reduce(
      (best, e) => ((Number(e.bikeKm) || 0) > (Number(best?.bikeKm) || 0) ? e : best),
      null
    );

    const byDate = Object.values(
      entries.reduce((acc, e) => {
        if (!acc[e.date]) {
          acc[e.date] = {
            date: e.date,
            steps: 0,
            bikeKm: 0,
            bonusPoints: 0,
            exerciseCount: 0,
            squats: 0,
            pushups: 0,
          };
        }
        acc[e.date].steps += Number(e.steps) || 0;
        acc[e.date].bikeKm += Number(e.bikeKm) || 0;
        acc[e.date].bonusPoints += e.bonus ? 4 : 0;
        acc[e.date].exerciseCount += e.exercise ? 1 : 0;
        acc[e.date].squats += Number(e.squats) || 0;
        acc[e.date].pushups += Number(e.pushups) || 0;
        return acc;
      }, {})
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    const pointsBreakdown = [
      { name: "Schritte-Punkte", value: Number((totalSteps / 1000).toFixed(2)) },
      { name: "Rad-Punkte", value: Number(totalBikeKm.toFixed(2)) },
      { name: "Kniebeugen-Punkte", value: Number(squatPoints.toFixed(2)) },
      { name: "Liegestütz-Punkte", value: Number(pushupPoints.toFixed(2)) },
      { name: "Bonus", value: totalBonusPoints },
    ];

    const availableMonths = [...new Set(entries.map((e) => monthKeyFromDate(e.date)).filter(Boolean))].sort();
    const monthEntries = entries.filter((e) => monthKeyFromDate(e.date) === selectedMonth);
    const monthSteps = monthEntries.reduce((sum, e) => sum + (Number(e.steps) || 0), 0);
    const monthBikeKm = monthEntries.reduce((sum, e) => sum + (Number(e.bikeKm) || 0), 0);
    const monthBonusPoints = monthEntries.reduce((sum, e) => sum + (e.bonus ? 4 : 0), 0);
    const monthSquatPoints = monthEntries.reduce((sum, e) => sum + (Number(e.squats) || 0), 0) / SQUAT_POINTS_UNIT;
    const monthPushupPoints = monthEntries.reduce((sum, e) => sum + (Number(e.pushups) || 0), 0) / PUSHUP_POINTS_UNIT;
    const monthPoints = monthSteps / 1000 + monthBikeKm + monthSquatPoints + monthPushupPoints + monthBonusPoints;
    const currentGoal = MONTHLY_GOALS[selectedMonth] || null;
    const goalValue = currentGoal?.type === "steps" ? monthSteps / 1000 : monthPoints;
    const progress = currentGoal?.target ? Math.min((goalValue / currentGoal.target) * 100, 100) : 0;

    return {
      totalSteps,
      totalBikeKm,
      totalBonusPoints,
      totalSquats,
      totalPushups,
      squatPoints,
      pushupPoints,
      bonusCount,
      exerciseCount,
      over10kCount,
      avgSteps,
      avgBikeKm,
      ratio,
      stepsPct,
      bikePct,
      maxStepsEntry,
      maxBikeEntry,
      byDate,
      pointsBreakdown,
      availableMonths,
      monthSteps,
      monthBikeKm,
      monthBonusPoints,
      monthSquatPoints,
      monthPushupPoints,
      monthPoints,
      currentGoal,
      goalValue,
      progress,
    };
  }, [entries]);

  function addEntry() {
    if (!form.date || !form.person) return;

    const newEntry = {
      id: crypto.randomUUID(),
      date: form.date,
      person: form.person,
      steps: Number(form.steps) || 0,
      bikeKm: Number(form.bikeKm) || 0,
      squats: Number(form.squats) || 0,
      pushups: Number(form.pushups) || 0,
      bonus: !!form.bonus,
      exercise: !!form.exercise,
      points: pointsFromEntry(form),
    };

    setEntries((prev) => [...prev, newEntry]);
    setForm((prev) => ({
      ...prev,
      steps: "",
      bikeKm: "",
      squats: "",
      pushups: "",
      bonus: false,
      exercise: false,
    }));
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearAll() {
    if (window.confirm("Wirklich alle Einträge löschen?")) {
      setEntries([]);
    }
  }

  const pieColors = ["#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#f59e0b"];

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Wurstrand Challenge</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Teamfokus statt Wettbewerb: Eintragen, auswerten, Fortschritt sehen.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              {entries.length} Einträge gespeichert
            </div>
          </div>
        </div>

        <Card className="rounded-3xl border-0 bg-gradient-to-r from-zinc-900 to-zinc-700 text-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                  Monats-Challenge
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{stats.currentGoal?.title || monthLabel(selectedMonth)}</h2>
                  <p className="mt-1 text-sm text-white/80">{monthMotivation(stats.progress)}</p>
                </div>
              </div>

              <div className="w-full max-w-sm space-y-2">
                <Label className="text-white">Monat</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Monat wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {stats.availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {MONTHLY_GOALS[month]?.title || monthLabel(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <GoalMiniCard label="Ziel" value={stats.currentGoal ? `${formatDecimal(stats.currentGoal.target, 0)} ${stats.currentGoal.type === "steps" ? "Schritte-Punkte" : "Punkte"}` : "-"} />
              <GoalMiniCard label="Aktuell" value={stats.currentGoal ? formatDecimal(stats.goalValue, 2) : formatDecimal(stats.monthPoints, 2)} />
              <GoalMiniCard label="Fortschritt" value={stats.currentGoal ? `${Math.round(stats.progress)}%` : "-"} />
              <GoalMiniCard label="Rest" value={stats.currentGoal ? formatDecimal(Math.max(stats.currentGoal.target - stats.goalValue, 0), 2) : "-"} />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-white/85">
                <span>Fortschrittsbalken</span>
                <span>{stats.currentGoal ? `${formatDecimal(stats.goalValue, 2)} / ${formatDecimal(stats.currentGoal.target, 0)}` : "Kein Ziel hinterlegt"}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${stats.currentGoal ? Math.min(stats.progress, 100) : 0}%` }} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
              <MonthStat label="Schritte-Punkte" value={formatDecimal(stats.monthSteps / 1000, 2)} />
              <MonthStat label="Rad-Punkte" value={formatDecimal(stats.monthBikeKm, 2)} />
              <MonthStat label="Kraft-Punkte" value={formatDecimal(stats.monthSquatPoints + stats.monthPushupPoints, 2)} />
              <MonthStat label="Bonus" value={formatDecimal(stats.monthBonusPoints, 0)} />
              <MonthStat label="Monat gesamt" value={formatDecimal(stats.monthPoints, 2)} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-zinc-200">
            <TabsTrigger value="dashboard" className="rounded-xl">Dashboard</TabsTrigger>
            <TabsTrigger value="eintragen" className="rounded-xl">Eintragen</TabsTrigger>
            <TabsTrigger value="liste" className="rounded-xl">Einträge</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Gesamt Schritte" value={formatNumber(stats.totalSteps)} icon={<Footprints className="h-5 w-5" />} />
              <StatCard title="Gesamt Fahrrad-KM" value={formatDecimal(stats.totalBikeKm, 2)} icon={<Bike className="h-5 w-5" />} />
              <StatCard title="Bonuspunkte" value={String(stats.totalBonusPoints)} icon={<Flame className="h-5 w-5" />} />
              <StatCard title="Kniebeugen / Liegestütze" value={`${formatNumber(stats.totalSquats)} / ${formatNumber(stats.totalPushups)}`} icon={<Dumbbell className="h-5 w-5" />} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>Team-Statistiken</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <Row label="Wie oft über 10.000 Schritte" value={String(stats.over10kCount)} />
                  <Row label="Ø Schritte pro Eintrag" value={formatNumber(Math.round(stats.avgSteps))} />
                  <Row label="Ø Rad-KM pro aktivem Eintrag" value={formatDecimal(stats.avgBikeKm, 2)} />
                  <Row label="Bonustreffer" value={String(stats.bonusCount)} />
                  <Row label="Kniebeugen gesamt" value={formatNumber(stats.totalSquats)} />
                  <Row label="Liegestütze gesamt" value={formatNumber(stats.totalPushups)} />
                  <Row label="Kniebeugen-Punkte" value={formatDecimal(stats.squatPoints, 2)} />
                  <Row label="Liegestütz-Punkte" value={formatDecimal(stats.pushupPoints, 2)} />
                  <Row label="Verhältnis Schritte : Rad" value={stats.totalBikeKm > 0 ? `${formatDecimal(stats.ratio, 2)} : 1` : "-"} />
                  <Row label="Anteil Schritte / Rad" value={stats.totalBikeKm > 0 ? `${Math.round(stats.stepsPct)}% / ${Math.round(stats.bikePct)}%` : "-"} />
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>Rekorde</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <Row
                    label="Meiste Schritte an einem Tag"
                    value={stats.maxStepsEntry ? `${formatNumber(stats.maxStepsEntry.steps)} · ${stats.maxStepsEntry.date}` : "-"}
                  />
                  <Row
                    label="Meiste Fahrrad-KM an einem Tag"
                    value={stats.maxBikeEntry ? `${formatDecimal(stats.maxBikeEntry.bikeKm, 2)} · ${stats.maxBikeEntry.date}` : "-"}
                  />
                  <Row label="Punkte ohne Bonus" value={formatDecimal(stats.totalSteps / 1000 + stats.totalBikeKm + stats.squatPoints + stats.pushupPoints, 2)} />
                  <Row label="Teamscore gesamt" value={formatDecimal(stats.totalSteps / 1000 + stats.totalBikeKm + stats.squatPoints + stats.pushupPoints + stats.totalBonusPoints, 2)} />
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>Punkte-Mix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.pointsBreakdown} dataKey="value" nameKey="name" outerRadius={85} label>
                          {stats.pointsBreakdown.map((_, index) => (
                            <Cell key={index} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Verlauf pro Tag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.byDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="steps" name="Schritte" stroke="#60a5fa" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="bikeKm" name="Rad-KM" stroke="#34d399" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Bonus & Übungen pro Tag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.byDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bonusPoints" name="Bonuspunkte" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="exerciseCount" name="Übungen" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="eintragen">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Neuen Tageseintrag erfassen</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Person</Label>
                  <Select value={form.person} onValueChange={(value) => setForm({ ...form, person: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Person wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Schritte</Label>
                  <Input type="number" placeholder="z. B. 10452" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Fahrrad-KM</Label>
                  <Input type="number" step="0.1" placeholder="z. B. 7.5" value={form.bikeKm} onChange={(e) => setForm({ ...form, bikeKm: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Kniebeugen</Label>
                  <Input type="number" placeholder="z. B. 30" value={form.squats} onChange={(e) => setForm({ ...form, squats: e.target.value, exercise: Number(e.target.value) > 0 || Number(form.pushups) > 0 })} />
                  <p className="text-xs text-zinc-500">5 Kniebeugen = 1 Punkt</p>
                </div>

                <div className="space-y-2">
                  <Label>Liegestütze</Label>
                  <Input type="number" placeholder="z. B. 15" value={form.pushups} onChange={(e) => setForm({ ...form, pushups: e.target.value, exercise: Number(e.target.value) > 0 || Number(form.squats) > 0 })} />
                  <p className="text-xs text-zinc-500">3 Liegestütze = 1 Punkt</p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <Checkbox checked={form.bonus} onCheckedChange={(checked) => setForm({ ...form, bonus: !!checked })} id="bonus" />
                  <Label htmlFor="bonus" className="cursor-pointer">Bonus erreicht (+4)</Label>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <Checkbox checked={form.exercise} onCheckedChange={(checked) => setForm({ ...form, exercise: !!checked })} id="exercise" />
                  <Label htmlFor="exercise" className="cursor-pointer">Individuelle Übung gemacht</Label>
                </div>

                <div className="xl:col-span-3 flex flex-wrap gap-3">
                  <Button onClick={addEntry} className="rounded-2xl">Eintrag speichern</Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() =>
                      setForm({
                        date: todayISO(),
                        person: PEOPLE[0],
                        steps: "",
                        bikeKm: "",
                        squats: "",
                        pushups: "",
                        bonus: false,
                        exercise: false,
                      })
                    }
                  >
                    Zurücksetzen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liste">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle>Gespeicherte Einträge</CardTitle>
                  <Button variant="destructive" className="rounded-2xl w-full md:w-auto" onClick={clearAll}>
                    Alle löschen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sortedEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-zinc-500">
                    Noch keine Einträge vorhanden.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {sortedEntries.map((entry) => (
                      <div key={entry.id} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1.2fr,1fr,1fr,1fr,1fr,1fr,auto] md:items-center">
                        <div>
                          <div className="font-semibold text-zinc-900">{entry.person}</div>
                          <div className="text-sm text-zinc-500">{entry.date}</div>
                        </div>
                        <MiniStat icon={<Footprints className="h-4 w-4" />} label="Schritte" value={formatNumber(entry.steps)} />
                        <MiniStat icon={<Bike className="h-4 w-4" />} label="Rad" value={formatDecimal(entry.bikeKm, 2)} />
                        <MiniStat icon={<Dumbbell className="h-4 w-4" />} label="Knie / Liege" value={`${formatNumber(entry.squats)} / ${formatNumber(entry.pushups)}`} />
                        <MiniStat icon={<Flame className="h-4 w-4" />} label="Bonus" value={entry.bonus ? "Ja" : "Nein"} />
                        <MiniStat icon={<Dumbbell className="h-4 w-4" />} label="Übung" value={entry.exercise ? "Ja" : "Nein"} />
                        <MiniStat icon={<BarChart3 className="h-4 w-4" />} label="Punkte" value={formatDecimal(entry.points, 2)} />
                        <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function GoalMiniCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-wide text-white/70">{label}</div>
      <div className="mt-2 text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function MonthStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700">{icon}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-900 text-right">{value}</span>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">{icon}<span>{label}</span></div>
      <div className="font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatDecimal(value, digits = 2) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);
}

export default App;
