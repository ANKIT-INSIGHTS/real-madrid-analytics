<div align="center">

# ⚽ Real Madrid, 2025-26
### Performance Analytics Dashboard

**[View Live Dashboard →](https://ankit-insights.github.io/real-madrid-analytics/)**

`React` · `Vite` · `Recharts` · `GitHub Pages`

</div>

<br>

Most club stat pages give you a table and call it a day. This one lets you check any combination of the 17-man rotation and watch every chart, KPI, and table on the page reshape around just those players — then drill into a single name for a full stat card, or pin two players against each other on a radar to see who actually carried more weight this season.

<br>

## ✨ What it does

| | |
|---|---|
| 🎯 **Check players, everything follows** | The squad checklist drives the KPIs, scorer/assist charts, contribution map, and table simultaneously — not decoration. |
| 🕸️ **Head-to-head radar** | Pin exactly two players and compare goals, assists, minutes, appearances, and G+A per 90 on one chart. |
| 📈 **Season goal progression** | Matchweek-by-matchweek lines instead of one flat end-of-season number. |
| 🪪 **Player detail drawer** | Click a name for their full season in a slide-over panel with a mini trend chart. |
| 🌗 **Night / Day theming** | The Champions League panel stays permanently dark regardless — European nights are European nights. |
| ⬇️ **Filtered CSV export** | Exports respect whatever you're currently looking at, not the full dataset. |
| ⌨️ **Keyboard-first** | Every control is reachable and has a visible focus state. |

<br>

## 🚀 Running it yourself

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

<br>

## 🗂️ How it's put together

```
├── src/
│   ├── main.jsx     # mounts the app
│   └── App.jsx      # everything else — data, state, charts
├── vite.config.js    # base path has to match the repo name for Pages to work
└── .github/workflows/deploy.yml   # builds + deploys on every push to main
```

Nothing exotic — one component, one data file at the top of `App.jsx`, Recharts for everything visual.

<br>

## 📊 Where the numbers come from

> Goals, final LaLiga standings, and Champions League results are pulled from FotMob/LaLiga season leaderboards and UEFA.com reporting — those are solid.
>
> Assists and minutes for everyone except the two headline scorers are reconstructed from partial-season snapshots and rounded out to a full 38-match campaign; those rows carry an **est.** tag in the app so it's clear which numbers to trust at a glance.
>
> The matchweek goal-progression chart interpolates a plausible path to each player's real season total — it is not a sourced match log.

<br>

<div align="center">

**License** — Personal project. Fork it, break it, make it about a different team.

</div>

