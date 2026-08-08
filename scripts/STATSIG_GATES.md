# Statsig Remote-Control Mapping

Read this document in English or open the [Simplified Chinese mapping](STATSIG_GATES.zh-CN.md).

Extracted by AST analysis of the upstream bundle `index-MmO6ZWIv.js`. IDs are
Statsig DJB2 hashes; the original names are only present on the server.

## Feature Gates (30)

| ID | Feature | Component or function | Description |
|---|---|---|---|
| `505458` | Composer Mode | `Pvn` / `Vvn` | Controls composer mode options such as code and ask. |
| `30039772` | `enable_request_compression` | `HUn` | Request compression. |
| `98625937` | Account Settings A | `GNe` | User settings and authentication menu. |
| `351086149` | server-only | — | Not referenced by the client. |
| `351460523` | Follow-up Queue | `Iwn` | Automatic follow-up suggestions. |
| `1060282072` | Collaboration UI | `mae` / `NRn` / `jjn` | Collaboration-mode components. |
| `1156958996` | `collaboration_modes` | `HUn` | Collaboration-mode feature flag. |
| `1221508807` | Archive Thread | `ef` | Archives conversation threads. |
| `1230000863` | server-only | — | Not referenced by the client. |
| `1444479692` | `personality` | `LZe` / `HUn` | Personality configuration. |
| `1609556872` | Hotkey Window | `jxn` | Keyboard shortcut window. |
| `1823130936` | Image Input | `ICn` | Checks image-input model support. |
| `1846562237` | Onboarding Login | `TFn` | Login flow and resume control. |
| `2239678350` | server-only | — | Not referenced by the client. |
| `2313552244` | server-only | — | Not referenced by the client. |
| `2451719447` | server-only | — | Not referenced by the client. |
| `2761175068` | Feature Rollout | `PXe` | General feature-rollout wrapper. |
| `2777274066` | server-only | — | Not referenced by the client. |
| `2878153158` | server-only | — | Not referenced by the client. |
| `2882842607` | Diff and Comments | `Uae` | Code diffs and comments in conversations. |
| `2968710568` | server-only | — | Not referenced by the client. |
| `3075919032` | Main Layout | `iUt` | Drag-and-drop panel layout. |
| `3189729426` | server-only | — | Not referenced by the client. |
| `3227700559` | ChatGPT Auth Flow | `QBn` | Detects the ChatGPT auth method. |
| `3390468622` | `request_rule` | `HUn` | Request rules. |
| `3798472673` | server-only | — | Not referenced by the client. |
| `4059535852` | server-only | — | Not referenced by the client. |
| `4100906017` | Voice Input | `Gxn` | Dictation feature. |
| `4166894088` | Account Settings B | `GNe` | Uses the same function as `98625937`. |
| `4276547895` | server-only | — | Not referenced by the client. |
| **`2929582856`** | **App Sunset** | **`aUn`** | **Full-screen block; patched by this project.** |

### HUn Registry Mapping

```text
gate 30039772   -> enable_request_compression
gate 1786883712 -> unified_exec
gate 1615536597 -> shell_snapshot
gate 770526561  -> remote_models
gate 2828273915 -> responses_websockets
gate 2734851136 -> responses_websockets_v2
gate 1156958996 -> collaboration_modes
gate 1444479692 -> personality
gate 3390468622 -> request_rule
gate 2357796820 -> apps
gate 2911102190 -> sqlite
gate 2307253562 -> codex_git_commit
```

These 12 gates are registered in HUn, but some are absent from the 30 gates
actually delivered to the client. This indicates that the server sends only a
user-specific subset.

## Dynamic Configs (15)

| ID | Feature | Component or function | Description |
|---|---|---|---|
| `107580212` | Model Config | `ZEe` | Fetches the available model list. |
| `1121645430` | A/B Experiment | `zge` | Gets the experiment group name. |
| `3210878109` | Personality Config | `LZe` | Gets personality parameters. |
| Other 12 | server-only | — | Not directly referenced by the client. |

## Layers (6)

| ID | Feature | Component or function | Description |
|---|---|---|---|
| `72216192` | i18n Layer | `jjt` / `Xkn` / `tWn` | Parameters such as `enable_i18n` and `locale_source`. |
| `745800994` | WebSocket Layer | `HUn` | `responses_websockets` behavior. |
| `3902942138` | Git Commit Layer | `HUn` | `codex_git_commit` behavior. |
| Other 3 | server-only | — | Not directly referenced by the client. |

## Active Patch Scripts

| Script | Target | Strategy |
|---|---|---|
| `patch-i18n.js` | `qNe()` | Adds `en-US` to the language selector. |
| `patch-devtools.js` | `allowInspectElement` / `devTools` | Forces the properties to `true`. |
| `patch-fast-mode.js` | Fast mode auth gates | Removes the Fast mode authentication gate. |
| `patch-plugin-auth.js` | Plugin and browser-use gates | Relaxes plugin, browser, and related feature gates. |
| `patch-updater.js` | Sparkle and Windows updater | Disables desktop auto-update methods. |
| `patch-copyright.js` | About Dialog / `setAboutPanelOptions` | Replaces the displayed copyright text. |

These scripts are executed by `patch-all.js` for the platform selected by the
build workflow.

## Supplemental Analysis Patches

| Script | Target | Status |
|---|---|---|
| `patch-sunset.js` | App sunset gate | Available for targeted analysis or manual use; not in the default `patch-all.js` sequence. |
| `patch-statsig-logger.js` | Statsig status logging | Diagnostic helper; not part of the default release patch set. |

## Notes

- Statsig uses `(hash << 5) - hash + charCode`, then converts with `>>> 0`.
- The hash input is the original server-side name; the client does not store it.
- All gates default to `FALSE` when logged out or offline.
- `2929582856` (sunset) is not in the regular 30-gate payload and may be
  activated by lazy loading or special conditions.

This document describes the inputs we analyze and the custom patch layer we
maintain; it does not imply that this repository is an unmodified upstream
bundle.
