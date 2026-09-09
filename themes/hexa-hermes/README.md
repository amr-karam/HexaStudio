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
| `windows-terminal-scheme.json` | Windows Terminal (`schemes` + `profiles.defaults.colorScheme`) | `HEXA Hermes` scheme, default for all profiles |
| `vscode-colorCustomizations.json` | VS Code (`workbench.colorCustomizations`) | Overlay only — your base color theme is untouched |
| `powershell-psreadline.ps1` | PowerShell 7 PSReadLine (dot-sourced from `$PROFILE`) | Gold command line, deep-gold ghost text |
| Windows accent (registry) | Taskbar / Start / window borders | `HKCU\...\DWM ColorizationColor` → gold (no file — see §8) |

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

## 4. Windows Terminal

Scheme `HEXA Hermes` added to `schemes` and set as
`profiles.defaults.colorScheme`, so every profile (PowerShell, WSL, Git Bash)
uses it. Open a new tab to see it.

Revert: restore `settings.json.pre-hexa-hermes.bak` (same folder).

## 5. VS Code

`workbench.colorCustomizations` appended to user `settings.json` — void
editor, obsidian sidebar, gold status bar / buttons / focus. Your base color
theme is not changed; reload the window if colors don't appear at once.

Revert: restore `settings.json.pre-hexa-hermes.bak` (same folder).

## 6. PowerShell 7 (PSReadLine)

`$PROFILE` dot-sources `powershell-psreadline.ps1` (guarded by `Test-Path`,
so a moved repo can't break shell startup): bright-gold commands,
soft-gray parameters, deep-gold inline ghost text. Open a new terminal tab.

Key set verified against PSReadLine 2.4 — `Prediction` is not a valid
`Colors` key there (`InlinePrediction` is); don't re-add it without
re-probing (`Set-PSReadLineOption -Colors @{key = ...}` per key).

Revert: delete
`Documents\PowerShell\Microsoft.PowerShell_profile.ps1`.

## 7. Windows accent color

```powershell
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\DWM" `
  -Name ColorizationColor -Value ([uint32]"0xC4D4AF37")
```

Gold taskbar / Start / borders (dark mode + `ColorPrevalence` already on).
Takes effect immediately; sign out/in if any surface lags.

Revert: old value was blue `0xC40C767B`
(`([uint32]"0xC40C767B")`), or double-click the backup
`~\.hexa-hermes-backups\dwm-color.pre-hexa-hermes.reg`.

## 8. Left untouched on purpose

- Codex `appearanceDarkCodeThemeId` / `LightCodeThemeId` (`vercel`/`notion`):
  valid IDs aren't enumerable from the installed bundle (packed resources),
  so no value was invented — override in Codex settings if you know a warmer
  code theme ID.
- Hermes running gateways were not restarted: the skin watcher repaints live,
  and the `hermes update` gateway notice predates this work.

## Design note
Core surfaces stay 100% canonical. One exception: a terminal needs 16
functionally distinct ANSI slots and the brand palette has no blue/purple/cyan,
so `windows-terminal-scheme.json` uses muted dusty fillers there
(`#6B8CAE` / `#9A7B4F` / `#6FA598` family). They are functional, not brand
tokens — everything else in this folder is canonical.

## Token map (all canonical)

`void #050505` · `voidDeep #020203` · `obsidian #0F0F10` ·
`obsidianRaised #161618` · `slate #1A1A1A` · `gold #D4AF37` ·
`goldBright #E5C76B` · `goldDeep #A8862E` · `textPrimary #FFFFFF` ·
`textSecondary #A0A0A0` · `textMuted #6A6A6E` · `ok #22C55E` ·
`error #EF4444` · `alabaster #F5F4F2` · `onyx #1A1A1A`

Status semantics stay recognizably green/amber/red by design. Gold accent on
void clears WCAG AA (~7.5:1).
