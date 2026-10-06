---
author: Alexander
pubDatetime: 2026-10-06T17:00:00-04:00
modDatetime: 2026-10-06T17:00:00-04:00
title: Upgrading my local coding model to vLLM 0.31 and Qwen3.8
slug: local-coding-model-upgrade-vllm-qwen38
featured: false
draft: false
thread: Setting up local LLM
tags:
    - local-llm
    - vllm
    - wsl2
    - opencode
    - qwen
    - cuda
    - macos
description: Five months after playing with my local LLM I decided to update model and tools, not that smooth experience.
relatedPosts:
    - local-coding-model-desktop-macbook
---

In April I set up a local coding model on my Windows desktop and wrote about it in [part one](/posts/local-coding-model-desktop-macbook/).

This week I decided to upgrade model and tools.

It was not a smooth experience. Opencode on my MacBook stopped reaching the server and the new vLLM needed four fixes before it started. This post covers the issues and the troubleshooting in the order they happened.

## Table of contents

## Where I left off

The setup from part one:

-   Windows 11 desktop with an RTX 5090, WSL2 and Ubuntu 24.04
-   vLLM in a Python venv serving Qwen3.5-35B-A3B (GPTQ-Int4) on port 8000
-   A `netsh portproxy` rule that forwards the Windows LAN IP into WSL
-   Opencode on the MacBook pointing at `http://192.168.50.94:8000/v1`
-   Autostart disabled so the kids get the GPU when I'm not using it

A few things changed after I published part one.

The separate VHD kept breaking after restarts, so the models now sit in `~/models` on the WSL disk.

vLLM runs as a systemd service. It is not enabled at boot. I start it with `sudo systemctl start vllm` and it logs to `/var/log/vllm.log`.

The serve script grew. These flags turned out to be required for real Opencode sessions:

-   `--max-num-batched-tokens 4096` - the default of 2048 crashed at startup with this model family
-   `--default-chat-template-kwargs '{"enable_thinking": false}'` - with thinking on, Opencode kept stopping in the middle of a task because tool calls came back empty
-   `--language-model-only` - skips the vision part of the model and gives back some VRAM
-   `--kv-cache-dtype fp8` and `--max-num-seqs 4`

And the Opencode context limit went from 131072 to 122880. Input plus output has to fit in `--max-model-len`. 122880 + 8192 = 131072.

## Step 1: Starting the current setup

Autostart is disabled since part one, so I start everything by hand.

### 1.1 vLLM has to be started

```bash showLineNumbers=false
sudo systemctl start vllm
tail -f /var/log/vllm.log
```

Wait for `Application startup complete.`. A `curl` right after the start command fails with `Couldn't connect to server`. The port opens only when the model has loaded, about 90 seconds.

### 1.2 The port proxy has to point at the current WSL IP

My scheduled task for this was disabled:

```text showLineNumbers=false
Start-ScheduledTask : The task is disabled.
```

So I ran the three lines by hand in an admin PowerShell:

```powershell title='Refresh the port proxy (admin PowerShell)' showLineNumbers=false
$ip = ((wsl hostname -I) -join ' ') -replace '^\s*(\d+\.\d+\.\d+\.\d+).*','$1'
netsh interface portproxy delete v4tov4 listenport=8000 listenaddress=0.0.0.0
netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=$ip
netsh interface portproxy show v4tov4
```

The `-join` matters. `wsl hostname -I` can return an array and PowerShell then writes `System.Object[]` into the rule.

### 1.3 The WSL window has to stay open

I typed `exit` in WSL to run a test from PowerShell. With no session open, WSL stops the distro a few seconds later and vLLM goes down with it.

```bash showLineNumbers=false
systemctl is-active vllm
# inactive
```

> With autostart off, an open WSL window is what keeps the server alive. Leave one open with `tail -f` on the log.

### 1.4 What the curl errors mean

| curl from the MacBook says | What it means |
| :------- | :------- |
| `Connection reset by peer` | Windows answered and the port proxy is there, but nothing listens behind it. vLLM is down or the WSL IP changed |
| `Failed to connect` or a timeout | The request never reached Windows. Wrong IP, firewall rule or the network profile flipped to Public |
| `401 Unauthorized` | Everything works. The API key is missing or wrong |

When I wasn't sure if the network or vLLM was at fault, a throwaway web server inside WSL settled it:

```bash showLineNumbers=false
python3 -m http.server 8001 --bind 0.0.0.0
```

Then from PowerShell:

```powershell showLineNumbers=false
curl.exe http://172.25.125.199:8001
```

Port 8001 answered. So the path into WSL was fine and vLLM was the one not running.

After that the MacBook got its JSON back:

```bash showLineNumbers=false
curl http://192.168.50.94:8000/v1/models -H "Authorization: Bearer $VLLM_API_KEY"
```

## Step 2: curl works, Opencode doesn't

Same MacBook, same terminal window, same URL. `curl` returned the model list. Opencode returned this:

```text showLineNumbers=false
Retrying in 3s - attempt 3 - FailedToOpenSocket: Was there a typo in the url or port?
```

The vLLM log on the desktop showed no incoming request at all. Opencode was not reaching the network.

### 2.1 macOS blocks the terminal, not curl

macOS has a Local Network permission. An app needs it to talk to devices on your LAN. As far as I can tell, Apple's own tools are exempt and `/usr/bin/curl` is one of them. So a working `curl` proves nothing about other programs started from the same terminal.

This one-liner is the test that tells the truth. No API key in it, so `401` is the good answer:

```bash showLineNumbers=false
node -e "fetch('http://192.168.50.94:8000/v1/models').then(r=>console.log('status',r.status)).catch(e=>console.log(e.cause.code))"
```

In iTerm:

```text showLineNumbers=false
EHOSTUNREACH
```

In Apple's Terminal:

```text showLineNumbers=false
status 401
```

iTerm was listed under System Settings → Privacy and Security → Local Network with the switch on. It was blocked anyway. Turning the switch off and on and restarting iTerm changed nothing. This is a known macOS problem where the permission gets stuck.

### 2.2 Opencode 2 has a background service

Opencode failed in Apple's Terminal too, where `node` worked.

```bash showLineNumbers=false
pgrep -fl opencode
# 20848 /opt/homebrew/Cellar/opencode/2.0.20/bin/opencode serve --service
```

Opencode 2 runs one shared background server. The window you type in is only a client. The server makes the calls to the model and every Opencode window on the machine uses the same one.

So the terminal you are sitting in doesn't matter. What matters is which app started the service. I tested it both ways:

-   `opencode service restart` from iTerm - Opencode fails everywhere, Apple's Terminal included
-   `opencode service restart` from Apple's Terminal - Opencode works everywhere, iTerm included

That is my setup for now. I start the service from Apple's Terminal once, then work in iTerm like before.

> Don't run `opencode service restart` or `opencode service stop` from the blocked terminal. And after a Mac restart or an Opencode update, start the service from Apple's Terminal before opening Opencode anywhere else.

### 2.3 What I haven't fixed

iTerm's permission is still stuck. The reset people report as working is deleting `/Library/Preferences/com.apple.networkextension.plist` from Recovery mode. It resets Local Network permission for every app and wipes VPN and filter configurations with it. I haven't done it yet.

There is also a fallback that avoids the permission completely. macOS never restricts `127.0.0.1`. A small forwarder started from Apple's Terminal listens on localhost and passes everything to the desktop:

```bash title='TCP forwarder: 127.0.0.1:8000 → desktop' showLineNumbers=false
node -e "const n=require('net');n.createServer(c=>{const s=n.connect(8000,'192.168.50.94');c.pipe(s).pipe(c);s.on('error',()=>c.destroy());c.on('error',()=>s.destroy())}).listen(8000,'127.0.0.1',()=>console.log('forwarding 127.0.0.1:8000'))"
```

With `baseURL` set to `http://127.0.0.1:8000/v1` Opencode worked right away. I didn't keep it.

Other people hit the same wall with LAN model servers and Opencode on macOS. [This issue](https://github.com/anomalyco/opencode/issues/38854) describes the same symptoms.

## Step 3: Picking what to upgrade to

With everything running, I looked at what was new.

vLLM 0.31.0 came out the day before.

The model took more thinking.

| Model | Released | Type | Fits a 32 GB card |
| :------- | :------- | :------- | :------- |
| Qwen3.5-35B-A3B | February 2026 | MoE, 3B active per token | Yes, this is what I had |
| Qwen3.6-35B-A3B | April 2026 | MoE, 3B active per token | Yes |
| Qwen3.8-27B | August 2026 | Dense, all 27B active | Yes, in 4-bit |
| Qwen3.8-2.4T-A95B | August 2026 | MoE flagship | No, datacenter only |

There were no open weights for Qwen3.7. And there is no small MoE model in the 3.8 family.

Two things I learned about the names:

-   The parameter count is not a ranking across generations. A 30B model from last year is weaker than this year's 27B.
-   The `A3B` suffix is what made my old model fast. Only 3B parameters run per token. Qwen3.8-27B has no suffix, so all 27B run on every token.

So the choice was speed (Qwen3.6-35B-A3B, a near drop-in swap) or quality (Qwen3.8-27B). I went with quality.

The [vLLM recipe](https://recipes.vllm.ai/Qwen/Qwen3.8-27B) for a single 5090 runs the official NVFP4 build with CUDA graphs off and a 32K context. That is too small for a coding agent that sends 20K tokens before I type anything.

I picked a community 4-bit build: [Frozenlock/Qwen3.8-27B-int4-AutoRound](https://huggingface.co/Frozenlock/Qwen3.8-27B-int4-AutoRound). About 18 GB of weights, which leaves room for a long context. It also keeps the model's draft head working.

## Step 4: A new venv next to the old one

I didn't upgrade in place. A second venv keeps the old setup intact as a rollback.

```bash showLineNumbers=false
sudo systemctl stop vllm

python3 -m venv ~/llm/venv-031
source ~/llm/venv-031/bin/activate
pip install -U pip
pip install "vllm==0.31.0" "transformers>=5.8.0" huggingface_hub

hf download Frozenlock/Qwen3.8-27B-int4-AutoRound --local-dir ~/models/qwen3.8-27b-int4

cp ~/llm/serve-qwen.sh ~/llm/serve-qwen.sh.bak-qwen35
```

Then I changed three things in `serve-qwen.sh` - the venv path, the model path and the served name. I also removed `--quantization gptq_marlin` and `--dtype bfloat16`. This build uses a different 4-bit format and vLLM detects it without help.

Use next commands to rollback:

```bash showLineNumbers=false
cp ~/llm/serve-qwen.sh.bak-qwen35 ~/llm/serve-qwen.sh
sudo systemctl restart vllm
```

I started the service and watched the log. The model loaded in 17 seconds and took 16.83 GiB. Then it crashed.

## Step 5: Four build errors in a row

vLLM uses a library called FlashInfer for attention on this GPU. FlashInfer compiles its GPU kernels on the first start. That needs a CUDA compiler, matching headers and a linker that finds the CUDA libraries. My WSL had none of the three in a usable state.

### 5.1 "FlashInfer requires GPUs with sm75 or higher"

```text showLineNumbers=false
Failed to get device capability: SM 12.x requires CUDA >= 12.9.
...
RuntimeError: FlashInfer requires GPUs with sm75 or higher
```

The last line is misleading. A 5090 is far above sm75. The real message is the first one.

My first guess was a PyTorch built for an old CUDA.

```bash showLineNumbers=false
python -c "import torch; print(torch.__version__, torch.version.cuda)"
# 2.13.0+cu130 13.0
```

The real cause was a leftover from April. I had a CUDA 12.8 toolkit in `/usr/local/cuda` and my systemd unit pointed at it:

```bash showLineNumbers=false
which nvcc; nvcc --version | tail -2
# /usr/local/cuda/bin/nvcc
# Cuda compilation tools, release 12.8, V12.8.93

systemctl cat vllm | grep Environment
# Environment=CUDA_HOME=/usr/local/cuda
# Environment=LD_LIBRARY_PATH=/usr/local/cuda/lib64
```

FlashInfer looks at `CUDA_HOME` first. It found 12.8 and refused the card.

The new venv ships its own compiler in `site-packages/nvidia/cu13`. I pointed the serve script at that one and left the systemd unit alone, so the old script still works for rollback:

```bash title='Added to serve-qwen.sh' showLineNumbers=false
NVCC=$(find ~/llm/venv-031 -type f -name nvcc | head -1)
export CUDA_HOME="$(dirname "$(dirname "$NVCC")")"
export PATH="$CUDA_HOME/bin:$PATH"
unset LD_LIBRARY_PATH
```

### 5.2 "CUDA compiler and CUDA toolkit headers are incompatible"

The right compiler ran now. It stopped on the first file:

```text showLineNumbers=false
error: #error "CUDA compiler and CUDA toolkit headers are incompatible, please check your include paths"
```

`pip` had installed mismatched parts:

```bash showLineNumbers=false
pip list | grep -iE "nvidia-cuda-(nvcc|crt|runtime)"
# nvidia-cuda-crt       13.4.92
# nvidia-cuda-nvcc      13.4.92
# nvidia-cuda-runtime   13.0.96
```

PyTorch pins the runtime at 13.0. Nothing pins the compiler, so `pip` took the newest. I brought the compiler down to match:

```bash showLineNumbers=false
pip install "nvidia-cuda-nvcc==13.0.*" "nvidia-cuda-crt==13.0.*"
```

> I first included `nvidia-cuda-nvdisasm` in that command. It has no 13.0 release and `pip` cancelled the whole install because of it. Nothing was downgraded and the error looked the same on the next start. Check `pip list` after every pin.

### 5.3 "ptxas fatal: Unsupported .version 9.4"

The header check passed. Next stop:

```text showLineNumbers=false
ptxas fatal   : Unsupported .version 9.4; current version is '9.0'
```

The compiler has two halves. The front half writes an intermediate file and `ptxas` turns it into GPU code. My `ptxas` was now 13.0 and the front half was still 13.4. It lives in one more package:

```bash showLineNumbers=false
pip list | grep nvvm
# nvidia-nvvm   13.4.92

pip install "nvidia-nvvm==13.0.*"
```

### 5.4 "cannot find -lcudart"

Every kernel compiled, but the last step, linking, failed:

```text showLineNumbers=false
/usr/bin/ld: cannot find -lcudart: No such file or directory
/usr/bin/ld: cannot find -lcuda: No such file or directory
collect2: error: ld returned 1 exit status
```

Both libraries were on the machine, under names the linker doesn't look for. The venv has `libcudart.so.13` and the linker wants `libcudart.so`. And `libcuda` is the GPU driver library, which in WSL lives in `/usr/lib/wsl/lib`.

```bash showLineNumbers=false
CU=~/llm/venv-031/lib/python3.12/site-packages/nvidia/cu13

mkdir -p $CU/lib64/stubs
ln -sf $CU/lib/libcudart.so.13 $CU/lib64/libcudart.so
ln -sf /usr/lib/wsl/lib/libcuda.so.1 $CU/lib64/libcuda.so
ln -sf /usr/lib/wsl/lib/libcuda.so.1 $CU/lib64/stubs/libcuda.so
```

```bash title='Added to serve-qwen.sh' showLineNumbers=false
export LIBRARY_PATH="$CUDA_HOME/lib64:$CUDA_HOME/lib64/stubs"
```

Next start:

```text showLineNumbers=false
INFO:     Application startup complete.
```

### 5.5 Two habits that saved time

Clear the half-built kernels between attempts. Otherwise the next start can trip over leftovers:

```bash showLineNumbers=false
rm -rf ~/.cache/flashinfer/0.7.0.post1/120f
```

And stop reading the log with `tail`. A failed start prints a few hundred lines of Python traceback and the systemd unit restarts and prints them again. This shows the lines that matter:

```bash showLineNumbers=false
sleep 240; grep -E "fatal|error:|ld: |startup complete" /var/log/vllm.log | tail -5
```

Look at the timestamps. Old errors stay in the file and I mistook a previous attempt for a new failure once.

## Step 6: The serve script that works

```bash title='~/llm/serve-qwen.sh' {5-10}
#!/usr/bin/env bash
set -euo pipefail
source ~/llm/venv-031/bin/activate

# Use the CUDA 13.0 compiler shipped in the venv, not the system 12.8 toolkit
NVCC=$(find ~/llm/venv-031 -type f -name nvcc | head -1)
export CUDA_HOME="$(dirname "$(dirname "$NVCC")")"
export PATH="$CUDA_HOME/bin:$PATH"
unset LD_LIBRARY_PATH
export LIBRARY_PATH="$CUDA_HOME/lib64:$CUDA_HOME/lib64/stubs"

export VLLM_API_KEY="${VLLM_API_KEY:-sk-local-changeme}"
export HF_HUB_OFFLINE=1

vllm serve "$HOME/models/qwen3.8-27b-int4" \
  --served-model-name qwen3.8-27b \
  --host 0.0.0.0 --port 8000 \
  --api-key "$VLLM_API_KEY" \
  --max-model-len 131072 \
  --gpu-memory-utilization 0.92 \
  --enable-prefix-caching \
  --enable-auto-tool-choice \
  --reasoning-parser qwen3 \
  --tool-call-parser qwen3_coder \
  --kv-cache-dtype fp8 \
  --max-num-seqs 4 \
  --trust-remote-code \
  --max-num-batched-tokens 4096 \
  --default-chat-template-kwargs '{"enable_thinking": false}' \
  --language-model-only \
  --speculative-config '{"method":"mtp","num_speculative_tokens":3}'
```

The highlighted lines are the whole CUDA fix from Step 5. The last line is Step 7.

The pinned packages in the venv, for the record:

| Package | Version |
| :------- | :------- |
| vllm | 0.31.0 |
| torch | 2.13.0+cu130 |
| flashinfer-python | 0.7.0.post1 |
| nvidia-cuda-nvcc | 13.0.88 |
| nvidia-cuda-crt | 13.0.88 |
| nvidia-nvvm | 13.0.88 |
| nvidia-cuda-runtime | 13.0.96 |

> Don't run `pip install -U` in this venv. It pulls the 13.4 compiler parts back in and the next start fails at 5.2 again.

## Step 7: Getting speed back with MTP

A dense 27B model is slower per token than my old MoE model. Qwen3.8 has an answer built in - a small draft head that guesses a few tokens ahead. The big model then checks the guesses in one pass. vLLM calls this speculative decoding and the method is `mtp`.

It's one flag:

```bash showLineNumbers=false
--speculative-config '{"method":"mtp","num_speculative_tokens":3}'
```

It costs memory. vLLM prints how much context fits on the GPU at startup:

| | KV cache | Full 131K conversations at once |
| :------- | :------- | :------- |
| Without MTP | 334,961 tokens | 2.56 |
| With MTP | 218,903 tokens | 1.67 |

Still more than one full context, so I kept it.

To see if the draft head earns that memory, ask the metrics endpoint:

```bash showLineNumbers=false
curl -s http://127.0.0.1:8000/metrics -H "Authorization: Bearer $VLLM_API_KEY" \
  | grep -E "spec_decode_num_(accepted|draft)_tokens_total"
# vllm:spec_decode_num_draft_tokens_total{...} 774.0
# vllm:spec_decode_num_accepted_tokens_total{...} 468.0
```

468 of 774 guesses accepted. 60%. The author of the build measured 41 to 67% depending on content, so mine is on the good side.

I didn't take a clean before-and-after speed measurement. What I have is Opencode's own number on a real task with MTP on.

## Step 8: Pointing Opencode at the new model

On the MacBook the model name changed in three places. One `sed` covers them:

```bash showLineNumbers=false
sed -i '' -e 's/qwen3\.5-35b/qwen3.8-27b/g' \
  -e 's/Qwen3\.5 35B-A3B (GPTQ)/Qwen3.8 27B (INT4)/' ~/.config/opencode/opencode.json
```

Then `opencode service restart` from Apple's Terminal. See Step 2 for why it has to be that terminal.

My first test was typing "ping". Bad test. The reply is a dozen tokens and Opencode divides them by the total time, which includes reading its own 19.6K token prompt. The first ping after a server restart took 28.8 seconds and showed 0.4 tokens per second. The second took 2.1 seconds, because the prompt was cached by then.

A real task is the honest test. In a Rails project I asked it to list the files in `app/models` and tell me what the largest one does. It read the files, answered and didn't stall.

```text showLineNumbers=false
Build - Qwen3.8 27B (INT4) - 12.8s - 71.6 tok/s
```

About 70 tokens per second with tool calls included. Slower per token than the old model, fast enough that I don't wait on it.

> The vLLM log reports generation speed averaged over 10 second windows, idle time included. It showed 38 to 50 for the same task. Trust the client's number.

## Where I ended up

| | April | Now |
| :------- | :------- | :------- |
| vLLM | The April build | 0.31.0 |
| Model | Qwen3.5-35B-A3B, GPTQ 4-bit | Qwen3.8-27B, AutoRound 4-bit |
| Context | 131K | 131K |
| Speed in Opencode | Faster per token | About 70 tokens per second with MTP |
| Start ritual | WSL, start vLLM | WSL, start vLLM, start the Opencode service from Apple's Terminal |

The old venv and the old model are still on disk. I'll delete them after a week without problems. That frees about 30 GB.

Still open: thinking mode is off, same as before. Qwen3.8 has a `reasoning_effort` setting with a `low` level. I want to try it and see if tool calls stay reliable.

What I'd tell myself before starting:

1. A working `curl` on macOS proves nothing about other programs. Test with `node`.
2. With Opencode 2, the app that starts the background service decides if it can reach your LAN.
3. Upgrade in a new venv and back up the serve script. Rollback should take a minute.
4. Check for an old CUDA toolkit and a `CUDA_HOME` in your service before blaming the new release.
5. When a `pip` install pulls CUDA packages, compare the compiler versions with the runtime version. They have to match.
6. Read the first error in the log, not the last.

In part one the model and the server were the easy parts and networking ate the time. This round the model was the easy part again. A permission switch on my Mac and four packages with the wrong version number ate the rest.

Happy coding `◝(ᵔᵕᵔ)◜`
