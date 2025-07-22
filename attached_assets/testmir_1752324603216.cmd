@echo off
REM Copyright (c) 2004-2025 Yury V. Vishnevskiy yu.v.vishnevskiy@gmail.com
REM All Rights Reserved.
REM This file is subject to the terms and conditions defined in the
REM 'license.txt' file, which is part of this package.
setlocal
setlocal EnableDelayedExpansion

set MDIR=%~dp0

where PowerShell >nul 2>nul
if !ERRORLEVEL! EQU 0 (
  set MYPS=PowerShell
) else (
  echo PowerShell is not in PATH!
  set MYPS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe
)

!MYPS! -NoProfile -ExecutionPolicy Bypass -File "%MDIR%testmir.ps1"
exit /b !ERRORLEVEL!
