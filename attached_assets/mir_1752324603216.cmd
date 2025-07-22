@echo off
rem Copyright (c) 2004-2025 Yury V. Vishnevskiy yu.v.vishnevskiy@gmail.com
rem All Rights Reserved.
rem This file is subject to the terms and conditions defined in the
rem 'license.txt' file, which is part of this package.
setlocal
setlocal EnableDelayedExpansion

rem Using this script Mir can be started through a wrapper program
rem defined with the command line option --wrapper and an argument
rem corresponding to the required wrapper, for example
rem mir.cmd --wrapper "timeout.exe 3s" --print-topeval
rem The default wrapper is the rlwrap program.

set "WD=%__CD__%"
if "x%MIR_ROOT_DIR%"=="x" set MIR_ROOT_DIR=%~dp0
if "x%MIR_MOD_DIR%"=="x" set MIR_MOD_DIR=%MIR_ROOT_DIR%\modules
if "x%MIR_LIB_DIR%"=="x" set MIR_LIB_DIR=%MIR_ROOT_DIR%\mirlib

set HOME=%MIR_ROOT_DIR%
set TERM=cygwin
set TERMINFO=%HOME%/.terminfo

rem Process command line arguments for this script
set MIR_ARGS=
:checkparams
if not "x%~1"=="x" (
  if "x%~1"=="x--wrapper" (
    if "x%~2"=="x" (
      echo Wrapper program is not specified. 1>&2
      exit /b 2
    )
    set MIR_WRAPPER=%2
    set MIR_WRAPPER_PROVIDED=y
    shift
  ) else (
    set MIR_ARGS=%MIR_ARGS% %1
    set MIR_ARGS_PROVIDED=y
  )
) & shift & goto :checkparams

if "x%MIR_ARGS_PROVIDED%"=="x" (
  set MIR_ARGS=--print-topeval --print-sbanner --print-ebanner
  if "x%MIR_WRAPPER_PROVIDED%"=="x" set MIR_WRAPPER="%MIR_ROOT_DIR%\bin\rlwrap.exe"
)

%MIR_WRAPPER% "%MIR_ROOT_DIR%\bin\mir.exe" %MIR_ARGS%

exit /b !ERRORLEVEL!
