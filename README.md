# DSH Attention Center

左側欄通知中心。任務完成、待核准、新問題或方案待審時，側欄圖示會閃；系統允許時，再送出 Windows、macOS 或 Linux 桌面通知。

Sidebar inbox for DeepSeek Harness. The icon flashes when work finishes, an approval is waiting, or a new question arrives. A system notification is sent only when the platform allows it.

## Install

Clone this repository, then install the directory as a bundle in the current DSH profile:

```text
plugin_manager install_bundle <path-to-this-directory>
```

The package name is `@local/attention-center`. It needs DSH `0.2.1-rc.5` or newer.

## What it does

- Adds a **通知 / Attention** entry to the left sidebar.
- Keeps an in-app inbox for finished work, approvals, questions, and plan reviews.
- Flashes the sidebar icon while something still needs you.
- Uses the browser Notification API for system toasts, and `setAppBadge` when the runtime supports an icon badge.

DSH does not expose a Windows, macOS, or Linux taskbar-flash API. This plugin does not claim to flash the taskbar or Dock icon itself.

Open the page and choose **允許系統通知 / Allow system notifications**, then **測試通知 / Send a test**, before expecting a desktop toast.
