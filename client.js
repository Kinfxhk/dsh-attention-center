window.__ModuleLoader__.load({
  id: '@local/attention-center',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useState, useSyncExternalStore } = React

    const NS = 'attention-center'
    const PANEL_ID = 'attention-center'
    const STORAGE_KEY = 'dsh.attention-center.v1'
    const HISTORY_LIMIT = 40

    const STRINGS = {
      zh: {
        nav: '通知',
        title: '通知',
        subtitle: '任務完成、待核准，或有新訊息時，左側圖示會閃。系統允許的話，也會送出桌面通知。',
        emptyTitle: '目前沒有待處理的事',
        emptyBody: '代理做完、需要你核准，或提出新問題時，會出現在這裡。',
        filterAll: '全部',
        filterOpen: '待處理',
        filterDone: '已完成',
        'kind.done': '任務完成',
        'kind.approval': '待核准',
        'kind.question': '新訊息',
        'kind.plan': '方案待審',
        'kind.test': '測試',
        open: '開啟',
        dismiss: '收起',
        clear: '清除紀錄',
        settings: '提醒方式',
        os: '系統通知',
        osHelp: '送到 Windows 通知中心、macOS 通知中心，或 Linux 桌面通知。',
        hidden: '只在視窗移到背景時',
        hiddenHelp: '你正在看這個視窗時，不彈出系統通知。左側圖示仍會閃。',
        done: '任務完成',
        approval: '待核准',
        question: '新訊息',
        plan: '方案待審',
        subagents: '包含子工作階段',
        sound: '播放聲音',
        permissionGranted: '系統通知已允許',
        permissionDefault: '尚未允許系統通知',
        permissionDenied: '系統通知已被封鎖',
        permissionUnsupported: '這個環境沒有系統通知',
        enable: '允許系統通知',
        test: '測試通知',
        badgeOn: '圖示徽章可用',
        badgeOff: '圖示徽章不可用',
        limitation: 'DSH 本身沒有 Windows、macOS、Linux 的工作列閃爍介面。這裡改用系統通知、圖示數字徽章，以及左側欄圖示閃動。',
        justNow: '剛剛',
        minutes: '{count} 分鐘前',
        hours: '{count} 小時前',
        untitled: '未命名工作階段',
        subagent: '子工作階段',
        testTitle: '通知中心',
        testBody: '這是一則測試。若你看得到系統通知，之後的完成、核准與新訊息也會這樣送出。',
        osFailed: '系統沒有收下這則通知，應用內紀錄已保留。',
      },
      en: {
        nav: 'Attention',
        title: 'Attention',
        subtitle: 'The sidebar icon flashes when work finishes, an approval is waiting, or a new question arrives. A system notification is sent when the platform allows it.',
        emptyTitle: 'Nothing needs you right now',
        emptyBody: 'Finished work, approval requests, and new questions will collect here.',
        filterAll: 'All',
        filterOpen: 'Open',
        filterDone: 'Done',
        'kind.done': 'Finished',
        'kind.approval': 'Approval',
        'kind.question': 'New message',
        'kind.plan': 'Plan review',
        'kind.test': 'Test',
        open: 'Open',
        dismiss: 'Dismiss',
        clear: 'Clear history',
        settings: 'Alerts',
        os: 'System notifications',
        osHelp: 'Windows Action Center, macOS Notification Center, or a Linux desktop notification.',
        hidden: 'Only when the window is in the background',
        hiddenHelp: 'No system toast while this window is focused. The sidebar icon still flashes.',
        done: 'Finished work',
        approval: 'Approvals',
        question: 'New messages',
        plan: 'Plan reviews',
        subagents: 'Include subagent sessions',
        sound: 'Play a sound',
        permissionGranted: 'System notifications allowed',
        permissionDefault: 'System notifications not allowed yet',
        permissionDenied: 'System notifications blocked',
        permissionUnsupported: 'This environment has no system notifications',
        enable: 'Allow system notifications',
        test: 'Send a test',
        badgeOn: 'Icon badge available',
        badgeOff: 'Icon badge unavailable',
        limitation: 'DSH does not expose a Windows, macOS, or Linux taskbar-flash API. This page uses system notifications, an icon badge, and a flashing sidebar icon.',
        justNow: 'Just now',
        minutes: '{count} min ago',
        hours: '{count} hr ago',
        untitled: 'Untitled session',
        subagent: 'Subagent',
        testTitle: 'Attention',
        testBody: 'This is a test. If you can see a system notification, finished work, approvals, and new questions will arrive the same way.',
        osFailed: 'The system did not accept that notification. The in-app record was kept.',
      },
    }

    const DEFAULT_SETTINGS = {
      os: true,
      whenHiddenOnly: true,
      done: true,
      approval: true,
      question: true,
      plan: true,
      subagents: false,
      sound: false,
    }

    function identity(value) {
      return value
    }

    function clip(text, max) {
      const value = String(text || '').replace(/\s+/g, ' ').trim()
      if (value.length <= max) return value
      return value.slice(0, max - 1) + '…'
    }

    function loadSaved() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed : {}
      } catch {
        return {}
      }
    }

    function readPermission() {
      if (typeof Notification !== 'function') return 'unsupported'
      return Notification.permission || 'default'
    }

    function badgeSupported() {
      return typeof navigator !== 'undefined' && typeof navigator.setAppBadge === 'function'
    }

    function platformName() {
      if (typeof document === 'undefined') return 'Web'
      const root = document.documentElement
      if (root.hasAttribute('data-windows-titlebar')) return 'Windows'
      const hinted = root.getAttribute('data-platform')
      if (hinted === 'darwin') return 'macOS'
      if (hinted === 'linux') return 'Linux'
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
      if (/Windows/.test(ua)) return 'Windows'
      if (/Mac OS X/.test(ua)) return 'macOS'
      if (/Linux/.test(ua)) return 'Linux'
      return 'Web'
    }

    function rowsOf(snapshot) {
      if (!snapshot) return []
      if (Array.isArray(snapshot)) return snapshot
      if (snapshot.byId && typeof snapshot.byId === 'object') {
        const ids = Array.isArray(snapshot.ids) ? snapshot.ids : Object.keys(snapshot.byId)
        return ids.map(id => snapshot.byId[id]).filter(Boolean)
      }
      return []
    }

    function idOf(row) {
      return row && (row.id || row.sessionId) || ''
    }

    function titleOf(row) {
      if (!row) return ''
      const direct = [row.title, row.displayTitle, row.name].find(value => typeof value === 'string' && value.trim())
      if (direct) return direct.trim()
      const projected = row.projections && row.projections.values && row.projections.values.title
      if (typeof projected === 'string' && projected.trim()) return projected.trim()
      return ''
    }

    function isSubagent(row) {
      return !!(row && row.origin === 'subagent')
    }

    function isArchived(row) {
      return !!(row && (row.archived === true || row.archivedAt))
    }

    function statusEntries(snapshot) {
      if (!snapshot) return []
      if (typeof snapshot.forEach === 'function' && typeof snapshot.get === 'function') {
        const out = []
        snapshot.forEach((value, id) => out.push([id, value]))
        return out
      }
      if (typeof snapshot === 'object') return Object.entries(snapshot)
      return []
    }

    function selectedPanel(panel) {
      if (typeof panel === 'string') return panel
      if (!panel || typeof panel !== 'object') return 'conversation'
      return panel.selected || panel.panelId || panel.id || panel.key || 'conversation'
    }

    function viewingId(snapshot) {
      for (const row of rowsOf(snapshot)) {
        const retained = row.retainedBy && row.retainedBy.mainView
        if (retained > 0) return idOf(row)
      }
      return ''
    }

    function kindOf(interaction) {
      if (!interaction || typeof interaction !== 'object') return 'question'
      if (interaction.kind === 'approval') return 'approval'
      if (interaction.kind === 'plan-review' || interaction.kind === 'plan') return 'plan'
      const questions = interaction.questions
      if (Array.isArray(questions) && questions[0] && questions[0].intent && questions[0].intent.kind === 'plan-review') return 'plan'
      return 'question'
    }

    function detailOf(interaction, kind) {
      if (!interaction) return ''
      if (kind === 'approval') {
        const display = interaction.displayReason
        const localized = display && typeof display === 'object'
          ? (display.zh || display['zh-Hant'] || display['zh-TW'] || display.en || '')
          : ''
        return clip(localized || interaction.reason || interaction.toolName || '', 180)
      }
      const questions = interaction.questions
      if (Array.isArray(questions) && questions[0]) {
        const question = questions[0]
        const head = question.header ? question.header + ' · ' : ''
        return clip(head + (question.question || ''), 180)
      }
      return ''
    }

    function motionOk() {
      return typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    function syncBadge(count) {
      if (!badgeSupported()) return
      const op = count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge?.()
      Promise.resolve(op).catch(() => undefined)
    }

    function nudgeFrame() {
      if (typeof window === 'undefined') return false
      const bridges = [window.__DSH_DESKTOP__, window.dshDesktop, window.desktop]
      for (const bridge of bridges) {
        if (!bridge) continue
        try {
          if (typeof bridge.flashFrame === 'function') {
            bridge.flashFrame(true)
            return true
          }
          if (typeof bridge.bounceDock === 'function') {
            bridge.bounceDock()
            return true
          }
        } catch {
          /* optional desktop bridge */
        }
      }
      return false
    }

    const saved = loadSaved()
    const store = {
      settings: { ...DEFAULT_SETTINGS, ...(saved.settings && typeof saved.settings === 'object' ? saved.settings : {}) },
      history: Array.isArray(saved.history)
        ? saved.history.filter(item => item && item.id).map(item => ({ ...item, open: false })).slice(0, HISTORY_LIMIT)
        : [],
      known: new Set(),
      acked: new Set(),
      running: new Map(),
      doneSeq: new Map(),
      primed: false,
      attention: 0,
      permission: readPermission(),
      badge: badgeSupported(),
      platform: platformName(),
      osNote: '',
      flashed: false,
      openSession: null,
      listeners: new Set(),
      snapshot: null,
    }
    store.known = new Set(store.history.map(item => item.id))

    function publish() {
      store.snapshot = {
        revision: (store.snapshot?.revision || 0) + 1,
        settings: store.settings,
        history: store.history,
        attention: store.attention,
        permission: store.permission,
        badge: store.badge,
        platform: store.platform,
        osNote: store.osNote,
        flashed: store.flashed,
      }
      for (const listener of store.listeners) listener()
    }

    store.getSnapshot = () => store.snapshot
    store.subscribe = listener => {
      store.listeners.add(listener)
      return () => store.listeners.delete(listener)
    }

    function recount() {
      store.attention = store.history.filter(item => item.open && store.settings[item.kind] !== false && item.kind !== 'test').length
    }

    function persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          settings: store.settings,
          history: store.history.slice(0, HISTORY_LIMIT).map(item => ({ ...item, open: false })),
        }))
      } catch {
        /* private mode or quota */
      }
    }

    function trim() {
      const open = store.history.filter(item => item.open)
      const closed = store.history.filter(item => !item.open)
      store.history = [...open, ...closed].slice(0, HISTORY_LIMIT)
    }

    function upsert(item) {
      const index = store.history.findIndex(entry => entry.id === item.id)
      if (index === -1) store.history.unshift(item)
      else store.history[index] = { ...store.history[index], ...item, at: store.history[index].at || item.at }
    }

    function shouldOs(item, context) {
      if (!store.settings.os || store.settings[item.kind] === false) return false
      if (store.permission !== 'granted') return false
      const looking = context.focused && context.panel === 'conversation' && context.viewingId === item.sessionId
      if (looking) return false
      if (store.settings.whenHiddenOnly && context.focused) return false
      return true
    }

    function fire(item, translate) {
      if (typeof Notification !== 'function' || Notification.permission !== 'granted') return
      const headline = translate('kind.' + item.kind) + ' · ' + (item.title || translate('untitled'))
      const body = item.detail || item.title || translate('untitled')
      try {
        const note = new Notification(headline, {
          body,
          tag: item.id,
          silent: !store.settings.sound,
        })
        note.onclick = () => {
          try { window.focus() } catch { /* ignore */ }
          if (item.sessionId && store.openSession) store.openSession(item.sessionId)
        }
        store.osNote = ''
        store.flashed = nudgeFrame() || store.flashed
      } catch {
        store.osNote = 'failed'
      }
    }

    store.reconcile = function reconcile(statusSnapshot, sessionSnapshot, panelSnapshot, translate) {
      if (sessionSnapshot && sessionSnapshot.phase === 'pending') return
      const rows = rowsOf(sessionSnapshot)
      const byId = new Map()
      for (const row of rows) {
        const id = idOf(row)
        if (id) byId.set(id, row)
      }
      const baseline = !store.primed
      const created = []
      const openIds = new Set()
      const now = Date.now()
      const seenRunning = new Set()

      for (const [sessionId, status] of statusEntries(statusSnapshot)) {
        if (!sessionId || !status || typeof status !== 'object') continue
        const row = byId.get(sessionId)
        if (row && isArchived(row)) continue
        if (row && isSubagent(row) && !store.settings.subagents) continue
        seenRunning.add(sessionId)
        const running = status.running === true
        const was = store.running.get(sessionId)
        if (!baseline && was === true && !running && !(row && row.blank)) {
          const seq = (store.doneSeq.get(sessionId) || 0) + 1
          store.doneSeq.set(sessionId, seq)
          const id = 'done:' + sessionId + ':' + seq
          openIds.add(id)
          if (!store.known.has(id) && !store.acked.has(id)) {
            created.push({
              id,
              kind: 'done',
              sessionId,
              title: titleOf(row),
              detail: '',
              subagent: isSubagent(row),
              at: now,
              open: true,
            })
            store.known.add(id)
          }
        }
        store.running.set(sessionId, running)

        const interaction = status.pendingInteraction
        if (interaction && !(row && row.blank && !interaction)) {
          const kind = kindOf(interaction)
          const id = String(interaction.key || kind + ':' + sessionId)
          if (!store.acked.has(id)) openIds.add(id)
          if (!store.known.has(id)) {
            created.push({
              id,
              kind,
              sessionId,
              title: titleOf(row),
              detail: detailOf(interaction, kind),
              subagent: isSubagent(row),
              at: now,
              open: true,
            })
            store.known.add(id)
          } else if (!store.acked.has(id)) {
            upsert({
              id,
              open: true,
              title: titleOf(row) || undefined,
              detail: detailOf(interaction, kind),
            })
          }
        }

        if (status.completionUnread && !(row && row.blank)) {
          const hasDone = created.some(item => item.sessionId === sessionId && item.kind === 'done')
            || store.history.some(item => item.open && item.kind === 'done' && item.sessionId === sessionId)
          if (!hasDone) {
            const id = 'done:' + sessionId + ':unread'
            if (!store.acked.has(id)) openIds.add(id)
            if (!store.known.has(id)) {
              created.push({
                id,
                kind: 'done',
                sessionId,
                title: titleOf(row),
                detail: '',
                subagent: isSubagent(row),
                at: now,
                open: true,
              })
              store.known.add(id)
            }
          }
        }

        if (viewingId(sessionSnapshot) === sessionId && !status.completionUnread) {
          for (const item of store.history) {
            if (item.sessionId === sessionId && item.kind === 'done') item.open = false
          }
        }
      }

      for (const item of created) upsert(item)
      for (const item of store.history) {
        if (item.kind !== 'test' && item.kind !== 'done' && item.open && !openIds.has(item.id)) item.open = false
        const row = byId.get(item.sessionId)
        const nextTitle = titleOf(row)
        if (nextTitle) item.title = nextTitle
      }

      const context = {
        focused: typeof document !== 'undefined' && document.hasFocus() && !document.hidden,
        panel: selectedPanel(panelSnapshot),
        viewingId: viewingId(sessionSnapshot),
      }
      if (!baseline) {
        for (const item of created) {
          if (shouldOs(item, context)) fire(item, translate)
        }
        if (created.length) store.flashed = nudgeFrame() || store.flashed
      }
      store.primed = true
      trim()
      recount()
      publish()
      persist()
    }

    store.setSetting = function setSetting(key, value) {
      store.settings = { ...store.settings, [key]: value }
      recount()
      publish()
      persist()
      syncBadge(store.attention)
    }

    store.dismiss = function dismiss(id) {
      const item = store.history.find(entry => entry.id === id)
      if (!item) return
      if (item.open && (item.kind === 'approval' || item.kind === 'question' || item.kind === 'plan')) return
      item.open = false
      store.acked.add(id)
      recount()
      publish()
      persist()
      syncBadge(store.attention)
    }

    store.clearClosed = function clearClosed() {
      store.history = store.history.filter(item => item.open)
      recount()
      publish()
      persist()
    }

    store.requestPermission = async function requestPermission() {
      if (typeof Notification !== 'function') {
        store.permission = 'unsupported'
        publish()
        return store.permission
      }
      try {
        store.permission = await Notification.requestPermission()
      } catch {
        store.permission = 'denied'
      }
      publish()
      return store.permission
    }

    store.pushTest = function pushTest(translate) {
      const item = {
        id: 'test:' + Date.now(),
        kind: 'test',
        sessionId: '',
        title: translate('testTitle'),
        detail: translate('testBody'),
        at: Date.now(),
        open: false,
      }
      store.history.unshift(item)
      store.known.add(item.id)
      trim()
      if (store.permission === 'granted') {
        try {
          const note = new Notification(translate('testTitle'), {
            body: translate('testBody'),
            tag: 'attention-center-test',
            silent: !store.settings.sound,
          })
          note.onclick = () => {
            try { window.focus() } catch { /* ignore */ }
          }
          store.osNote = ''
          store.flashed = nudgeFrame() || store.flashed
        } catch {
          store.osNote = 'failed'
        }
      }
      publish()
      persist()
    }

    publish()

    const CSS = `
      .ac-page { box-sizing: border-box; height: 100%; min-height: 0; overflow: auto; padding: calc(var(--dsh-frame-top-clearance, 20px) + 12px) 28px 40px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font-size: 14px; line-height: 1.45; container-type: inline-size; }
      .ac-wrap { max-width: 760px; }
      .ac-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; margin-bottom: 16px; }
      .ac-brand { display: flex; gap: 12px; align-items: flex-start; min-width: 0; }
      .ac-tile { width: 40px; height: 40px; flex: none; display: grid; place-items: center; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .ac-title { margin: 0 0 4px; font-size: 22px; font-weight: 640; letter-spacing: 0; }
      .ac-sub, .ac-note, .ac-meta, .ac-help { color: var(--dsw-alias-label-secondary); }
      .ac-sub { margin: 0; max-width: 62ch; }
      .ac-tools { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
      .ac-btn, .ac-filter, .ac-switch { font: inherit; color: var(--dsw-alias-label-primary); }
      .ac-btn, .ac-filter { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 999px; padding: 6px 12px; cursor: pointer; }
      .ac-btn:hover, .ac-filter:hover { background: var(--dsw-alias-bg-layer-2); }
      .ac-btn:focus-visible, .ac-filter:focus-visible, .ac-switch:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .ac-btn.primary { background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); border-color: transparent; }
      .ac-btn.ghost { background: transparent; }
      .ac-btn:disabled { opacity: 0.55; cursor: default; }
      .ac-chips, .ac-filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .ac-chips { margin-bottom: 14px; }
      .ac-chip { border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; padding: 3px 10px; font-size: 12px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); }
      .ac-chip.ok { color: var(--dsw-alias-state-success-primary); }
      .ac-chip.warn { color: var(--dsw-alias-state-warn-primary); }
      .ac-chip.bad { color: var(--dsw-alias-state-error-primary); }
      .ac-filters { margin-bottom: 14px; }
      .ac-filter.on { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .ac-filter em { font-style: normal; margin-left: 6px; color: var(--dsw-alias-label-secondary); }
      .ac-settings { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 14px; padding: 4px 14px; margin-bottom: 14px; }
      .ac-setting { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .ac-setting:last-child { border-bottom: 0; }
      .ac-setting-title { font-size: 14px; line-height: 20px; }
      .ac-help { margin-top: 2px; font-size: 12px; line-height: 16px; max-width: 52ch; }
      .ac-switch { width: 36px; height: 22px; flex: none; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); padding: 0; position: relative; cursor: pointer; }
      .ac-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
      .ac-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-primary); }
      .ac-switch[aria-checked="true"] .ac-knob { transform: translateX(14px); background: var(--dsw-alias-bg-base); }
      .ac-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
      .ac-card { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }
      .ac-card.open { border-color: var(--dsw-alias-border-l2); }
      .ac-mark { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); }
      .ac-mark.done { background: var(--dsw-alias-state-success-primary); }
      .ac-mark.approval, .ac-mark.plan { background: var(--dsw-alias-state-warn-primary); }
      .ac-mark.question, .ac-mark.test { background: var(--dsw-alias-brand-primary); }
      .ac-mark.hot { box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 22%, transparent); }
      .ac-kind { font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .ac-card h3 { margin: 2px 0 0; font-size: 15px; font-weight: 640; overflow-wrap: anywhere; }
      .ac-card p { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .ac-meta { margin-top: 6px; font-size: 12px; }
      .ac-card-actions { display: flex; gap: 6px; }
      .ac-empty { border: 1px dashed var(--dsw-alias-border-l2); border-radius: 16px; padding: 28px 18px; text-align: center; background: var(--dsw-alias-bg-layer-1); }
      .ac-empty h2 { margin: 10px 0 4px; font-size: 16px; font-weight: 640; }
      .ac-empty p { margin: 0 auto; max-width: 46ch; color: var(--dsw-alias-label-secondary); }
      .ac-note { margin: 16px 0 0; font-size: 12px; max-width: 68ch; }
      .ac-warn { margin: 0 0 12px; color: var(--dsw-alias-state-warn-primary); }
      @media (prefers-reduced-motion: reduce) {
        .ac-knob { transition: none; }
      }
      @container (max-width: 640px) {
        .ac-head, .ac-card { display: block; }
        .ac-tools, .ac-card-actions { margin-top: 12px; }
        .ac-mark { display: inline-block; margin-bottom: 8px; }
      }
    `

    function useAttention() {
      return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
    }

    function Bell(props) {
      const size = props.size || 16
      const hot = !!props.hot
      const steady = !!props.steady
      const nodes = [
        h('path', { d: 'M12 4.2v1.4' }),
        h('path', { d: 'M7 10.3a5 5 0 0 1 10 0V14l1.2 1.6H5.8L7 14z' }),
        h('path', { d: 'M9.8 16.8a2.2 2.2 0 0 0 4.4 0' }),
      ]
      if (hot || steady) {
        nodes.push(h('circle', {
          cx: 17.4,
          cy: 6.3,
          r: 2.15,
          fill: 'var(--dsw-alias-state-warn-primary)',
          stroke: 'none',
        }))
      }
      if (hot && motionOk()) {
        nodes.push(h('circle', {
          cx: 17.4,
          cy: 6.3,
          r: 2.15,
          fill: 'none',
          stroke: 'var(--dsw-alias-state-warn-primary)',
          strokeWidth: 1.1,
        },
        h('animate', { attributeName: 'r', values: '2.2;4.8;2.2', dur: '1.2s', repeatCount: 'indefinite' }),
        h('animate', { attributeName: 'opacity', values: '0.8;0;0.8', dur: '1.2s', repeatCount: 'indefinite' })))
      }
      return h('svg', {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: props.active ? 1.9 : 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }, nodes)
    }

    function Icon(props) {
      const snap = useAttention()
      const hot = snap.attention > 0 && !props.active
      return h(Bell, { size: props.size || 16, active: props.active, hot, steady: snap.attention > 0 && !!props.active })
    }

    function Watch(props) {
      const status = props.useSessionStatus(identity)
      const sessions = props.useSessions(identity)
      const panel = props.usePanelInfo(identity)
      useEffect(() => {
        try {
          store.reconcile(status, sessions, panel, props.text)
          syncBadge(store.attention)
        } catch (error) {
          console.error('[attention-center]', error)
        }
      }, [status, sessions, panel, props.text])
      return null
    }

    function formatWhen(at, now, text) {
      const delta = Math.max(0, now - at)
      if (delta < 60000) return text('justNow')
      const minutes = Math.floor(delta / 60000)
      if (minutes < 60) return text('minutes', { count: minutes })
      return text('hours', { count: Math.floor(minutes / 60) })
    }

    function Page(props) {
      const snap = useAttention()
      const text = props.text
      const [filter, setFilter] = useState('open')
      const [settingsOpen, setSettingsOpen] = useState(() => snap.permission !== 'granted')
      const [now, setNow] = useState(() => Date.now())
      const [busy, setBusy] = useState(false)
      useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30000)
        return () => clearInterval(id)
      }, [])

      const openCount = snap.history.filter(item => item.open).length
      const shown = snap.history.filter(item => {
        if (filter === 'open') return item.open
        if (filter === 'done') return !item.open
        return true
      })
      const permissionKey = snap.permission === 'granted'
        ? 'permissionGranted'
        : snap.permission === 'denied'
          ? 'permissionDenied'
          : snap.permission === 'unsupported'
            ? 'permissionUnsupported'
            : 'permissionDefault'
      const permissionTone = snap.permission === 'granted' ? 'ok' : snap.permission === 'denied' ? 'bad' : 'warn'

      async function enable() {
        setBusy(true)
        try { await store.requestPermission() } finally { setBusy(false) }
      }
      async function test() {
        setBusy(true)
        try {
          if (store.permission === 'default') await store.requestPermission()
          store.pushTest(text)
        } finally { setBusy(false) }
      }

      return h('div', { className: 'ac-page' },
        h('div', { className: 'ac-wrap' },
          h('header', { className: 'ac-head' },
            h('div', { className: 'ac-brand' },
              h('div', { className: 'ac-tile' }, h(Bell, { size: 22, hot: snap.attention > 0, steady: false })),
              h('div', null,
                h('h1', { className: 'ac-title' }, text('title')),
                h('p', { className: 'ac-sub' }, text('subtitle')))),
            h('div', { className: 'ac-tools' },
              snap.permission !== 'granted' && snap.permission !== 'unsupported'
                ? h('button', { type: 'button', className: 'ac-btn primary', disabled: busy, onClick: enable }, text('enable'))
                : null,
              h('button', { type: 'button', className: 'ac-btn', disabled: busy, onClick: test }, text('test')),
              h('button', { type: 'button', className: 'ac-btn ghost', onClick: () => store.clearClosed() }, text('clear')))),
          h('div', { className: 'ac-chips' },
            h('span', { className: 'ac-chip' }, snap.platform),
            h('span', { className: 'ac-chip ' + permissionTone }, text(permissionKey)),
            h('span', { className: 'ac-chip' }, text(snap.badge ? 'badgeOn' : 'badgeOff'))),
          snap.osNote === 'failed' ? h('p', { className: 'ac-warn' }, text('osFailed')) : null,
          h('div', { className: 'ac-filters', role: 'tablist' },
            [['open', 'filterOpen', openCount], ['all', 'filterAll', snap.history.length], ['done', 'filterDone', snap.history.length - openCount]].map(([id, key, count]) =>
              h('button', {
                key: id,
                type: 'button',
                className: 'ac-filter' + (filter === id ? ' on' : ''),
                role: 'tab',
                'aria-selected': filter === id ? 'true' : 'false',
                onClick: () => setFilter(id),
              }, text(key), h('em', null, String(count))))),
          h('div', null,
            h('button', {
              type: 'button',
              className: 'ac-btn ghost',
              'aria-expanded': settingsOpen ? 'true' : 'false',
              onClick: () => setSettingsOpen(value => !value),
            }, text('settings')),
            settingsOpen ? h('div', { className: 'ac-settings' },
              [
                ['os', 'os', 'osHelp'],
                ['whenHiddenOnly', 'hidden', 'hiddenHelp'],
                ['done', 'done'],
                ['approval', 'approval'],
                ['question', 'question'],
                ['plan', 'plan'],
                ['subagents', 'subagents'],
                ['sound', 'sound'],
              ].map(([key, label, help]) => h('div', { className: 'ac-setting', key },
                h('div', null,
                  h('div', { className: 'ac-setting-title' }, text(label)),
                  help ? h('div', { className: 'ac-help' }, text(help)) : null),
                h('button', {
                  type: 'button',
                  className: 'ac-switch',
                  role: 'switch',
                  'aria-checked': snap.settings[key] ? 'true' : 'false',
                  'aria-label': text(label),
                  onClick: () => store.setSetting(key, !snap.settings[key]),
                }, h('span', { className: 'ac-knob' }))))) : null),
          shown.length === 0
            ? h('div', { className: 'ac-empty' },
              h(Bell, { size: 36 }),
              h('h2', null, text('emptyTitle')),
              h('p', null, text('emptyBody')))
            : h('ul', { className: 'ac-list', 'aria-live': 'polite' }, shown.map(item => h('li', { key: item.id },
              h('article', { className: 'ac-card' + (item.open ? ' open' : '') },
                h('span', { className: 'ac-mark ' + item.kind + (item.open ? ' hot' : ''), 'aria-hidden': true }),
                h('div', null,
                  h('div', { className: 'ac-kind' }, text('kind.' + item.kind) + (item.subagent ? ' · ' + text('subagent') : '')),
                  h('h3', null, item.title || text('untitled')),
                  item.detail ? h('p', null, item.detail) : null,
                  h('div', { className: 'ac-meta' }, formatWhen(item.at, now, text))),
                h('div', { className: 'ac-card-actions' },
                  item.sessionId ? h('button', {
                    type: 'button',
                    className: 'ac-btn',
                    onClick: () => props.openSession && props.openSession(item.sessionId),
                  }, text('open')) : null,
                  item.kind === 'done' || item.kind === 'test' || !item.open
                    ? h('button', { type: 'button', className: 'ac-btn ghost', onClick: () => store.dismiss(item.id) }, text('dismiss'))
                    : null))))),
          h('p', { className: 'ac-note' }, text('limitation'))))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.get('locale')
        let translate = (key, vars) => {
          const table = STRINGS.zh[key] ? STRINGS.zh : STRINGS.en
          let value = STRINGS.zh[key] || STRINGS.en[key] || key
          if (table && STRINGS.en[key] && !STRINGS.zh[key]) value = STRINGS.en[key]
          if (vars) {
            for (const [name, replacement] of Object.entries(vars)) value = value.replaceAll('{' + name + '}', String(replacement))
          }
          return value
        }
        if (locale) {
          ctx.effect(() => {
            try {
              return locale.register(NS, { zh: STRINGS.zh, en: STRINGS.en })
            } catch {
              const dispose = []
              for (const id of ['zh', 'en']) {
                try { dispose.push(locale.register(NS, id, STRINGS[id])) } catch { /* local text remains */ }
              }
              return () => { for (const fn of dispose) fn() }
            }
          }, 'attention-center: dictionaries')
          try {
            const bound = locale.bind(NS)
            translate = (key, vars) => {
              let value = key
              try { value = vars ? bound(key, vars) : bound(key) } catch { value = STRINGS.zh[key] || STRINGS.en[key] || key }
              if (typeof value !== 'string' || !value) value = STRINGS.zh[key] || STRINGS.en[key] || key
              if (vars) {
                for (const [name, replacement] of Object.entries(vars)) value = String(value).replaceAll('{' + name + '}', String(replacement))
              }
              return value
            }
          } catch { /* local text remains */ }
        }

        function openSession(id) {
          if (!id) return
          for (const item of store.history.slice()) {
            if (item.sessionId === id && item.kind === 'done') store.dismiss(item.id)
          }
          const workspace = ctx.get('uiWorkspace')
          const layout = ctx.get('layout')
          if (workspace && typeof workspace.openSession === 'function') workspace.openSession(id)
          if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(null)
        }
        store.openSession = openSession

        ctx.effect(() => {
          const tag = document.createElement('style')
          tag.dataset.plugin = '@local/attention-center'
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => {
            tag.remove()
            if (typeof navigator !== 'undefined' && typeof navigator.clearAppBadge === 'function') {
              navigator.clearAppBadge().catch(() => undefined)
            }
          }
        }, 'attention-center: styles')

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 4,
          label: () => translate('nav'),
          locale: NS,
        }, Icon))
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({ text: translate, openSession }),
        }, Page))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'attention-center-watch',
          order: 80,
          locale: NS,
          inject: () => ({ text: translate }),
        }, Watch))
      },
    }
  },
})
