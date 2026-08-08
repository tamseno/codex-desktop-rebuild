# Statsig 云控映射表

英文版：[STATSIG_GATES.md](STATSIG_GATES.md)

通过 AST 分析上游 bundle `index-MmO6ZWIv.js` 提取。ID 是 Statsig DJB2 哈希值，
原始名称只存在于服务端。

## 功能 Gate（30）

| ID | 功能 | 组件或函数 | 说明 |
|---|---|---|---|
| `505458` | Composer 模式 | `Pvn` / `Vvn` | 控制 composer 模式选项，例如 code 和 ask。 |
| `30039772` | `enable_request_compression` | `HUn` | 请求压缩。 |
| `98625937` | 账户设置面板 A | `GNe` | 用户设置和认证下拉菜单。 |
| `351086149` | 仅服务端 | — | 客户端未引用。 |
| `351460523` | Follow-up 排队 | `Iwn` | 自动跟进建议。 |
| `1060282072` | 协作模式 UI | `mae` / `NRn` / `jjn` | 协作模式相关组件。 |
| `1156958996` | `collaboration_modes` | `HUn` | 协作模式功能开关。 |
| `1221508807` | 归档会话 | `ef` | 归档会话线程。 |
| `1230000863` | 仅服务端 | — | 客户端未引用。 |
| `1444479692` | `personality` | `LZe` / `HUn` | 个性化和人格设置。 |
| `1609556872` | 快捷键窗口 | `jxn` | 快捷键窗口功能。 |
| `1823130936` | 图片输入 | `ICn` | 判断模型是否支持图片输入。 |
| `1846562237` | Onboarding 登录 | `TFn` | 登录流程和 resume 控制。 |
| `2239678350` | 仅服务端 | — | 客户端未引用。 |
| `2313552244` | 仅服务端 | — | 客户端未引用。 |
| `2451719447` | 仅服务端 | — | 客户端未引用。 |
| `2761175068` | 功能发布守卫 | `PXe` | 通用 gate 包裹组件。 |
| `2777274066` | 仅服务端 | — | 客户端未引用。 |
| `2878153158` | 仅服务端 | — | 客户端未引用。 |
| `2882842607` | 会话 Diff 与评论 | `Uae` | 对话中的代码 diff 和评论。 |
| `2968710568` | 仅服务端 | — | 客户端未引用。 |
| `3075919032` | 主界面布局 | `iUt` | 拖拽和面板布局。 |
| `3189729426` | 仅服务端 | — | 客户端未引用。 |
| `3227700559` | ChatGPT 认证流 | `QBn` | ChatGPT auth 方式检测。 |
| `3390468622` | `request_rule` | `HUn` | 请求规则。 |
| `3798472673` | 仅服务端 | — | 客户端未引用。 |
| `4059535852` | 仅服务端 | — | 客户端未引用。 |
| `4100906017` | 语音输入 | `Gxn` | dictation 功能。 |
| `4166894088` | 账户设置面板 B | `GNe` | 与 `98625937` 使用同一函数。 |
| `4276547895` | 仅服务端 | — | 客户端未引用。 |
| **`2929582856`** | **App 强制更新** | **`aUn`** | **全屏遮罩阻止使用，由本项目应用补丁。** |

### HUn 注册表映射

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

## 动态配置（15）

| ID | 功能 | 组件或函数 | 说明 |
|---|---|---|---|
| `107580212` | 模型配置 | `ZEe` | 获取可用模型列表。 |
| `1121645430` | A/B 实验分组 | `zge` | 获取 experiment group name。 |
| `3210878109` | Personality 配置 | `LZe` | 获取个性化设置参数。 |
| 其余 12 个 | 仅服务端 | — | 客户端未直接引用。 |

## 配置层（6）

| ID | 功能 | 组件或函数 | 说明 |
|---|---|---|---|
| `72216192` | i18n 配置层 | `jjt` / `Xkn` / `tWn` | `enable_i18n`、`locale_source` 等参数。 |
| `745800994` | WebSocket 特性层 | `HUn` | `responses_websockets` 相关功能。 |
| `3902942138` | Git Commit 特性层 | `HUn` | `codex_git_commit` 相关功能。 |
| 其余 3 个 | 仅服务端 | — | 客户端未直接引用。 |

## 当前主动补丁脚本

| 脚本 | 目标 | 策略 |
|---|---|---|
| `patch-i18n.js` | `qNe()` | 向语言选择器加入 `en-US`。 |
| `patch-devtools.js` | `allowInspectElement` / `devTools` | 将属性值强制设为 `true`。 |
| `patch-fast-mode.js` | Fast mode 认证 gate | 移除 Fast mode 的认证限制。 |
| `patch-plugin-auth.js` | 插件与 browser-use gate | 放宽插件、浏览器和相关功能 gate。 |
| `patch-updater.js` | Sparkle 与 Windows 更新器 | 禁用桌面自动更新方法。 |
| `patch-copyright.js` | About Dialog / `setAboutPanelOptions` | 替换显示的版权文本。 |

这些脚本由 `patch-all.js` 按构建工作流选择的平台执行。

## 补充分析补丁

| 脚本 | 目标 | 状态 |
|---|---|---|
| `patch-sunset.js` | App sunset gate | 可用于定向分析或手动执行，不在默认 `patch-all.js` 序列中。 |
| `patch-statsig-logger.js` | Statsig 状态日志 | 诊断辅助脚本，不属于默认发行补丁集。 |

## 备注

- Statsig DJB2 算法：`(hash << 5) - hash + charCode`，结果使用 `>>> 0` 转为无符号。
- 哈希输入是服务端 gate/config/layer 的原始名称，客户端不保存原始名称。
- 未登录或无网络状态下，所有 gate 默认是 `FALSE`。
- `2929582856`（sunset）不在常规 30 个 gate 下发列表中，可能通过延迟加载或特定条件触发。

本文档描述的是我们分析的输入和维护的自定义补丁层，并不表示本仓库是未经修改的
上游 bundle。
