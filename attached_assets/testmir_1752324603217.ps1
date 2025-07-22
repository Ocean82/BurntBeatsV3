# Copyright (c) 2004-2025 Yury V. Vishnevskiy yu.v.vishnevskiy@gmail.com
# All Rights Reserved.
# This file is subject to the terms and conditions defined in the
# 'license.txt' file, which is part of this package.

param (
 [Parameter(Mandatory=$false)][string]$mirdir
)

$EXITCODE = 0

$MIRDIR = $mirdir

$TFILECUR = ''

function Check-Reference($logfile, $reffile, $errfile) {
  $failed=0
  $reflines = Get-Content $reffile
  foreach ($refline in $reflines) {
    if (Select-String -Path $logfile -Pattern $refline -SimpleMatch -CaseSensitive -Quiet) {
      # all good
    }
    else {
      $failed++
      Add-Content -Path $errfile -Value "NoRefStr: $refline"
    }
  }
  $failed
}


try {
  #(Get-Variable PSVersionTable -ValueOnly).PSVersion
  if (($global:MIRDIR -eq $null) -or ($global:MIRDIR -eq "")) {
    $global:MIRDIR = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
  }
  $mirdir = $global:MIRDIR
  
  $mir = $mirdir + "\mir.cmd"
  $umoddir = $mirdir + "\modules"
  $mirlibdir = $mirdir + "\mirlib"
  $mirlibdir1 = $mirdir + "\tests\public\data\mirlib"
  $testdir = $mirdir + "\tests\public\inp"
  
  $timeoutSeconds = 120
  
  $elapsedTime = [System.Diagnostics.Stopwatch]::StartNew()
  
  # Clean up after last run
  # Deleting all files except *.inp and *.ref
  # Wrap in array @( ) to prevent iterating in forearch over null in PowerShell <= 2.
  $ofiles = @( Get-ChildItem $testdir -Exclude "*.inp","*.ref" -Recurse | Where-Object { !$_.PSIsContainer } | Select -ExpandProperty FullName )
  foreach ($ofile in $ofiles) { Remove-Item -Force $ofile }
  # Delete empty subdirs
  do {
    $ddirs = @(Get-ChildItem $testdir -Recurse | Where-Object { $_.PSIsContainer } | Where { @(Get-ChildItem $_.FullName -Force).Count -eq 0 } | Select -ExpandProperty FullName)
    $ddirs | Foreach-Object { Remove-Item $_ }
  } while ($ddirs.Count -gt 0)
  
  # Wrap in array @( ) to prevent iterating in forearch over null in PowerShell <= 2.
  $tfiles = @( Get-ChildItem $testdir -Filter "*.inp" -Recurse | Select -ExpandProperty FullName )

  $ttotal = $tfiles.Count
  $tcurrent = 0
  $tpassed  = 0
  $tpassed_ref = 0
  $tfailed  = 0
  $tfailed_ref = 0
  $tskippd  = 0
  $ttimeout = 0

  foreach ($tfile in $tfiles) {
    $tcurrent++
    $global:TFILECUR = $tfile.Replace($mirdir+"\", '')
    $curmsg = "$tcurrent of $ttotal  $global:TFILECUR ... "
    
    $tdir = [IO.Path]::GetDirectoryName($tfile)
    $tifname = [IO.Path]::GetFileName($tfile)
    $tofname = $tdir + "\" + [IO.Path]::GetFileNameWithoutExtension($tfile) + ".log" # with absolute path
    $tefname = $tdir + "\" + [IO.Path]::GetFileNameWithoutExtension($tfile) + ".err" # with absolute path
    $trfname = $tdir + "\" + [IO.Path]::GetFileNameWithoutExtension($tfile) + ".ref" # with absolute path

    # Skip tests if need
    if ($tifname -match "perfcomp") {
      Write-Output ($curmsg + "Skipped")
      $tskippd++
      Continue
    }

    $code = {
      & $args[0] --mod-path $args[1] --cwd $args[2] --lib-path $args[3] --lib-path $args[4] --log mir.log --print-topeval --exit-on-error --exit-on-exc --echo $args[5] > $args[6] 2> $args[7]
      $LastExitCode
    }

    $job = Start-Job -ScriptBlock $code -ArgumentList @($mir,$umoddir,$tdir,$mirlibdir,$mirlibdir1,$tifname,$tofname,$tefname)
    
    if (Wait-Job $job -Timeout $timeoutSeconds) {
      # Get here if the job is no more running
      if ($job.State -eq "Completed") {
	$lec = Receive-Job $job

        if ([int]$lec -eq 0) {
	  # If reference file exists, do checks
	  if (Test-Path -Path $trfname -PathType Leaf) {
	    $ret = Check-Reference $tofname $trfname $tefname
	    if ([int]$ret -eq 0) {
              Write-Output ($curmsg + "Successful")
              $tpassed++
              $tpassed_ref++
	    }
            else {
              Write-Output ($curmsg + "Failed")
              $tfailed++
              $tfailed_ref++
            }
	  }
          else {
            Write-Output ($curmsg + "Successful")
            $tpassed++
	  }
        }
        else {
          Write-Output ($curmsg + "Failed")
          $tfailed++
        }
      }
      else {
        Write-Output ($curmsg + "Failed")
        $tfailed++
      }
    }
    else {
      Remove-Job -Force $job
      Write-Output ($curmsg + "Timeout")
      $ttimeout++
    }
    
    # Remove empty *.err file
    if ((Test-Path -Path $tefname -PathType Leaf) -And ((Get-Content $tefname) -eq $Null)) {
      Remove-Item -Force $tefname
    }
    
  }
}
catch {
  Write-Output "---------------------------------------------------------------------------"
  Write-Output "Error:"
  $_
  Write-Output " "
  Write-Output "Current test: $global:TFILECUR"
  Write-Output "---------------------------------------------------------------------------"
  $EXITCODE = 1
}
finally {
  # Code to run on exit
  Write-Output "Skipped: $tskippd"
  Write-Output "Passed:  $tpassed ($tpassed_ref with external reference)"
  Write-Output "Failed:  $tfailed ($tfailed_ref with external reference)"
  Write-Output "Timeout: $ttimeout"
  if ([int]$tfailed -ne 0) { $EXITCODE = 1 }
  if ([int]$ttimeout -ne 0) { $EXITCODE = 1 }
  
  Write-Output "Total elapsed time: $($elapsedTime.Elapsed.ToString())"
}

exit $EXITCODE
