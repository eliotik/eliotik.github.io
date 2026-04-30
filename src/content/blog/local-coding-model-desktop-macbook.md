---
author: Alexander
pubDatetime: 2026-04-28T11:30:00-04:00
modDatetime: 2026-04-28T11:30:00-04:00
title: How I run a local coding model on my desktop and use it from my MacBook
slug: local-coding-model-desktop-macbook
featured: false
draft: false
tags:
    - local-llm
    - vllm
    - wsl2
    - opencode
    - qwen
description: A walkthrough of getting a local coding LLM running on a Windows desktop and using it from Opencode on a MacBook.
---

I have a desktop PC with a strong GPU. My main work happens on a MacBook. I wanted my MacBook to use a coding assistant that runs on the desktop, not in the cloud. I was thinking about less of API bills, it can work offline and it is private.

This is not a polished "in 10 easy steps" post. It's a story of what I actually did. Most steps had a problem.

## Table of contents

## What I started with

The desktop:

- Windows 11
- NVIDIA RTX 5090, 32 GB VRAM
- Intel Core Ultra 9 285K
- Wired to my home router

The MacBook is on the same Wi-Fi. I planned to use **[Opencode](https://opencode.ai/)** on it - a terminal AI coding agent that talks to any OpenAI-compatible server.

Before doing anything, I wrote down the constraints:

- LAN only. No public exposure, no tunnels.
- No money on cloud APIs.
- Quality good enough for real coding tasks.
- The kids use the same desktop for games (the setup must give the GPU back when I'm not using it).

## Step 0: Ollama or vLLM

The "easy path" answer is Ollama. One installer on Windows. No Linux, no Python venv. For most people that's the right pick.

I started research there.

Coding agents resend a lot of context every turn - the whole system prompt, tool schemas, file reads. By turn five of a real session, the prompt is 30k+ tokens and the model only generates a couple thousand. Repeating that prefix every turn is slow.

vLLM has prefix caching that survives across requests. Ollama only has single-slot caching (as of writing) that gets evicted when a model unloads. For an agent workflow having cache layer was a big deal.

I decided to take the harder path: **[vLLM](https://vllm.ai/)**. But vLLM doesn't run on Windows directly and it needs Linux, that means I will use **WSL2**.

> If you only do single chat turns, Ollama is the better trade. The rest of this post would still apply - just skip the WSL section.

## Step 1: WSL2

WSL2 is a thin Linux VM that ships with Windows.

Open PowerShell as Administrator and run:

```powershell showLineNumbers=false
wsl --install -d Ubuntu-24.04
```

After Ubuntu was installed, I checked the WSL version and got my first surprise:

```text showLineNumbers=false
Windows Subsystem for Linux 2.6.3
```

vLLM on Blackwell needs WSL **2.7.0+** to get CUDA-graph capture working without the `--enforce-eager` slowdown.

The Microsoft Store still had 2.6.3 as current version. I updated WSL through the pre-release channel:

```powershell showLineNumbers=false
wsl --update --pre-release
wsl --version
```

That gave me 2.7.x.

Reboot and `wsl --version` confirmed it. Lesson: always check the version before you trust a guide.

## Step 2: Mirrored networking

Mirrored networking is the cleaner WSL networking mode in newer versions, it makes WSL share the host's network identity instead of running its own NAT.

I wrote `C:\Users\<me>\.wslconfig`:

```ini title='C:\Users<me>.wslconfig' showLineNumbers=false
[wsl2]
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
firewall=true
```

Restarted WSL. It started but printed:

```text showLineNumbers=false
wsl: The wsl2.localhostForwarding setting has no effect when using mirrored networking mode
```

That warning is harmless, `localhostForwarding` is for NAT mode, and with mirrored mode it's redundant. I skipped this warning and moved on.

> I'll spoil the ending here: mirrored mode didn't fully solve my problem. I ended up using **NAT mode + a port proxy** anyway, because mirrored mode had its own quirks I didn't want to fight, more on that below.

## Step 3: A separate disk for models

Models are big. I didn't want them clogging C:\\. I put them on E:\\ as a virtual disk that WSL could mount.

```powershell showLineNumbers=false
New-Item -ItemType Directory -Path E:\wsl-vllm -Force
$vhd = "E:\wsl-vllm\wsl-models.vhdx"
New-VHD -Path $vhd -Dynamic -SizeBytes 500GB
```

Then I tried to mount it:

```powershell showLineNumbers=false
wsl --mount --vhd E:\wsl-vllm\wsl-models.vhdx --bare
```

and got next error:

```text showLineNumbers=false
The system cannot find the file specified.
Error code: Wsl/ERROR_FILE_NOT_FOUND
```

The file existed, I could `ls` it. I shut WSL down, recreated the directory, ran `wsl --shutdown`, tried again - same error.

Eventually I found the cause: the VHD path was case-sensitive in some places and I had a stray issue with the parent folder.

I deleted everything, recreated cleanly and mounted again and it worked.

Inside WSL, running `lsblk` showed the new device:

```text showLineNumbers=false
sde    8:64   0   500G  0 disk
```

I formatted, mounted and added it to `/etc/fstab`:

```bash showLineNumbers=false
sudo mkfs.ext4 /dev/sde
sudo mkdir -p /mnt/models
echo '/dev/sde  /mnt/models  ext4  defaults  0  2' | sudo tee -a /etc/fstab
sudo mount -a
```

For the VHD to be available after every Windows restart, I scheduled the mount at logon. Open a new PowerShell as Administrator and run:

```powershell title='Mount the VHD at logon (admin PowerShell)' showLineNumbers=false
$action = New-ScheduledTaskAction -Execute "wsl.exe" `
  -Argument "--mount --vhd E:\wsl-vllm\wsl-models.vhdx --bare"

$trigger = New-ScheduledTaskTrigger -AtLogOn

Register-ScheduledTask -TaskName "WSL-MountModels" `
  -Action $action -Trigger $trigger -RunLevel Highest -Force
```

The first time I tried `Register-ScheduledTask` it said the task already existed. I added `-Force` (note: you can also try `Unregister-ScheduledTask` first).

## Step 4: vLLM in a Python venv

We need to prepare system and environment to runb vLLM. Open PowerShell and run WSL, once you are inside WSL terminal, run:

```bash showLineNumbers=false
sudo apt update
sudo apt install -y python3.12-venv build-essential

mkdir ~/llm && cd ~/llm
python3.12 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install vllm
```

A few GB of CUDA wheels later it was installed.

`nvidia-smi` from inside WSL showed the 5090 with the right driver and CUDA version.

Good - the GPU passthrough worked.

## Step 5: The model - Qwen3.5-35B-A3B GPTQ

I picked **Qwen3.5-35B-A3B-Instruct (GPTQ-Int4)**. It has 35B total parameters but only ~3B activate per token (MoE).

On a single GPU, that means it's noticeably faster than a dense 32B at the same quality. Roughly 20 GB on disk, fits in 32 GB VRAM with room for context.

We will download model from [Hugging Face](https://huggingface.co/). First install the CLI and login with a read-only token:

```bash showLineNumbers=false
pip install huggingface_hub
huggingface-cli login   # paste a read-only HF token

huggingface-cli download Qwen/Qwen3.5-35B-A3B-Instruct-GPTQ-Int4 \
  --local-dir /mnt/models/qwen3.5-35b-a3b-gptq
```

I almost grabbed Qwen3.6 because I saw a tweet about it. It wasn't actually published yet at the time - only the announcement.

> Note: You should verify the Hugging Face page exists before planning to use a model.

## Step 6: The vLLM serve script

I wrote `~/llm/serve-qwen.sh` based on the guide I had:

```bash title='~/llm/serve-qwen.sh (first try, broken)'
#!/usr/bin/env bash
set -euo pipefail
source ~/llm/.venv/bin/activate

vllm serve /mnt/models/qwen3.5-35b-a3b-gptq \
  --served-model-name qwen3.5-35b \
  --host 0.0.0.0 --port 8000 \
  --api-key "$VLLM_API_KEY" \
  --max-model-len 65536 \
  --gpu-memory-utilization 0.92 \
  --enable-prefix-caching \
  --disable-log-requests
```

On the first run, it printed:

```text showLineNumbers=false
vllm: error: unrecognized arguments: --disable-log-requests
```

That flag had been removed in my installed vLLM version, so I dropped it from script too.

Next run:

```text showLineNumbers=false
vllm: error: unrecognized arguments: false
```

Some other flag wanted a value, not a true/false. Fixed it.

> Note: **always run `vllm serve --help` against your actual installed version**, don't trust guides

After two more iterations, this is what worked:

```bash title='~/llm/serve-qwen.sh (working)' {"Listen on all interfaces (not just localhost)":7-8} {"Bearer token clients must send":9-10} {"Total tokens per request, input + output combined":11-12} {"Reuse cached prefix across requests - the reason I picked vLLM":14-15} {"Qwen-specific glue for tool calls and <think> blocks":17-19}
#!/usr/bin/env bash
set -euo pipefail
source ~/llm/.venv/bin/activate

vllm serve /mnt/models/qwen3.5-35b-a3b-gptq \
  --served-model-name qwen3.5-35b \

  --host 0.0.0.0 --port 8000 \

  --api-key "$VLLM_API_KEY" \

  --max-model-len 65536 \
  --gpu-memory-utilization 0.92 \

  --enable-prefix-caching \
  --enable-auto-tool-choice \

  --reasoning-parser qwen3 \
  --tool-call-parser qwen3_coder
```

I generated value for `VLLM_API_KEY` with a random value and saved it for later:

```bash showLineNumbers=false
export VLLM_API_KEY="sk-local-$(openssl rand -hex 16)"
echo $VLLM_API_KEY  # save this
```

The first launch took about 2 minutes.

When I saw `Application startup complete.` I felt happy but that didn't last long.

## Step 7: It works on Windows. It does not work on Windows.

When I ran in a second WSL terminal `curl`, it worked:

```bash showLineNumbers=false
curl -H "Authorization: Bearer $VLLM_API_KEY" http://127.0.0.1:8000/v1/models
```

JSON came back. The model is reachable from inside WSL.

Then I tried from a Windows PowerShell:

```powershell showLineNumbers=false
curl.exe -H "Authorization: Bearer ..." http://192.168.50.94:8000/v1/models
```

And I got an error:

```text showLineNumbers=false
curl: (7) Failed to connect to 192.168.50.94 port 8000 after 2046 ms: Could not connect to server
```

vLLM logs were silent, nothing showed out after `Application startup complete.`. The request never reached vLLM. Something in the network stack between Windows and WSL was blocking it.

This is where I lost a few hours.

### 7.1 Network profile was Public

`Get-NetConnectionProfile` told me my Ethernet was classified as `Public`. Most LAN-friendly firewall rules only fire on `Private`. So I switched it too:

```powershell showLineNumbers=false
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
```

> Windows reclassifies your network sometimes. Re-check this any time something just stops working

### 7.2 The Hyper-V firewall

I had a Defender rule for port 8000. With mirrored networking, WSL traffic goes through a separate **Hyper-V firewall** layer that defaults to block.

```powershell title='Open WSL traffic through the Hyper-V firewall (admin)' {"WSL group GUID - confirm yours with Get-NetFirewallHyperVVMCreator":3-4}
New-NetFirewallHyperVRule -Name "WSL-vLLM-8000" `
  -DisplayName "vLLM (WSL) 8000/TCP" -Direction Inbound `

  -VMCreatorId '{40E0AC32-XXXX-XXXX-XXXX-2B479E8F2E90}' `
  -Protocol TCP -LocalPorts 8000
```

I had to grab the right `VMCreatorId` first:

```powershell showLineNumbers=false
Get-NetFirewallHyperVVMCreator
```

For me it returned the WSL group ID, and I used it with `New-NetFirewallHyperVRule`.

### 7.3 The Defender firewall

Scoped to my LAN subnet only:

```powershell title='Defender inbound rule, LAN-scoped (admin)' {"Replace with your LAN subnet":3-4}
New-NetFirewallRule -DisplayName "vLLM LAN 8000" `
  -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 `

  -Profile Private -RemoteAddress 192.168.50.0/24
```

I don't want random devices on the network hitting my LLM, just my MacBook and laptop.

### 7.4 The WSL IP problem and the port proxy

After all of the above, Windows-to-Windows curl at `127.0.0.1:8000` started working. MacBook-to-Windows still didn't.

Then I learned the next thing: **WSL has its own private IP** (mine was `172.25.125.199`) and traffic arriving at the Windows host on `192.168.50.94:8000` doesn't automatically forward to that.

The fix was to use `netsh portproxy`.

WSL's IP changes when WSL restarts, so I needed both a one-time forward and a script that refreshes it on every login.

```powershell title='One-time test from PowerShell (admin)' showLineNumbers=false
$wslIp = (wsl hostname -I).Trim().Split(" ")[0]
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8000 `
  connectaddress=$wslIp connectport=8000
```

That made the MacBook curl work and to keep it working across restarts, I saved this as `E:\wsl-models\wsl-portproxy.ps1`:

```powershell title='E:\wsl-models\wsl-portproxy.ps1' {"Retry until WSL has a stable IP":7-14} {"Wipe any stale forwards":17-18} {"Forward Windows host port 8000 → WSL : 8000":19-21}
$logFile = "E:\wsl-models\wsl-portproxy.log"
function Log($msg) {
  "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss')) | $msg" | Out-File $logFile -Append
}
Log "Script started"


$wslIp = $null
for ($i = 1; $i -le 5; $i++) {
  $wslIp = (wsl hostname -I 2>$null).Trim().Split(" ")[0]
  if ($wslIp -and $wslIp -ne "") { break }
  Log "Attempt $i`: WSL IP not ready, retrying"
  Start-Sleep -Seconds 5
}
Log "Detected WSL IP: $wslIp"


netsh interface portproxy reset

netsh interface portproxy add v4tov4 `
  listenaddress=0.0.0.0 listenport=8000 connectaddress=$wslIp connectport=8000
Log "Portproxy refresh complete: 0.0.0.0:8000 -> $wslIp`:8000"
```

And I scheduled this script to run at logon:

```powershell title='Run the portproxy script at every logon (admin)' {"Run with highest privileges (netsh needs admin)":4-5}
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-ExecutionPolicy Bypass -File E:\wsl-models\wsl-portproxy.ps1"
$trigger = New-ScheduledTaskTrigger -AtLogOn

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -RunLevel Highest

Register-ScheduledTask -TaskName "WSL-Portproxy-8000" `
  -Action $action -Trigger $trigger -Principal $principal -Force
```

The first time I tried to register it I got `Access is denied`. I had opened PowerShell as a normal user. Re-opened as Administrator, ran again, registered.

After all four pieces were in place, I ran the curl from my MacBook:

```bash showLineNumbers=false
curl -H "Authorization: Bearer $VLLM_API_KEY" http://192.168.50.94:8000/v1/models | jq
```

I got correct JSON response. Took the rest of the day to get to that one moment.

## Step 8: The first Opencode session

On MacBook laptop I created Opencode config at `~/.config/Opencode/Opencode.json`:

```json title='~/.config/Opencode/Opencode.json' {"Provider name (anything you want)":6-7} {"OpenAI-compatible adapter":8-9} {"Windows host's LAN IP - the portproxy forwards into WSL":12-13} {"Read API key from shell env, not stored in file":14-15} {"Must match --served-model-name in serve-qwen.sh":18-19} {"Keep below max-model-len so big inputs still fit":21-22}
{
    "$schema": "https://Opencode.ai/config.json",
    "model": "lan-vllm/qwen3.5-35b",
    "small_model": "lan-vllm/qwen3.5-35b",
    "provider": {
        "lan-vllm": {
            "npm": "@ai-sdk/openai-compatible",
            "name": "vLLM (LAN - RTX 5090)",
            "options": {
                "baseURL": "http://192.168.50.94:8000/v1",

                "apiKey": "{env:VLLM_API_KEY}"
            },
            "models": {
                "qwen3.5-35b": {
                    "name": "Qwen3.5 35B-A3B (GPTQ)",

                    "limit": { "context": 131072, "output": 8192 }
                }
            }
        }
    }
}
```

Quick notes:

- `baseURL` points at the Windows host, the portproxy forwards into WSL.
- `{env:VLLM_API_KEY}` reads from my MacBook shell, so the key isn't in the file.
- `limit.output: 8192` - this is **important**, see the next problem.

Added the API key to my shell:

```bash showLineNumbers=false
echo 'export VLLM_API_KEY=sk-local-...' >> ~/.zshrc
source ~/.zshrc
```

Then `cd ~/my-project && opencode`. Inside Opencode, `/models` showed `lan-vllm/qwen3.5-35b`. I picked it and asked it to summarize the README file, and It did.

I worked with it for a few minutes, then it threw this:

```text showLineNumbers=false
This model's maximum context length is 65536 tokens. However, you requested
16384 output tokens and your prompt contains at least 49153 input tokens,
for a total of at least 65537 tokens.
```

Opencode was asking for 16k output, but the prompt was already 49k. 49 + 16 > 65. To fix it, I dropped output to 8192 in the Opencode config and bumped `--max-model-len` to 131072 in the vLLM script (Qwen3.5 supports it natively), made both changes at once.

After that, it worked well.

## Step 9: Windows restart breaks everything

I cleaned up and added a couple of nice-to-haves: firewall logging on, model storage backup plan, a systemd service in WSL so I wouldn't have to launch the script by hand.

Then I restarted Windows to confirm everything came back automatically.

And it didn't.

Trying to run curl from the MacBook:

```text showLineNumbers=false
curl: (56) Recv failure: Connection reset by peer
```

After some digging:

- The `WSL-MountModels` scheduled task had run, but `lsblk` showed nothing at `/mnt/models`.
- The systemd `vllm` service was failing with `unavailable resources or another system error`.
- `tail -f /var/log/vllm.log` showed vLLM was actually starting eventually, just slowly. The portproxy script had run too early - before WSL had a stable IP - and forwarded to nothing.

I patched the auto-mount task, fixed the systemd unit, added retries to the portproxy script.

After another reboot, everything came up clean: MacBook curl worked.

## Step 10: I gave up on autostart

My "kids first" rule kicked in at this moment. Even with everything coming up automatically, vLLM was holding 20+ GB of VRAM on every boot.

The kids would turn on the desktop to play a game and find it stuttering.

So I disabled the autostart entirely:

```powershell showLineNumbers=false
Disable-ScheduledTask -TaskName "WSL-KeepAlive"
```

I left `WSL-MountModels` and `WSL-Portproxy-8000` enabled - they're cheap and they make my own startup faster, but vLLM only runs when I run it.

My new ritual when I want to use it:

1. Open PowerShell, type `wsl`.
2. Inside WSL: `~/llm/serve-qwen.sh`.
3. Wait for `Application startup complete.` (about 90 seconds).
4. Open Opencode on the MacBook.

When I'm done, Ctrl+C kills vLLM and the GPU is free.

Slightly more friction, but worth it for a happy household.

## Step 11: One more rabbit hole - Claude Code

I thought: "could I point Claude Code at this too?" so I set:

```bash showLineNumbers=false
export ANTHROPIC_BASE_URL=http://192.168.50.94:8000/v1

claude
```

Chat worked, I closed Claude Code, closed the terminal. Opened a new one, no `ANTHROPIC_BASE_URL` was set. But vLLM logs **kept showing requests** to `/v1/v1/messages?beta=true` and `/v1/api/event_logging/batch`.

Some background process was holding the old environment. I tracked it down through `ps`, found stale telemetry batchers, killed them.

> Note: Do not set `ANTHROPIC_BASE_URL` globally - Claude Code does too much background work for that to be safe

So Claude Code is back to talking to Anthropic API. Opencode is what I use against my local vLLM.

## Where I ended up

After all the iterations:

- A coding model that runs on my home GPU, talks over my home network and costs nothing per request.
- A 90-second start ritual when I want it, GPU is free for the kids the rest of the time.
- My code doesn't leave the house.
- First-hand knowledge of every layer between my MacBook and the model, when something breaks now, I know which corner to look in (or at least I assured myself that I know).

The whole journey took longer than I expected, the model and the LLM server were the easy parts. Storage and networking ate most of the time. If you have similar hardware sitting at home, plan for it.

If you're going to follow along, the order that worked for me was:

1. Get WSL2 to a 2.7+ version before doing anything else.
2. Move models to a separate disk early - don't fill C:\\.
3. Get vLLM running first, talk to it locally with `curl`.
4. Only then worry about reaching it from another device.
5. Always run `vllm serve --help` against your installed version, and learn about current flags.

Now, time to use this thing for something fun.

Go make something `◝(ᵔᵕᵔ)◜`
