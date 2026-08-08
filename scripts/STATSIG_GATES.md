# Statsig 云控映射表 / Statsig Remote-Control Mapping

通过 AST 分析上游 bundle `index-MmO6ZWIv.js` 提取。ID 是 Statsig DJB2 哈希值，
原始名称只存在于服务端。

Extracted by AST analysis of the upstream bundle `index-MmO6ZWIv.js`. IDs are
Statsig DJB2 hashes; the original names are only present on the server.

## Feature Gates / 功能 Gate（30）

| ID | 功能 / Feature | 组件或函数 / Component or function | 说明 / Description |
|---|---|---|---|
| `505458` | Composer Mode / Composer 模式 | `Pvn` / `Vvn` | 控制 composer 模式选项（code/ask 等）/ Controls composer mode options such as code and ask. |
| `30039772` | `enable_request_compression` / 请求压缩 | `HUn` | 请求压缩 / Request compression. |
| `98625937` | Account Settings A / 账户设置面板 A | `GNe` | 用户设置和认证下拉菜单 / User settings and authentication menu. |
| `351086149` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `351460523` | Follow-up Queue / Follow-up 排队 | `Iwn` | 自动跟进建议 / Automatic follow-up suggestions. |
| `1060282072` | Collaboration UI / 协作模式 UI | `mae` / `NRn` / `jjn` | 协作模式相关组件 / Collaboration-mode components. |
| `1156958996` | `collaboration_modes` / 协作模式 | `HUn` | 协作模式功能开关 / Collaboration-mode feature flag. |
| `1221508807` | Archive Thread / 归档会话 | `ef` | 归档会话线程 / Archive conversation threads. |
| `1230000863` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `1444479692` | `personality` / 个性化 | `LZe` / `HUn` | 个性化和人格设置 / Personality configuration. |
| `1609556872` | Hotkey Window / 快捷键窗口 | `jxn` | 快捷键窗口功能 / Keyboard shortcut window. |
| `1823130936` | Image Input / 图片输入 | `ICn` | 判断模型是否支持图片输入 / Checks image-input model support. |
| `1846562237` | Onboarding Login / Onboarding 登录 | `TFn` | 登录流程和 resume 控制 / Login flow and resume control. |
| `2239678350` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `2313552244` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `2451719447` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `2761175068` | Feature Rollout / 功能发布守卫 | `PXe` | 通用 gate 包裹组件 / General feature-rollout wrapper. |
| `2777274066` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `2878153158` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `2882842607` | Diff and Comments / 会话 Diff 与评论 | `Uae` | 对话中的代码 diff 和评论 / Code diffs and comments in conversations. |
| `2968710568` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `3075919032` | Main Layout / 主界面布局 | `iUt` | 拖拽和面板布局 / Drag-and-drop panel layout. |
| `3189729426` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `3227700559` | ChatGPT Auth Flow / ChatGPT 认证流 | `QBn` | ChatGPT auth 方式检测 / Detects the ChatGPT auth method. |
| `3390468622` | `request_rule` / 请求规则 | `HUn` | 请求规则 / Request rules. |
| `3798472673` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `4059535852` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| `4100906017` | Voice Input / 语音输入 | `Gxn` | dictation 功能 / Dictation feature. |
| `4166894088` | Account Settings B / 账户设置面板 B | `GNe` | 与 `98625937` 使用同一函数 / Uses the same function as `98625937`. |
| `4276547895` | server-only / 仅服务端 | — | 客户端未引用 / Not referenced by the client. |
| **`2929582856`** | **App Sunset / App 强制更新** | **`aUn`** | **全屏遮罩阻止使用，需 patch / Full-screen block; patched by this project.** |

### HUn 注册表映射 / HUn Registry Mapping

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

以上 12 个 gate 在 HUn 中注册，但部分没有出现在实际下发的 30 个 gate 列表中，
说明服务端只向当前用户下发匹配的 gate 子集。

These 12 gates are registered in HUn, but some are absent from the 30 gates
actually delivered to the client. This indicates that the server sends only a
user-specific subset.

## Dynamic Configs / 动态配置（15）

| ID | 功能 / Feature | 组件或函数 / Component or function | 说明 / Description |
|---|---|---|---|
| `107580212` | Model Config / 模型配置 | `ZEe` | 获取可用模型列表 / Fetches the available model list. |
| `1121645430` | A/B Experiment / A/B 实验分组 | `zge` | 获取 experiment group name / Gets the experiment group name. |
| `3210878109` | Personality Config / Personality 配置 | `LZe` | 获取个性化设置参数 / Gets personality parameters. |
| 其余 12 个 / Other 12 | server-only / 仅服务端 | — | 客户端未直接引用 / Not directly referenced by the client. |

## Layers / 配置层（6）

| ID | 功能 / Feature | 组件或函数 / Component or function | 说明 / Description |
|---|---|---|---|
| `72216192` | i18n Layer / i18n 配置层 | `jjt` / `Xkn` / `tWn` | `enable_i18n`、`locale_source` 等参数 / Parameters such as `enable_i18n` and `locale_source`. |
| `745800994` | WebSocket Layer / WebSocket 特性层 | `HUn` | `responses_websockets` 相关功能 / `responses_websockets` behavior. |
| `3902942138` | Git Commit Layer / Git Commit 特性层 | `HUn` | `codex_git_commit` 相关功能 / `codex_git_commit` behavior. |
| 其余 3 个 / Other 3 | server-only / 仅服务端 | — | 客户端未直接引用 / Not directly referenced by the client. |

## Active Patch Scripts / 当前主动补丁脚本

| Script / 脚本 | Target / 目标 | Strategy / 策略 |
|---|---|---|
| `patch-i18n.js` | `qNe()` | 注入 `en-US` 到语言选择器 / Adds `en-US` to the language selector. |
| `patch-devtools.js` | `allowInspectElement` / `devTools` | 属性值 -> `!0` / Forces the properties to `true`. |
| `patch-fast-mode.js` | Fast mode auth gates / Fast mode 认证 gate | 移除 Fast mode 的认证限制 / Removes the Fast mode authentication gate. |
| `patch-plugin-auth.js` | Plugin and browser-use gates / 插件与浏览器 gate | 放宽插件、浏览器和相关功能 gate / Relaxes plugin, browser, and related feature gates. |
| `patch-updater.js` | Sparkle and Windows updater / Sparkle 与 Windows 更新器 | 禁用桌面自动更新方法 / Disables desktop auto-update methods. |
| `patch-copyright.js` | About Dialog / `setAboutPanelOptions` | 替换版权文本 / Replaces the displayed copyright text. |

These scripts are executed by `patch-all.js` for the platform selected by the
build workflow.

这些脚本由 `patch-all.js` 按构建工作流选择的平台执行。

## Supplemental Analysis Patches / 补充分析补丁

| Script / 脚本 | Target / 目标 | Status / 状态 |
|---|---|---|
| `patch-sunset.js` | App sunset gate / App sunset gate | Available for targeted analysis or manual use; not in the default `patch-all.js` sequence. / 可用于定向分析或手动执行，不在默认 `patch-all.js` 序列中。 |
| `patch-statsig-logger.js` | Statsig status logging / Statsig 状态日志 | Diagnostic helper; not part of the default release patch set. / 诊断辅助脚本，不属于默认发行补丁集。 |

## Notes / 备注

- Statsig DJB2 算法：`(hash << 5) - hash + charCode`，结果 `>>> 0` 转无符号。
  / Statsig uses `(hash << 5) - hash + charCode`, then converts with `>>> 0`.
- 哈希输入是服务端 gate/config/layer 的原始名称，客户端不保存原始名称。
  / The hash input is the original server-side name; the client does not store it.
- 所有 gate 在未登录或无网络状态下默认 `FALSE`。
  / All gates default to `FALSE` when logged out or offline.
- `2929582856`（sunset）不在常规 30 个 gate 下发列表中，可能通过延迟加载或特定
  条件触发。/ `2929582856` (sunset) is not in the regular 30-gate payload and may
  be activated by lazy loading or special conditions.

This document describes the inputs we analyze and the custom patch layer we
maintain; it does not imply that this repository is an unmodified upstream
bundle.

本文档描述的是我们分析的输入和维护的自定义补丁层，并不表示本仓库是未经修改的
上游 bundle。
