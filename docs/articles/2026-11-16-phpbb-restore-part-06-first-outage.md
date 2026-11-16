---
title: 上線之後的第一次斷線，15 小時與 1 分鐘
description: VPS 凌晨自動重開後 Traefik 沒有起來，三站斷線 15 小時。補上開機防呆、把 log 搬出容器、請 Grok 和 Codex 挑毛病、把告警送到手機。兩天後同樣的重開再發生一次，斷線縮成 1 分鐘，但根因到現在還沒查明。
date: 2026-11-16
tags: ["docker","traefik","monitoring","self-hosting","blog-series"]
author: Clement Tang
series: phpBB Restore Series
seriesTitle: phpBB Restore 系列
seriesIndex: 6
lastModified: 2026-11-16
---

# 上線之後的第一次斷線，15 小時與 1 分鐘

> VPS 凌晨自動重開後 Traefik 沒有起來，三站斷線 15 小時。補上開機防呆、把 log 搬出容器、請 Grok 和 Codex 挑毛病、把告警送到手機。兩天後同樣的重開再發生一次，斷線縮成 1 分鐘，但根因到現在還沒查明。系列文 6 篇之 #6。

## 為什麼還有第六篇

[#5](2026-06-26-phpbb-restore-part-05-lessons) 寫完時，我以為這個系列結束了。論壇上線、備份在跑、外部監測也接上了，剩下的應該只是偶爾看一眼。

上線五個月後，11 月 13 日下午，我在 Gmail 裡看到 UptimeRobot 的通知：三個站全部 DOWN。往回翻，第一封信是河內凌晨 03:02 寄出的。

這篇記錄這次斷線，以及之後三天做的事。值得寫下來，是因為事後補上的防呆，兩天後就被同樣的情境測了一次：第一次斷了 15 小時，第二次 1 分鐘。上線之後的維運很難說服自己值得做，平常什麼事都沒有，它的價值要等下一次事故才看得到。這次剛好兩次都被我看到了。

## 凌晨 03:00 的自動重開

先講這台 VPS 為什麼會在凌晨自己重開。

10 月 PHP 爆出 php2shell，一個不需要登入就能遠端執行程式的漏洞。應變時我順手把整台 VPS 檢查了一輪，發現它已經連續跑了 27 週，自動更新裝好的 11 版核心一直沒生效，因為核心更新要重開機才會套用。於是我讓 unattended-upgrades 在需要重開時，固定在 UTC 20:00，也就是河內凌晨 3 點自動重開。

這個取捨我想得很清楚。歷史保存站半夜沒人逛，偶爾斷一分鐘，換安全更新自動生效，很划算。Traefik 的 log 每天都有人在掃 `wp-login.php` 之類的路徑，這台機器一直暴露在網路上，修補拖著不上的風險比較大。

11 月 12 日 UTC 20:00:04，unattended-upgrades 裝完新核心，照設定重開。事後翻 journal，關機過程有一個細節：Traefik 比 dockerd 早 9 秒自己結束，exit code 是 0，其他五個容器則是 dockerd 關機時由它停掉的。開機後 dockerd 把那五個容器拉了起來，Traefik 停在 `Exited (0)`。

Traefik 的 restart policy 是 `unless-stopped`。照文件的意思，只要我沒有手動 `docker stop`，dockerd 開機時就該把它拉起來。實際上沒有。

[#4](2026-06-24-phpbb-restore-part-04-infrastructure) 寫過 Traefik 是三站共用的入口，它倒下，後面的 phpBB 兩站和 WordPress 就算都活著也連不到。這次就是這樣。資料庫和應用程式全程在跑，資料沒有任何損失，但對外看起來三站全掛，連 TLS 憑證都拿不到。

修復本身只要一行 `docker compose up -d traefik`。難的是為什麼會發生。我在 11-13 當天手動重開了一次做測試，六個容器全部起來，Traefik 沒掉。重現不了，就確認不了原因。

所以我先補了一層不依賴原因的防呆：一個 systemd oneshot 服務，開機後等 docker 起來，再等 20 秒，到 `/opt/phpbb` 執行一次 `docker compose up -d`。不管 dockerd 為什麼漏掉哪個容器，compose 都會把沒在跑的補起來。

## 補洞時又踩到的坑

防呆寫好，第一次手動執行，compose 除了補啟動，還順手重建了 eq 和 eq2 兩個容器。

追下去才知道，10 月 23 日我改過 `docker-compose.yml`，當時只對 Traefik 跑了 `up -d`，eq 和 eq2 就一直跑著舊設定，三個禮拜沒人發現。`docker compose up -d` 看到設定和現在的容器不一致，就會重建，這次等於被它補對齊了。兩站重建後正常，算是運氣好。

這件事讓我發現 oneshot 原本的寫法有問題。開機在凌晨，沒有人看著，如果那時 compose 檔又有漂移，開機防呆就會在無人看管下重建容器，套用一份沒人驗證過的設定。於是改成 `--no-recreate`，只啟動停著的容器，已經在跑的不動：

```ini
[Service]
Type=oneshot
WorkingDirectory=/opt/phpbb
ExecStartPre=/bin/sleep 20
# --no-recreate: only start stopped containers; never apply config drift unattended at boot
ExecStart=/usr/bin/docker compose up -d --no-recreate
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
```

從此多了一條慣例：改完 compose 檔，整組 `docker compose up -d`，不要只指定單一服務。

重建還帶出另一個問題。容器一重建，`docker logs` 就只剩新容器的紀錄，舊容器三週的 PHP 錯誤跟著消失。10 月做入侵檢查時我已經吃過一次虧：網站的 access log 在更早的容器重建時就沒了，想查 10 月 22 日之前有沒有可疑請求，手上沒有證據。

這次決定讓 log 活得比容器久。

## 請 Grok 和 Codex 挑毛病

log 怎麼存，Claude Code 提了一個方案：六個容器的 log driver 改成 journald，交給系統的 journal 統一保存，上限調到 200 MB。

我沒有直接照做。[#2](2026-06-20-phpbb-restore-part-02-claude-code) 寫過 review 和 implement 要分開，這次再往前走一步：同一份方案說明，分別交給 Grok 和 Codex，各自獨立回答，互相看不到對方的意見，最後由我比對。

兩邊的結論都是「修改後採用」，共識有三點：

- `docker logs` 只看得到目前這個容器。容器重建後，前一代的紀錄要用 `journalctl CONTAINER_NAME=phpbb-eq2-1` 查
- journald 的限流以 dockerd 為單位共用，一個容器狂噴 log，其他容器的 log 可能被丟掉
- 200 MB 讓系統 log 和六個容器共用，不夠

第一點值得多說。Claude Code 原本的方案說明寫著「改用 journald 之後，`docker logs` 照樣能用」。這句話只對一半：指令能跑，但只看得到現在這個容器，正好就是我想解決的問題。如果照原說法上線，下次容器重建後我去 `docker logs` 找舊紀錄，會以為 log 又不見了。兩個審查者都抓到這點，Claude Code 看完 review 後也修正了說法。寫方案的那方，很難看到自己句子裡的漏洞，這是我覺得獨立審查最有價值的地方。

分歧只有一點。Grok 主張容器改用 `local` driver，應用程式的 log 另外用 bind-mount 寫成檔案，journal 只留給系統自己用。Codex 主張在 compose 裡逐一設定 journald，把 journal 上限調高。

我採用 Codex 的做法。Grok 的方案要改 Apache 的 log 設定，讓它寫到掛載的目錄，而且 MySQL 的 log 一樣沒保護到。Codex 的方案在 compose 檔加一段共用設定就完成，六個服務各自引用：

```yaml
# Container stdout/stderr goes to journald so it survives container recreation
x-logging: &journald-logging
  driver: journald
```

journal 上限最後調到 500 MB。部署前先用 `docker logs --timestamps` 把六個容器的舊 log 匯出備份，約 12 MB，再整組重建，斷線約 40 秒。

我還順手把 Traefik 的 restart policy 改成 `always`。這只能算補強，`unless-stopped` 為什麼沒生效還沒查明，`always` 有沒有用，要等下一次重開才知道。

## 告警要送得到才算數

回頭看時間軸，告警其實很快。UptimeRobot 在斷線 2 分鐘內就寄出三封 DOWN 信，VPS 自己的每日健康檢查在河內早上 8:30 也寄了一封，列出 Traefik 沒在執行。

斷線拉到 15 小時，是因為我直到下午才看到信。那幾封信夾在一堆電子報中間，被我滑過去了。

這裡有一個我自己的判斷：這是歷史保存站，半夜不會有人在看，凌晨斷線，我早上起來再處理完全可以接受。所以我不需要半夜被叫醒，也不需要自動修復。我需要的只是早上醒來時，手機上有一則不會漏看的通知。

UptimeRobot 免費版只能寄信，推播是付費功能。我手上本來就有 ntfy 在用，它是開源的推播服務，對一個網址 POST 一段文字，訂閱的手機就會收到通知。於是接了兩層。

第一層在 VPS 上。原本的告警腳本 `notify.sh` 只寄信，現在寄信前先推一則 ntfy。順序有講究：寄信要先從資料庫讀設定，萬一掛的正是資料庫，信就寄不出去；推播不碰資料庫，所以排在前面。

```bash
notify_push() {
    local subject="$1" body="$2" priority="$3" topic
    topic=$(tr -d '[:space:]' < "$NOTIFY_NTFY_TOPIC_FILE" 2>/dev/null)
    [ -n "$topic" ] || { logger -t notify -p user.err "ntfy topic missing; push not sent: $subject"; return 0; }
    curl -s -f -m 15 -H "Title: $subject" -H "Priority: $priority" --data-binary "$body" \
        "https://ntfy.sh/$topic" >/dev/null \
        || logger -t notify -p user.err "ntfy push failed: $subject"
}
```

每週一次的「一切正常」通知改成 low 優先級，安靜地進通知列就好。

第二層在 VPS 以外。這次 VPS 本身沒掛，但如果哪天整台當掉，它自己的告警也跟著死掉，需要一個外面的觀察者。我放在家裡的 Mac mini 上，用 launchd 每小時跑一次。間隔一小時是刻意的，既然我的標準是早上處理，15 分鐘一次沒有意義。

這支檢查有兩個防誤報的設計。第一，非 200 時等 30 秒再試一次，還是失敗才推播，一次慢回應不會吵到人：

```python
def failing_sites() -> dict[str, str]:
    failures = {url: status for url in SITES if (status := fetch_status(url)) != "200"}
    if failures:
        # Retry once so a single slow response does not page anyone.
        time.sleep(RETRY_DELAY_SECONDS)
        failures = {url: status for url in failures if (status := fetch_status(url)) != "200"}
    return failures
```

第二，先打一個 Cloudflare 的網址當參考點。連這個都打不通，代表是 Mac mini 自己斷網，這一輪直接跳過：

```python
# A failing reference means the Mac itself is offline; skip the round instead of false-alarming.
REFERENCE_URL = "https://www.cloudflare.com/cdn-cgi/trace"

def main() -> int:
    if fetch_status(REFERENCE_URL) != "200":
        log("reference check failed; Mac appears offline, skipping this round")
        return 0
```

斷線期間每 6 小時提醒一次，恢復時再推一則，告訴我斷了多久。

最後是推播通道本身的保護。ntfy.sh 的 topic 名稱等於密碼，知道名稱的人可以訂閱，也可以往裡面發假通知。所以 topic 只存在權限 600 的檔案裡，不進 repo，也不寫進文件。我還特地給這個站開了一個新的 topic，和原本其他監控用的分開，萬一 VPS 被入侵，攻擊者拿到的只有這個站的通知管道。

## 兩天後

11 月 14 日 UTC 20:00，又一次自動重開。

Traefik 同樣沒有被 dockerd 拉起，和第一次一模一樣。差別在開機後約一分鐘，20:01:07，oneshot 執行 `docker compose up -d --no-recreate`，把 Traefik 補了起來。斷線約 1 分鐘，那時河內凌晨 3 點，沒有任何人需要醒來。我是事後翻開機紀錄才知道它發生過。

|          | 11-12 第一次                 | 11-14 第二次       |
| -------- | ---------------------------- | ------------------ |
| 觸發     | unattended-upgrades 自動重開 | 同左               |
| Traefik  | 未被 dockerd 拉起            | 同左               |
| 誰補上的 | 我，當天傍晚手動             | 開機 oneshot，自動 |
| 斷線     | 約 15 小時                   | 約 1 分鐘          |

要說明一下時序：前兩節的 journald 和推播，是 11 月 15 日才部署的，這次重開時都還沒上線。把斷線縮成 1 分鐘的，只有 11-13 補的那個十幾行的 systemd unit。

同一個問題，同一個時間點，15 小時和 1 分鐘。

但我要照實說，根因到現在還沒查明。已知的是：自動重開時穩定重現，手動 `systemctl reboot` 時沒有發生，Traefik 關機時比 dockerd 早 9 秒自己以 exit 0 結束。現在的兩層保護，`restart: always` 加開機 oneshot，處理的都是症狀。下次自動重開後，我會用 journald 留下來的 Traefik log 再查一次，這也是 log 活得比容器久的另一個好處。

## 收尾

\#5 的結尾我寫了「主線 5 篇寫完了」。主線講的是把論壇救回來，這篇講的是救回來之後，怎麼讓它一直活著。

這次留下的幾件事，給自己，也給同樣在自架的人：

- 宣告式的設定也會漏。`restart: unless-stopped` 寫在那裡，不保證開機一定拉得起來，關鍵服務值得多一層開機檢查
- 改 compose 檔要整組 `up -d`，否則設定漂移會等到最不方便的時候才爆開
- log 要活得比容器久
- 告警寄得出去還不夠，要送到自己一定會看的地方
- 監控要放在被監控的機器以外

論壇仍然站在 [eq2.3d-olg.net/community](https://eq2.3d-olg.net/community/) 與 [eq.3d-olg.net](https://eq.3d-olg.net/)。下一次凌晨 3 點的重開，它應該會自己站起來。

---

_系列文 6 篇之 #6，phpBB Restore Series 完。_
