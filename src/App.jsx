import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Legend, ReferenceLine
} from "recharts";

// ---------------------------------------------------------------------------
// DATA — Real Madrid, LaLiga 2025-26 (final table). Goals/matches are drawn
// from season leaderboards; assists/minutes for squad players outside the two
// headline scorers are reconstructed from in-season data points, rounded to a
// full 38-match campaign, and flagged inline wherever they're shown.
// Match-by-match goal timing is not sourced — the trend chart interpolates a
// plausible in-season path to the confirmed season total and says so.
// ---------------------------------------------------------------------------

const TEAM = {
  played: 38, w: 27, d: 5, l: 6, gf: 77, ga: 35, gd: 42,
  finish: "2nd, LaLiga",
};

const RAW_PLAYERS = [
  { name: "Kylian Mbappé", num: 9, pos: "FW", age: 27, goals: 25, assists: 5, minutes: 2950, matches: 33, verified: true },
  { name: "Vinícius Júnior", num: 7, pos: "FW", age: 25, goals: 16, assists: 8, minutes: 2500, matches: 30, verified: true },
  { name: "Jude Bellingham", num: 5, pos: "MF", age: 23, goals: 6, assists: 5, minutes: 1950, matches: 24, verified: false },
  { name: "Gonzalo García", num: 16, pos: "FW", age: 21, goals: 6, assists: 2, minutes: 1400, matches: 20, verified: false },
  { name: "Federico Valverde", num: 8, pos: "MF", age: 27, goals: 5, assists: 9, minutes: 3200, matches: 37, verified: false },
  { name: "Arda Güler", num: 15, pos: "MF", age: 21, goals: 4, assists: 9, minutes: 2200, matches: 29, verified: false },
  { name: "Álvaro Carreras", num: 3, pos: "DF", age: 24, goals: 2, assists: 4, minutes: 2600, matches: 32, verified: false },
  { name: "Dean Huijsen", num: 24, pos: "DF", age: 21, goals: 2, assists: 1, minutes: 2850, matches: 34, verified: false },
  { name: "Éder Militão", num: 3, pos: "DF", age: 27, goals: 2, assists: 0, minutes: 2400, matches: 30, verified: false },
  { name: "Raúl Asencio", num: 6, pos: "DF", age: 22, goals: 2, assists: 1, minutes: 2050, matches: 27, verified: false },
  { name: "Antonio Rüdiger", num: 22, pos: "DF", age: 33, goals: 1, assists: 1, minutes: 2900, matches: 35, verified: false },
  { name: "Aurélien Tchouaméni", num: 14, pos: "MF", age: 26, goals: 1, assists: 2, minutes: 2750, matches: 33, verified: false },
  { name: "Brahim Díaz", num: 21, pos: "MF", age: 26, goals: 1, assists: 3, minutes: 1500, matches: 22, verified: false },
  { name: "Eduardo Camavinga", num: 6, pos: "MF", age: 23, goals: 1, assists: 2, minutes: 2100, matches: 28, verified: false },
  { name: "Fran García", num: 20, pos: "DF", age: 25, goals: 1, assists: 3, minutes: 1900, matches: 26, verified: false },
  { name: "Franco Mastantuono", num: 30, pos: "FW", age: 18, goals: 1, assists: 2, minutes: 1300, matches: 19, verified: false },
  { name: "Rodrygo", num: 11, pos: "FW", age: 25, goals: 1, assists: 2, minutes: 1100, matches: 17, verified: false },
];

const UCL_PHASE = [
  { md: "MD1", opp: "Marseille", venue: "H", score: "2–1", result: "W" },
  { md: "MD2", opp: "Kairat Almaty", venue: "A", score: "5–0", result: "W" },
  { md: "MD5", opp: "Olympiacos", venue: "A", score: "4–3", result: "W" },
  { md: "MD7", opp: "Monaco", venue: "H", score: "6–1", result: "W" },
  { md: "MD8", opp: "Benfica", venue: "A", score: "0–2", result: "L" },
];

const POS_ORDER = ["FW", "MF", "DF"];
const POS_LABEL = { FW: "Forwards", MF: "Midfielders", DF: "Defenders" };
// Amber / indigo / teal — three well-separated hues rather than reusing a
// status color (crimson) for a data category, and safer for deuteranopia
// than an amber/crimson pairing.
const POS_COLOR = { FW: "#b3872f", MF: "#5b4b8a", DF: "#2f6b78" };
const WIN_COLOR = "#3c6b4f";
const LOSS_COLOR = "#9b2f3b";

function sum(arr, key) { return arr.reduce((a, p) => a + p[key], 0); }
function per90(p) { return p.minutes ? ((p.goals + p.assists) * 90 / p.minutes) : 0; }
function lastName(n) { return n.split(" ").slice(-1)[0]; }

// Deterministic pseudo-random in-season goal trend, seeded per player so it's
// stable across renders (not a real match log — labeled as such wherever shown).
function buildTrend(p) {
  const weeks = 38;
  const arr = new Array(weeks).fill(0);
  let seed = p.num * 97 + p.name.length * 13 + 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const order = Array.from({ length: weeks }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  let remaining = p.goals, idx = 0;
  while (remaining > 0 && idx < order.length) {
    const brace = remaining >= 3 && rnd() > 0.87 ? 2 : 1;
    const use = Math.min(brace, remaining);
    arr[order[idx]] += use;
    remaining -= use;
    idx++;
  }
  let running = 0;
  return arr.map((v, i) => { running += v; return { week: i + 1, goals: running }; });
}

const PLAYERS = RAW_PLAYERS.map((p) => ({ ...p, trend: buildTrend(p) }));
const TABS = ["Overview", "Trends", "Squad", "Europe"];

export default function App() {
  const [theme, setTheme] = useState("night"); // night = domestic default, day = alt palette
  const [tab, setTab] = useState("Overview");
  const [metric, setMetric] = useState("total");
  const [posFilter, setPosFilter] = useState(new Set(POS_ORDER));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortKey, setSortKey] = useState("goals");
  const [sortDir, setSortDir] = useState("desc");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const togglePos = (p) => {
    const next = new Set(posFilter);
    next.has(p) ? next.delete(p) : next.add(p);
    if (next.size > 0) setPosFilter(next);
  };

  const toggleSelect = (name) => {
    setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  };

  const pool = useMemo(() => (
    PLAYERS.filter((p) => posFilter.has(p.pos)).filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  ), [posFilter, query]);

  const filtered = useMemo(() => (
    selected.length === 0 ? pool : pool.filter((p) => selected.includes(p.name))
  ), [pool, selected]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = sortKey === "per90" ? per90(a) : a[sortKey];
      const bv = sortKey === "per90" ? per90(b) : b[sortKey];
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const topScorers = useMemo(() => (
    [...filtered].sort((a, b) => (metric === "total" ? b.goals - a.goals : per90(b) - per90(a))).slice(0, 6)
      .map((p) => ({ name: lastName(p.name), value: metric === "total" ? p.goals : +per90(p).toFixed(2), pos: p.pos }))
  ), [filtered, metric]);

  const topAssists = useMemo(() => (
    [...filtered].sort((a, b) => b.assists - a.assists).slice(0, 6)
      .map((p) => ({ name: lastName(p.name), value: p.assists, pos: p.pos }))
  ), [filtered]);

  const comparePair = useMemo(() => {
    if (selected.length >= 2) return selected.slice(0, 2);
    if (selected.length === 1) {
      const other = [...pool].filter((p) => p.name !== selected[0]).sort((a, b) => b.goals - a.goals)[0];
      return other ? [selected[0], other.name] : [selected[0]];
    }
    return ["Kylian Mbappé", "Federico Valverde"];
  }, [selected, pool]);

  const posMinutes = useMemo(() => POS_ORDER.map((pos) => ({
    pos, label: POS_LABEL[pos], value: sum(PLAYERS.filter((p) => p.pos === pos), "minutes"),
  })), []);

  const avgAge = useMemo(() => POS_ORDER.map((pos) => {
    const arr = PLAYERS.filter((p) => p.pos === pos);
    return { pos, label: POS_LABEL[pos], value: +(sum(arr, "age") / arr.length).toFixed(1) };
  }), []);

  const scatterData = useMemo(() => filtered.map((p) => ({
    x: p.goals, y: p.assists, z: p.minutes, name: p.name, pos: p.pos,
  })), [filtered]);

  const trendPlayers = useMemo(() => (
    (selected.length > 0 ? filtered : [...PLAYERS].sort((a, b) => b.goals - a.goals)).slice(0, 4)
  ), [filtered, selected]);

  const trendData = useMemo(() => {
    const weeks = Array.from({ length: 38 }, (_, i) => ({ week: i + 1 }));
    weeks.forEach((row) => {
      trendPlayers.forEach((p) => { row[lastName(p.name)] = p.trend[row.week - 1].goals; });
    });
    return weeks;
  }, [trendPlayers]);

  const radarData = useMemo(() => {
    const maxG = Math.max(...PLAYERS.map((p) => p.goals));
    const maxA = Math.max(...PLAYERS.map((p) => p.assists));
    const maxM = Math.max(...PLAYERS.map((p) => p.minutes));
    const maxMatch = Math.max(...PLAYERS.map((p) => p.matches));
    const maxP90 = Math.max(...PLAYERS.map(per90));
    const dims = [
      { key: "Goals", get: (p) => (p.goals / maxG) * 100 },
      { key: "Assists", get: (p) => (p.assists / maxA) * 100 },
      { key: "Minutes", get: (p) => (p.minutes / maxM) * 100 },
      { key: "Appearances", get: (p) => (p.matches / maxMatch) * 100 },
      { key: "G+A per 90", get: (p) => (per90(p) / maxP90) * 100 },
    ];
    return dims.map((d) => {
      const row = { metric: d.key };
      comparePair.forEach((name) => {
        const p = PLAYERS.find((pl) => pl.name === name);
        row[name] = p ? +d.get(p).toFixed(1) : 0;
      });
      return row;
    });
  }, [comparePair]);

  const totalGoals = sum(filtered, "goals");
  const totalAssists = sum(filtered, "assists");
  const totalMinutes = sum(filtered, "minutes");
  const topScorer = [...filtered].sort((a, b) => b.goals - a.goals)[0];
  const scopeNote = selected.length > 0 ? `${filtered.length} of 17 selected` : "full squad";

  const insights = useMemo(() => {
    if (filtered.length === 0) return [];
    const list = [...filtered];
    const bestP90 = [...list].sort((a, b) => per90(b) - per90(a))[0];
    const squadAvgP90 = sum(list.map((p) => ({ v: per90(p) })), "v") / list.length;
    const youngest = [...list].sort((a, b) => a.age - b.age)[0];
    const mostMinutes = [...list].sort((a, b) => b.minutes - a.minutes)[0];
    const out = [];
    if (bestP90) out.push(`${bestP90.name} leads on goal involvement at ${per90(bestP90).toFixed(2)} G+A per 90 — ${(per90(bestP90) / (squadAvgP90 || 1)).toFixed(1)}× the group average.`);
    if (mostMinutes) out.push(`${mostMinutes.name} carried the heaviest load: ${mostMinutes.minutes.toLocaleString()} minutes across ${mostMinutes.matches} appearances.`);
    if (youngest) out.push(`${youngest.name} is the youngest in this view at ${youngest.age}, with ${youngest.goals}G / ${youngest.assists}A this season.`);
    return out;
  }, [filtered]);

  const exportCSV = () => {
    const header = "Player,Position,Age,Goals,Assists,Minutes,Matches,G+A per 90\n";
    const rows = sorted.map((p) => [p.name, p.pos, p.age, p.goals, p.assists, p.minutes, p.matches, per90(p).toFixed(2)].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "real_madrid_2025-26_filtered.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("CSV exported — check your downloads");
  };

  const t = {
    ink: theme === "night" ? "#201c14" : "#f2efe4",
    inkSoft: theme === "night" ? "#6b6353" : "#a9adbd",
    grid: theme === "night" ? "#e5ddc9" : "#333c52",
    tooltipBg: theme === "night" ? "#fff" : "#1c2233",
  };

  const radarColors = ["#b3872f", "#5b4b8a"];

  return (
    <div className={"rm-root theme-" + theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        .rm-root {
          --gold: #b3872f; --gold-bright: #d9ad4f;
          font-family: 'Inter', sans-serif;
          background: var(--bg); color: var(--panel);
          padding: 24px 24px 48px; min-height: 100vh; box-sizing: border-box;
          transition: background 0.35s ease, color 0.35s ease;
        }
        .rm-root.theme-night {
          --bg: #12161f; --bg-ink: #f6f2e7; --bg-ink-soft: #cfc9b8;
          --panel: #f6f2e7; --ink: #201c14; --ink-soft: #6b6353;
          --line: #d9d0ba; --hover: #efe8d6; --active: #e9dfc4;
          --shadow: 0 2px 10px rgba(0,0,0,0.35);
        }
        .rm-root.theme-day {
          --bg: #e9e2cf; --bg-ink: #201c14; --bg-ink-soft: #6b6353;
          --panel: #171c28; --ink: #f2efe4; --ink-soft: #a9adbd;
          --line: #333c52; --hover: #212842; --active: #262f4c;
          --shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        .rm-root * { box-sizing: border-box; }
        .rm-serif { font-family: 'Fraunces', serif; }
        :focus-visible { outline: 2px solid var(--gold-bright); outline-offset: 2px; }

        .rm-mast {
          display: grid; grid-template-columns: auto 1fr auto auto; gap: 20px; align-items: center;
          border-bottom: 1px solid var(--line); padding-bottom: 18px; margin-bottom: 16px;
        }
        .rm-crest {
          width: 50px; height: 50px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #fff 0%, #e7ddc2 45%, var(--gold) 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px; color: #201c14;
          border: 2px solid var(--gold-bright); flex-shrink: 0;
        }
        .rm-eyebrow { font-size: 11px; letter-spacing: 0.05em; color: var(--gold-bright); margin-bottom: 5px; text-transform: uppercase; }
        .rm-h1 { font-size: 26px; font-weight: 600; margin: 0; color: var(--bg-ink); }
        .rm-record { text-align: right; font-size: 12px; color: var(--bg-ink-soft); line-height: 1.5; }
        .rm-record b { color: var(--gold-bright); font-family: 'Fraunces', serif; font-size: 14px; }
        .rm-theme-btn {
          border: 1px solid var(--bg-ink-soft); background: transparent; color: var(--bg-ink);
          font-size: 11px; padding: 7px 12px; border-radius: 20px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 600; white-space: nowrap;
        }
        .rm-theme-btn:hover { border-color: var(--gold-bright); color: var(--gold-bright); }

        .rm-tabs { display: flex; gap: 4px; margin-bottom: 18px; }
        .rm-tab {
          background: transparent; border: none; border-bottom: 2px solid transparent;
          color: var(--bg-ink-soft); font-family: 'Fraunces', serif; font-size: 14px;
          padding: 8px 4px; margin-right: 22px; cursor: pointer;
        }
        .rm-tab.active { color: var(--bg-ink); border-bottom-color: var(--gold); }
        .rm-tab:hover { color: var(--gold-bright); }

        .rm-layout { display: grid; grid-template-columns: 240px 1fr; gap: 18px; }
        @media (max-width: 900px) { .rm-layout { grid-template-columns: 1fr; } }

        .rm-side {
          background: var(--panel); color: var(--ink); border-radius: 6px; padding: 16px 14px;
          align-self: start; position: sticky; top: 16px; box-shadow: var(--shadow);
        }
        .rm-side h3 { font-family: 'Fraunces', serif; font-size: 14px; margin: 0 0 3px; }
        .rm-sub { font-size: 11px; color: var(--ink-soft); margin-bottom: 10px; }
        .rm-search {
          width: 100%; padding: 8px 10px; border: 1px solid var(--line);
          background: transparent; color: var(--ink); border-radius: 4px; font-size: 13px; margin-bottom: 10px;
          font-family: 'Inter', sans-serif;
        }
        .rm-postabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .rm-postab {
          font-size: 11px; padding: 4px 9px; border-radius: 20px; cursor: pointer;
          border: 1px solid var(--line); background: transparent; color: var(--ink-soft);
          font-family: 'Inter', sans-serif; font-weight: 600;
        }
        .rm-postab.active { color: #fff; border-color: transparent; }

        .rm-player-list { max-height: 460px; overflow-y: auto; padding-right: 4px; }
        .rm-player-row {
          display: flex; align-items: center; gap: 8px; padding: 6px 4px 6px 6px;
          border-bottom: 1px solid var(--line); border-left: 3px solid transparent;
          cursor: pointer; font-size: 13px;
        }
        .rm-player-row:hover { background: var(--hover); }
        .rm-player-row.on { background: var(--active); border-left-color: var(--gold); font-weight: 600; }
        .rm-checkbox { width: 14px; height: 14px; accent-color: var(--gold); cursor: pointer; flex-shrink: 0; }
        .rm-num {
          width: 22px; height: 22px; border-radius: 50%; color: #fff; font-size: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'Fraunces', serif;
        }
        .rm-player-name {
          flex: 1; cursor: pointer; background: none; border: none; padding: 0;
          text-align: left; font: inherit; color: inherit;
        }
        .rm-player-name:hover { text-decoration: underline; text-decoration-color: var(--gold); }
        .rm-player-pos { font-size: 10px; color: var(--ink-soft); font-weight: 600; }
        .rm-hint { font-size: 11px; color: var(--ink-soft); margin-top: 10px; line-height: 1.5; }

        .rm-kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 18px; }
        @media (max-width: 900px) { .rm-kpis { grid-template-columns: repeat(2, 1fr); } }
        .rm-kpi {
          background: var(--panel); color: var(--ink); border-radius: 6px; padding: 15px 15px 13px;
          border-top: 3px solid var(--gold); box-shadow: var(--shadow); transition: transform 0.15s ease;
        }
        .rm-kpi:hover { transform: translateY(-2px); }
        .rm-kpi-label { font-size: 10.5px; color: var(--ink-soft); font-weight: 700; letter-spacing: 0.03em; }
        .rm-kpi-value { font-family: 'Fraunces', serif; font-size: 28px; margin-top: 4px; }
        .rm-kpi-note { font-size: 11px; color: var(--ink-soft); margin-top: 4px; }

        .rm-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 900px) { .rm-grid { grid-template-columns: 1fr; } }
        .rm-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 900px) { .rm-grid3 { grid-template-columns: 1fr; } }

        .rm-card {
          background: var(--panel); color: var(--ink); border-radius: 6px; padding: 16px;
          box-shadow: var(--shadow); transition: box-shadow 0.2s ease;
        }
        .rm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
        .rm-card-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .rm-card-title { font-family: 'Fraunces', serif; font-size: 15px; }
        .rm-card-sub { font-size: 11px; color: var(--ink-soft); }
        .rm-badge-unverified {
          font-size: 9px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--ink-soft);
          border: 1px solid var(--line); border-radius: 8px; padding: 1px 6px; margin-left: 6px;
        }

        .rm-toggle { display: flex; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
        .rm-toggle button {
          border: none; background: transparent; font-size: 11px; padding: 5px 12px;
          cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; color: var(--ink-soft);
        }
        .rm-toggle button.on { background: var(--ink); color: var(--panel); }

        .rm-btn {
          border: 1px solid var(--line); background: transparent; color: var(--ink);
          font-size: 11px; padding: 6px 12px; border-radius: 20px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 600;
        }
        .rm-btn:hover { border-color: var(--gold); color: var(--gold); }

        table.rm-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        table.rm-table th {
          text-align: left; font-size: 10.5px; letter-spacing: 0.03em; color: var(--ink-soft);
          border-bottom: 1px solid var(--line); padding: 6px 8px; cursor: pointer; user-select: none;
          position: sticky; top: 0; background: var(--panel);
        }
        table.rm-table th.active { color: var(--gold); }
        table.rm-table td { padding: 7px 8px; border-bottom: 1px solid var(--line); }
        table.rm-table tr td:first-child { cursor: pointer; }
        table.rm-table tr:hover td { background: var(--hover); }
        .rm-badge { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 10px; color: #fff; }

        .rm-empty {
          text-align: center; padding: 40px 20px; color: var(--ink-soft); font-size: 13px;
        }
        .rm-empty b { display: block; font-family: 'Fraunces', serif; font-size: 16px; color: var(--ink); margin-bottom: 6px; }

        .rm-insights { list-style: none; margin: 0; padding: 0; }
        .rm-insights li {
          font-size: 12.5px; padding: 8px 0 8px 16px; border-bottom: 1px solid var(--line);
          position: relative; line-height: 1.5;
        }
        .rm-insights li:before {
          content: "→"; position: absolute; left: 0; color: var(--gold); font-weight: 700;
        }
        .rm-insights li:last-child { border-bottom: none; }

        .rm-skel { background: linear-gradient(90deg, var(--hover) 25%, var(--active) 50%, var(--hover) 75%); background-size: 200% 100%; animation: rm-shimmer 1.3s infinite; border-radius: 6px; }
        @keyframes rm-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Champions League panel is intentionally always dark — "European nights" —
           independent of the day/night season toggle above. */
        .rm-ucl { background: #0c0f16; border: 1px solid #2a3142; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
        .rm-ucl-title { font-family: 'Fraunces', serif; color: #f6f2e7; font-size: 15px; }
        .rm-ucl-sub { font-size: 11px; color: #9aa0ad; margin-top: 3px; }
        .rm-strip { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .rm-leg { background: #171c28; border-radius: 6px; padding: 10px 14px; min-width: 128px; border-left: 3px solid ${WIN_COLOR}; }
        .rm-leg.loss { border-left-color: ${LOSS_COLOR}; }
        .rm-leg .rm-md { font-size: 10px; color: #8a90a0; letter-spacing: 0.04em; }
        .rm-leg .rm-opp { font-family: 'Fraunces', serif; color: #f0ece0; font-size: 13px; margin: 2px 0; }
        .rm-leg .rm-score { font-size: 12px; color: #b7bccb; }

        .rm-legend { display: flex; gap: 14px; font-size: 11px; color: var(--ink-soft); margin-top: 8px; flex-wrap: wrap; }
        .rm-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 5px; }

        .rm-foot { font-size: 11px; color: var(--bg-ink-soft); margin-top: 6px; line-height: 1.6; }

        .rm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: flex-end; z-index: 50;
        }
        .rm-drawer {
          width: min(380px, 92vw); height: 100%; background: var(--panel); color: var(--ink);
          padding: 22px; overflow-y: auto; box-shadow: -8px 0 24px rgba(0,0,0,0.35);
          animation: rm-slide 0.22s ease;
        }
        @keyframes rm-slide { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .rm-drawer-close {
          float: right; border: none; background: transparent; font-size: 18px; cursor: pointer; color: var(--ink-soft);
        }
        .rm-drawer-num {
          width: 44px; height: 44px; border-radius: 50%; color: #fff; display: flex; align-items: center;
          justify-content: center; font-family: 'Fraunces', serif; font-size: 18px; margin-bottom: 10px;
        }
        .rm-drawer h2 { font-family: 'Fraunces', serif; font-size: 20px; margin: 0 0 2px; }
        .rm-drawer .rm-drawer-sub { font-size: 12px; color: var(--ink-soft); margin-bottom: 14px; }
        .rm-drawer-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
        .rm-drawer-stat { background: var(--hover); border-radius: 6px; padding: 10px; }
        .rm-drawer-stat .n { font-family: 'Fraunces', serif; font-size: 20px; }
        .rm-drawer-stat .l { font-size: 10.5px; color: var(--ink-soft); }

        .rm-toast {
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
          background: var(--ink); color: var(--panel); padding: 10px 18px; border-radius: 20px;
          font-size: 12.5px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); z-index: 60;
          animation: rm-slide 0.2s ease;
        }
      `}</style>

      {/* Masthead */}
      <div className="rm-mast">
        <div className="rm-crest">RM</div>
        <div>
          <div className="rm-eyebrow">Matchday Analytics — Concha Espina, Madrid</div>
          <h1 className="rm-h1 rm-serif">Real Madrid, 2025–26 Season</h1>
        </div>
        <div className="rm-record">
          Finished <b>{TEAM.finish}</b><br />
          {TEAM.w}W – {TEAM.d}D – {TEAM.l}L &nbsp;·&nbsp; {TEAM.gf}–{TEAM.ga} GD
        </div>
        <button className="rm-theme-btn" onClick={() => setTheme(theme === "night" ? "day" : "night")}>
          {theme === "night" ? "☾ Night view" : "☀ Day view"}
        </button>
      </div>

      {/* Tabs */}
      <div className="rm-tabs">
        {TABS.map((tb) => (
          <button key={tb} className={"rm-tab" + (tab === tb ? " active" : "")} onClick={() => setTab(tb)}>{tb}</button>
        ))}
      </div>

      <div className="rm-layout">
        {/* Sidebar — persistent across tabs */}
        <aside className="rm-side">
          <h3 className="rm-serif">Squad</h3>
          <div className="rm-sub">Check players to filter every visual to just them</div>
          <input
            className="rm-search" placeholder="Search a player…" value={query}
            onChange={(e) => setQuery(e.target.value)} aria-label="Search players"
          />
          <div className="rm-postabs">
            {POS_ORDER.map((pos) => (
              <button
                key={pos} className={"rm-postab" + (posFilter.has(pos) ? " active" : "")}
                style={posFilter.has(pos) ? { background: POS_COLOR[pos] } : {}}
                onClick={() => togglePos(pos)} aria-pressed={posFilter.has(pos)}
              >
                {pos}
              </button>
            ))}
            {selected.length > 0 && (
              <button className="rm-postab" onClick={() => setSelected([])}>Clear ({selected.length})</button>
            )}
          </div>
          <div className="rm-player-list">
            {pool.map((p) => (
              <div key={p.name} className={"rm-player-row" + (selected.includes(p.name) ? " on" : "")}>
                <input
                  type="checkbox" className="rm-checkbox" checked={selected.includes(p.name)}
                  onChange={() => toggleSelect(p.name)} aria-label={`Select ${p.name}`}
                />
                <span className="rm-num" style={{ background: POS_COLOR[p.pos] }}>{p.num}</span>
                <button type="button" className="rm-player-name" onClick={() => setDetail(p)}>{p.name}</button>
                <span className="rm-player-pos">{p.pos}</span>
              </div>
            ))}
          </div>
          <div className="rm-hint">
            {selected.length === 0
              ? "Nothing checked — every chart shows the full squad. Click a name to open its detail card."
              : `Showing ${filtered.length} of 17. Radar compares ${comparePair.join(" vs ")}.`}
          </div>
          <button className="rm-btn" style={{ marginTop: 12, width: "100%" }} onClick={exportCSV}>Export view as CSV</button>
        </aside>

        {/* Main */}
        <main>
          {loading ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div className="rm-skel" style={{ height: 90 }} />
              <div className="rm-skel" style={{ height: 280 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rm-card rm-empty">
              <b>No players match this filter</b>
              Try clearing a position filter or the checked players in the sidebar.
              <div style={{ marginTop: 12 }}>
                <button className="rm-btn" onClick={() => { setSelected([]); setPosFilter(new Set(POS_ORDER)); setQuery(""); }}>Reset filters</button>
              </div>
            </div>
          ) : (
            <>
              {tab === "Overview" && (
                <>
                  <div className="rm-kpis">
                    <div className="rm-kpi">
                      <div className="rm-kpi-label">GOALS{selected.length > 0 ? " (SELECTED)" : ""}</div>
                      <div className="rm-kpi-value rm-serif">{totalGoals}</div>
                      <div className="rm-kpi-note">{scopeNote}</div>
                    </div>
                    <div className="rm-kpi">
                      <div className="rm-kpi-label">ASSISTS{selected.length > 0 ? " (SELECTED)" : ""}</div>
                      <div className="rm-kpi-value rm-serif">{totalAssists}</div>
                      <div className="rm-kpi-note">{totalGoals ? (totalAssists / totalGoals * 100).toFixed(0) : 0}% of goals assisted</div>
                    </div>
                    <div className="rm-kpi">
                      <div className="rm-kpi-label">MINUTES{selected.length > 0 ? " (SELECTED)" : " LOGGED"}</div>
                      <div className="rm-kpi-value rm-serif">{(totalMinutes / 1000).toFixed(1)}K</div>
                      <div className="rm-kpi-note">{scopeNote}</div>
                    </div>
                    <div className="rm-kpi">
                      <div className="rm-kpi-label">TEAM GOAL DIFFERENCE</div>
                      <div className="rm-kpi-value rm-serif">+{TEAM.gd}</div>
                      <div className="rm-kpi-note">{TEAM.gf} for · {TEAM.ga} against</div>
                    </div>
                    <div className="rm-kpi">
                      <div className="rm-kpi-label">TOP SCORER{selected.length > 0 ? " (SELECTED)" : ""}</div>
                      <div className="rm-kpi-value rm-serif" style={{ fontSize: 19 }}>{lastName(topScorer.name)}</div>
                      <div className="rm-kpi-note">{topScorer.goals} goals · {per90(topScorer).toFixed(2)} G+A/90</div>
                    </div>
                  </div>

                  <div className="rm-grid">
                    <div className="rm-card">
                      <div className="rm-card-head">
                        <div><div className="rm-card-title">Top Scorers</div><div className="rm-card-sub">{scopeNote === "full squad" ? "Full squad" : scopeNote}</div></div>
                        <div className="rm-toggle">
                          <button className={metric === "total" ? "on" : ""} onClick={() => setMetric("total")}>Total</button>
                          <button className={metric === "per90" ? "on" : ""} onClick={() => setMetric("per90")}>Per 90</button>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topScorers} layout="vertical" margin={{ left: 10, right: 24 }}>
                          <CartesianGrid stroke={t.grid} horizontal={false} />
                          <XAxis type="number" stroke={t.inkSoft} fontSize={11} />
                          <YAxis type="category" dataKey="name" stroke={t.inkSoft} fontSize={12} width={90} />
                          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} />
                          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                            {topScorers.map((d, i) => <Cell key={i} fill={POS_COLOR[d.pos]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rm-card">
                      <div className="rm-card-head"><div className="rm-card-title">Top Assists</div><div className="rm-card-sub">LaLiga totals</div></div>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topAssists} margin={{ top: 6 }}>
                          <CartesianGrid stroke={t.grid} vertical={false} />
                          <XAxis dataKey="name" stroke={t.inkSoft} fontSize={11} />
                          <YAxis stroke={t.inkSoft} fontSize={11} />
                          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {topAssists.map((d, i) => <Cell key={i} fill={POS_COLOR[d.pos]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rm-grid3">
                    <div className="rm-card">
                      <div className="rm-card-head"><div className="rm-card-title">Minutes by Position</div><div className="rm-card-sub">Full rotation</div></div>
                      <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                          <Pie data={posMinutes} dataKey="value" nameKey="label" innerRadius={50} outerRadius={76} paddingAngle={3}>
                            {posMinutes.map((d) => <Cell key={d.pos} fill={POS_COLOR[d.pos]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} />
                          <Legend wrapperStyle={{ fontSize: 11, color: t.ink }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rm-card">
                      <div className="rm-card-head"><div className="rm-card-title">Average Age</div><div className="rm-card-sub">By position</div></div>
                      <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={avgAge}>
                          <CartesianGrid stroke={t.grid} vertical={false} />
                          <XAxis dataKey="pos" stroke={t.inkSoft} fontSize={11} />
                          <YAxis stroke={t.inkSoft} fontSize={11} domain={[0, 35]} />
                          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {avgAge.map((d) => <Cell key={d.pos} fill={POS_COLOR[d.pos]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rm-card">
                      <div className="rm-card-head"><div className="rm-card-title">Insights</div><div className="rm-card-sub">Auto-generated from current view</div></div>
                      <ul className="rm-insights">
                        {insights.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {tab === "Trends" && (
                <>
                  <div className="rm-card" style={{ marginBottom: 16 }}>
                    <div className="rm-card-head">
                      <div>
                        <div className="rm-card-title">Season Goal Progression</div>
                        <div className="rm-card-sub">Illustrative in-season path to the confirmed season total — exact match-by-match record not sourced</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={trendData} margin={{ left: -10 }}>
                        <CartesianGrid stroke={t.grid} />
                        <XAxis dataKey="week" stroke={t.inkSoft} fontSize={11} label={{ value: "Matchweek", position: "insideBottom", offset: -4, fontSize: 11, fill: t.inkSoft }} />
                        <YAxis stroke={t.inkSoft} fontSize={11} />
                        <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} />
                        <Legend wrapperStyle={{ fontSize: 11, color: t.ink }} />
                        {trendPlayers.map((p, i) => (
                          <Line key={p.name} type="monotone" dataKey={lastName(p.name)} stroke={POS_COLOR[p.pos]} strokeWidth={2} dot={false} />
                        ))}
                        <ReferenceLine x={38} stroke={t.inkSoft} strokeDasharray="3 3" label={{ value: "Season end", fontSize: 10, fill: t.inkSoft, position: "top" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rm-card">
                    <div className="rm-card-head">
                      <div><div className="rm-card-title">Goal Contribution Map</div><div className="rm-card-sub">Bubble size = minutes played</div></div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                        <CartesianGrid stroke={t.grid} />
                        <XAxis type="number" dataKey="x" name="Goals" stroke={t.inkSoft} fontSize={11} />
                        <YAxis type="number" dataKey="y" name="Assists" stroke={t.inkSoft} fontSize={11} />
                        <ZAxis type="number" dataKey="z" range={[40, 400]} />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} formatter={(v, n) => [v, n]} labelFormatter={() => ""} />
                        <Scatter data={scatterData} fillOpacity={0.75}>
                          {scatterData.map((d, i) => <Cell key={i} fill={POS_COLOR[d.pos]} />)}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div className="rm-legend">
                      {POS_ORDER.map((p) => <span key={p}><span className="rm-dot" style={{ background: POS_COLOR[p] }} />{POS_LABEL[p]}</span>)}
                    </div>
                  </div>
                </>
              )}

              {tab === "Squad" && (
                <div className="rm-grid">
                  <div className="rm-card">
                    <div className="rm-card-head">
                      <div><div className="rm-card-title">Head-to-Head</div><div className="rm-card-sub">Check exactly two players to pin this comparison</div></div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={t.grid} />
                        <PolarAngleAxis dataKey="metric" fontSize={11} stroke={t.inkSoft} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        {comparePair.map((name, i) => (
                          <Radar key={name} name={name} dataKey={name} stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.28} />
                        ))}
                        <Legend wrapperStyle={{ fontSize: 11, color: t.ink }} />
                        <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", background: t.tooltipBg, color: t.ink, border: "1px solid " + t.grid }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rm-card">
                    <div className="rm-card-head">
                      <div><div className="rm-card-title">Player Performance</div><div className="rm-card-sub">Click a column to sort, a name to open detail</div></div>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      <table className="rm-table">
                        <thead>
                          <tr>
                            {[["name", "Player"], ["goals", "G"], ["assists", "A"], ["minutes", "Min"], ["per90", "G+A/90"]].map(([key, label]) => (
                              <th key={key} className={sortKey === key ? "active" : ""}
                                onClick={() => { if (sortKey === key) setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortKey(key); setSortDir("desc"); } }}>
                                {label}{sortKey === key ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map((p) => (
                            <tr key={p.name}>
                              <td>
                                <button type="button" className="rm-player-name" onClick={() => setDetail(p)}>{p.name}</button>
                                {" "}<span className="rm-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
                                {!p.verified && <span className="rm-badge-unverified" title="Assists/minutes reconstructed from partial-season data">est.</span>}
                              </td>
                              <td>{p.goals}</td>
                              <td>{p.assists}</td>
                              <td>{p.minutes.toLocaleString()}</td>
                              <td>{per90(p).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Europe" && (
                <div className="rm-ucl">
                  <div className="rm-ucl-title rm-serif">Champions League — League Phase</div>
                  <div className="rm-ucl-sub">Kylian Mbappé finished the competition as top scorer with 15 goals; Real Madrid were eliminated by Bayern Munich in the quarter-finals.</div>
                  <div className="rm-strip">
                    {UCL_PHASE.map((m) => (
                      <div key={m.md} className={"rm-leg" + (m.result === "L" ? " loss" : "")}>
                        <div className="rm-md">{m.md} · {m.venue}</div>
                        <div className="rm-opp">{m.opp}</div>
                        <div className="rm-score">{m.score} ({m.result})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="rm-foot">
            Sources: LaLiga/FotMob season leaderboards and UEFA.com competition reporting for goals, final standings and Champions League results.
            Rows marked "est." use assists/minutes reconstructed from in-season data points, rounded to a full 38-match campaign. The Trends tab's goal progression interpolates a plausible path to each player's confirmed total — it is not a sourced match log.
          </div>
        </main>
      </div>

      {detail && (
        <div className="rm-overlay" onClick={() => setDetail(null)}>
          <div className="rm-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="rm-drawer-close" onClick={() => setDetail(null)} aria-label="Close">✕</button>
            <div className="rm-drawer-num" style={{ background: POS_COLOR[detail.pos] }}>{detail.num}</div>
            <h2>{detail.name}</h2>
            <div className="rm-drawer-sub">
              {POS_LABEL[detail.pos]} · Age {detail.age}
              {!detail.verified && <span className="rm-badge-unverified" style={{ marginLeft: 6 }}>est.</span>}
            </div>
            <div className="rm-drawer-stats">
              <div className="rm-drawer-stat"><div className="n rm-serif">{detail.goals}</div><div className="l">Goals</div></div>
              <div className="rm-drawer-stat"><div className="n rm-serif">{detail.assists}</div><div className="l">Assists</div></div>
              <div className="rm-drawer-stat"><div className="n rm-serif">{detail.minutes.toLocaleString()}</div><div className="l">Minutes</div></div>
              <div className="rm-drawer-stat"><div className="n rm-serif">{detail.matches}</div><div className="l">Matches</div></div>
              <div className="rm-drawer-stat" style={{ gridColumn: "span 2" }}>
                <div className="n rm-serif">{per90(detail).toFixed(2)}</div><div className="l">Goal + assist involvement per 90 minutes</div>
              </div>
            </div>
            <div className="rm-card-title" style={{ marginBottom: 6 }}>Season progression</div>
            <div className="rm-card-sub" style={{ marginBottom: 8 }}>Illustrative cumulative goals by matchweek</div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={detail.trend}>
                <XAxis dataKey="week" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 11, fontFamily: "Inter" }} />
                <Line type="monotone" dataKey="goals" stroke={POS_COLOR[detail.pos]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <button
              className="rm-btn" style={{ marginTop: 16, width: "100%" }}
              onClick={() => { toggleSelect(detail.name); showToast(selected.includes(detail.name) ? `${detail.name} removed from selection` : `${detail.name} added to selection`); }}
            >
              {selected.includes(detail.name) ? "Remove from selection" : "Add to selection"}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="rm-toast">{toast}</div>}
    </div>
  );
}
