@echo off
REM Copyright (c) 2004-2025 Yury V. Vishnevskiy yu.v.vishnevskiy@gmail.com
REM All Rights Reserved.
REM This file is subject to the terms and conditions defined in the
REM 'license.txt' file, which is part of this package.
setlocal
setlocal EnableDelayedExpansion

set UDIR=%~dp0
set MYNAME=%~f0
set EXIST_CMD=%UDIR%update.cmd
set EXE_CMD=%UDIR%_update.cmd
set EXIST_PS1=%UDIR%update.ps1
set EXE_PS1=%UDIR%_update.ps1
set RETCODE=0

:checkparams
rem Help option
if "x%~1" == "x-h" (
  call :printhelp "%~nx0"
  exit /b 0
)
if "x%~1" == "x--help" (
  call :printhelp "%~nx0"
  exit /b 0
)


rem Collect remaining command line arguments
set PS1_ARGS=
:collectparams
if not "x%~1" == "x" set PS1_ARGS=%PS1_ARGS% %1& shift & goto :collectparams


where cmd >nul 2>nul
if !ERRORLEVEL! EQU 0 (
  set MYCMD=cmd
) else (
  echo cmd.exe is not in PATH!
  set MYCMD=%SystemRoot%\System32\cmd.exe
)

where attrib >nul 2>nul
if !ERRORLEVEL! EQU 0 (
  set MYATTRIB=attrib
) else (
  echo attrib.exe is not in PATH!
  set MYATTRIB=%SystemRoot%\System32\attrib.exe
)


if "%MYNAME%"=="%EXIST_CMD%" (
  echo In starting update script
REM Prepare temp scripts
  copy "%EXIST_CMD%" "%EXE_CMD%" >nul || goto :error
  copy "%EXIST_PS1%" "%EXE_PS1%" >nul || goto :error
  %MYATTRIB% "%EXE_CMD%" +h >nul || goto :error
  %MYATTRIB% "%EXE_PS1%" +h >nul || goto :error
REM Run temp scripts
  %MYCMD% /c "%EXE_CMD%" %PS1_ARGS%
  set RETCODE=!ERRORLEVEL!
REM Delete temp scripts
  %MYATTRIB% "%EXE_CMD%" -h >nul
  %MYATTRIB% "%EXE_PS1%" -h >nul
  %MYCMD% /c del "%EXE_CMD%" "%EXE_PS1%" || goto :error
  exit /b !RETCODE!
) else (
  echo In working update script.
  where PowerShell >nul 2>nul
  if !ERRORLEVEL! EQU 0 (
    PowerShell -NoProfile -ExecutionPolicy Bypass -File "%EXE_PS1%" %PS1_ARGS%
    set RETCODE=!ERRORLEVEL!
  ) else (
    echo PowerShell is not in PATH!
    echo Trying to call PowerShell directly...
    %SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%EXE_PS1%" %PS1_ARGS%
    set RETCODE=!ERRORLEVEL!
  )
)

exit /b !RETCODE!

:error
echo Updating has failed with error code !ERRORLEVEL!
exit /b !ERRORLEVEL!

:printhelp
echo Usage:
echo %~1 [-assume_yes] [-h,--help]
echo.
echo -assume_yes  Automatic yes to prompts
echo -h,--help    Show help message
echo.
exit /b 0
