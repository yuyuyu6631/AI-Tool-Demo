$ErrorActionPreference = "Stop"

$FfmpegCommand = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($FfmpegCommand) {
  $Ffmpeg = $FfmpegCommand.Source
} else {
  $FallbackFfmpeg = "C:\Users\Administrator\AppData\Local\GlobalCLI\ffmpeg.exe"
  if (-not (Test-Path -LiteralPath $FallbackFfmpeg)) {
    throw "ffmpeg not found in PATH or fallback location"
  }
  $Ffmpeg = $FallbackFfmpeg
}

$RepoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$OutputRoot = Join-Path $RepoRoot "output/demo"
$RawVideo = Join-Path $OutputRoot "system-demo-raw.webm"
$SubtitleFile = Join-Path $OutputRoot "system-demo.srt"
$ShiftedSubtitleFile = Join-Path $OutputRoot "system-demo-shifted.srt"
$ScriptFile = Join-Path $OutputRoot "demo-script.md"
$IntroVideo = Join-Path $OutputRoot "intro.mp4"
$MainVideo = Join-Path $OutputRoot "main.mp4"
$ConcatFile = Join-Path $OutputRoot "concat.txt"
$FinalVideo = Join-Path $OutputRoot "system-demo-final.mp4"

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

function Assert-LastExitCode {
  param([string]$Step)
  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE"
  }
}

function Convert-ToMilliseconds {
  param([string]$Timestamp)
  $parts = $Timestamp -split '[:,]'
  return ([int]$parts[0] * 3600000) + ([int]$parts[1] * 60000) + ([int]$parts[2] * 1000) + [int]$parts[3]
}

function Convert-ToSrtTimestamp {
  param([int]$Milliseconds)
  $hours = [int][math]::Floor($Milliseconds / 3600000)
  $minutes = [int][math]::Floor(($Milliseconds % 3600000) / 60000)
  $seconds = [int][math]::Floor(($Milliseconds % 60000) / 1000)
  $ms = [int]($Milliseconds % 1000)
  return ("{0:D2}:{1:D2}:{2:D2},{3:D3}" -f $hours, $minutes, $seconds, $ms)
}

$scriptText = @"
# 系统演示文案

## 视频定位
本次成片采用“菜单总览 + 现有主线”的结构。
前半段完整展示桌面端系统级导航和工具目录核心筛选菜单，后半段继续演示搜索、详情查看和回列表二次筛选。

## 镜头文案
1. 首页先展示推荐入口、常用分类和精选工具，让观众先理解系统的整体入口。
2. 顶部一级导航依次切换到工具目录、榜单和场景，完整覆盖当前桌面端系统菜单。
3. 回到工具目录后，继续展示决策快捷入口、预设视图、排序、分类、价格和标签等核心菜单。
4. 展开“查看更多分类”和“更多标签”，确保隐藏菜单项也被完整展示。
5. 菜单总览结束后，进入搜索主线，通过关键字快速定位目标工具。
6. 进入详情页后展示摘要、信息区和同类推荐，再返回目录做二次筛选。

## 成片说明
- 原始录制：Playwright 浏览器自动演示
- 后期处理：FFmpeg 片头拼接 + 独立字幕交付
- 输出比例：16:9
"@

Set-Content -LiteralPath $ScriptFile -Value $scriptText -Encoding UTF8

$subtitleLines = Get-Content -LiteralPath $SubtitleFile
$shiftedLines = foreach ($line in $subtitleLines) {
  if ($line -match '^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$') {
    $start = Convert-ToMilliseconds $matches[1]
    $end = Convert-ToMilliseconds $matches[2]
    "$(Convert-ToSrtTimestamp ($start + 3000)) --> $(Convert-ToSrtTimestamp ($end + 3000))"
  } else {
    $line
  }
}
Set-Content -LiteralPath $ShiftedSubtitleFile -Value $shiftedLines -Encoding UTF8

Push-Location $OutputRoot

& $Ffmpeg -y -hide_banner `
  -f lavfi -i color=c=#0f172a:s=1600x900:d=3 `
  -c:v libx264 -pix_fmt yuv420p "intro.mp4"
Assert-LastExitCode "Generate intro"

& $Ffmpeg -y -hide_banner `
  -i "system-demo-raw.webm" `
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p `
  "main.mp4"
Assert-LastExitCode "Convert main video"

$concatText = @"
file 'intro.mp4'
file 'main.mp4'
"@
Set-Content -LiteralPath $ConcatFile -Value $concatText -Encoding ASCII

& $Ffmpeg -y -hide_banner `
  -f concat -safe 0 -i "concat.txt" `
  -c:v libx264 -preset medium -crf 22 `
  "system-demo-final.mp4"
Assert-LastExitCode "Render final video"

Pop-Location

Write-Output $FinalVideo
