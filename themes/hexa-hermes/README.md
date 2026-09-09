# HEXA Hermes Theme — Codex Desktop · Hermes Agent · ChatGPT

One canonical palette — HEXA Silent Luxury (signature gold `#D4AF37` on void
`#050505`, 60-30-10 rule) — applied to all three daily-driver surfaces.
Token source of truth: `DESIGN_SYSTEM.md` + `docs/design/DESIGN_TOKENS.md`.
No ad-hoc hex anywhere in this folder.

| File | Target | How it applies |
|---|---|---|
| `hermes-skin.yaml` | Hermes Agent CLI / TUI / desktop | Skin engine repaints every surface live |
| `codex-appearance.toml` | Codex Desktop app (`~/.codex/config.toml`) | Native `desktop.appearance*` keys |
| `chatgpt-hermes.css` | chatgpt.com via Stylus extension | Userstyle (the ChatGPT desktop app has no native CSS slot) |

## 1. Codex Desktop

```powershell
Copy-Item "$env:USERPROFILE\.codex\config.toml" "$env:USERPROFILE\.codex\config.toml.pre-hexa-hermes.bak"
```

Merge `codex-appearance.toml` into `~/.codex/config.toml`: replace the
`appearanceTheme`, `appearanceDarkCodeThemeId`, `appearanceLightCodeThemeId`,
`appearanceDiffMarkerStyle` keys and the whole
`[desktop.appearanceDarkChromeTheme]` / `[desktop.appearanceLightChromeTheme]`
tables (including `.fonts` / `.semanticColors` subtables). Validate with
`python -c "import tomllib; tomllib.load(open(r'$env:USERPROFILE\.codex\config.toml','rb'))"`,
then restart the Codex Desktop app.

Revert: restore the `.pre-hexa-hermes.bak` file and restart the app.

## 2. Hermes Agent

```powershell
Copy-Item themes\hexa-hermes\hermes-skin.yaml "$env:HERMES_HOME\skins\hexa-hermes.yaml"
hermes skin use hexa-hermes
```

Every surface (CLI, TUI, desktop) repaints within ~a second.
Revert: `hermes skin use default`.

### All profiles at once

Each named profile keeps its own home (`$HERMES_HOME/profiles/<name>/`).
Roll the skin out everywhere with a `HERMES_HOME` override loop
(never hand-edit `config.yaml` — activation always goes through the writer):

```powershell
$src = "themes\hexa-hermes\hermes-skin.yaml"
Get-ChildItem "$env:HERMES_HOME\profiles" -Directory |
  Where-Object { $_.Name -ne ".deleted" } | ForEach-Object {
    $skins = Join-Path $_.FullName "skins"
    if (-not (Test-Path $skins)) { New-Item -ItemType Directory -Path $skins | Out-Null }
    Copy-Item $src (Join-Path $skins "hexa-hermes.yaml") -Force
    $env:HERMES_HOME = $_.FullName
    hermes skin use hexa-hermes
  }
```

Orphaned on-disk profile dirs (present under `profiles/` but absent from
`hermes profile list`) are skipped for activation — the skin file is still
copied so it applies if the profile is ever re-created.

## 3. ChatGPT (web, via Stylus)

1. Install the Stylus browser extension.
2. Stylus → Manage → Write new style → paste `chatgpt-hermes.css` → Save.
3. Open `chatgpt.com` with dark mode enabled.

Revert: disable or delete the style in Stylus.

## Token map (all canonical)

`void #050505` · `voidDeep #020203` · `obsidian #0F0F10` ·
`obsidianRaised #161618` · `slate #1A1A1A` · `gold #D4AF37` ·
`goldBright #E5C76B` · `goldDeep #A8862E` · `textPrimary #FFFFFF` ·
`textSecondary #A0A0A0` · `textMuted #6A6A6E` · `ok #22C55E` ·
`error #EF4444` · `alabaster #F5F4F2` · `onyx #1A1A1A`

Status semantics stay recognizably green/amber/red by design. Gold accent on
void clears WCAG AA (~7.5:1).
