# DSH Attention Center · 通知中心

左側欄通知收件箱。任務完成、等你核准、或者 Agent 有新問題，側欄圖示會閃；平台允許時，再送出桌面通知。

Sidebar inbox for DeepSeek Harness: finished work, approvals, and new questions — with a flashing icon and, when the platform allows it, a desktop notification.

## 做啲咩

- 左側欄多一個 **通知** 頁，集中四類事件：任務完成、待核准、新訊息、方案待審。
- 有未處理嘅事，側欄圖示會閃，直到你開嚟睇；支援時亦會顯示數字徽章。
- 可以篩選 **全部 / 待處理 / 已完成**，亦可以一次過清除紀錄。
- 逐項通知開關：系統通知、只喺視窗喺背景時彈、包含子工作階段、播放聲音。
- 系統通知用瀏覽器 Notification API。第一次用要撳 **允許系統通知**，再撳 **測試通知** 試一試。
- 紀錄同設定只留喺你部機（`localStorage`，最多 40 條），唔會上傳。

### 一個誠實嘅限制

DSH 冇提供 Windows／macOS／Linux 工作列閃爍嘅介面。所以呢個 plugin 用三樣嘢代替：系統通知、應用圖示數字徽章、左側欄圖示閃動。唔會扮有 taskbar flash。

## 同系列 DSH 插件

| 插件 / Plugin | 功能 / What it does | 要唔要裝埋 / Also install | Repo |
|---|---|---|---|
| **Attention Center** | 側欄通知收件箱：任務完成、待核准、新問題會閃，系統允許時出桌面通知<br>Sidebar inbox with a flashing icon and optional desktop notifications | 唔使 / None | [dsh-attention-center](https://github.com/Kinfxhk/dsh-attention-center) |
| **Computer Use** | 側欄「電腦」頁：Agent 可以睇窗、click、打字、按鍵、捲動（隨時可以熄）<br>Computer page where the agent observes and operates windows | 要：Windows + Cua driver<br>Yes: Windows + Cua driver | [dsh-computer-use](https://github.com/Kinfxhk/dsh-computer-use) |
| **Model Senses** | `model_senses`：睇圖＋上網搜尋，跟住即時預設 API<br>Vision and web-search tools routed through the live default API | 唔使（用已連線 API）<br>None (uses configured APIs) | [dsh-model-senses](https://github.com/Kinfxhk/dsh-model-senses) |
| **Model Shelf** | 側欄模型架：按 API 篩選、收藏、一撳套用<br>Sidebar shelf to filter, bookmark, and apply models | 唔使 / None | [dsh-model-shelf](https://github.com/Kinfxhk/dsh-model-shelf) |
| **Perplexity Guard** | 修正 Perplexity 嘅 Opus／Sonnet 5.5、GPT-6.1 Sol 請求同 provider 設定<br>Fixes Perplexity requests and provider settings | 要：Perplexity API key<br>Yes: Perplexity API key | [dsh-perplexity-api-fix-plugin](https://github.com/Kinfxhk/dsh-perplexity-api-fix-plugin) |

## 安裝

需要 DSH `0.2.1-rc.5` 或以上。

1. 下載呢個 repo（`git clone`，或者喺 GitHub 撳 **Code → Download ZIP** 再解壓）。
2. 喺 DSH 用 `plugin_manager` 安裝，`target` 填資料夾嘅絕對路徑：

   ```text
   plugin_manager(action: "install_bundle", target: "C:\\path\\to\\dsh-attention-center")
   ```

3. 重啟 DSH，左側欄就會出現 **通知**。
4. 入去撳 **允許系統通知**，再撳 **測試通知**，確認桌面通知通唔通。

## English

A sidebar inbox for DeepSeek Harness. It collects finished work, approvals, new questions, and plan reviews; the sidebar icon flashes while something needs you, and a desktop notification is sent when the platform allows it.

- Filters: All / Open / Done.
- Per-kind toggles: system notifications, background-only, subagents, sound.
- Uses the browser Notification API, `setAppBadge` when available, and local storage (last 40 entries). Nothing leaves your machine.
- No taskbar-flash API is claimed; DSH does not expose one.

Install: clone the repo and run `plugin_manager` with `action: "install_bundle"` and the absolute folder path, then restart DSH.

## License

MIT
