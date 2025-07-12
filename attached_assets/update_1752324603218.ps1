# Copyright (c) 2004-2025 Yury V. Vishnevskiy yu.v.vishnevskiy@gmail.com
# All Rights Reserved.
# This file is subject to the terms and conditions defined in the
# 'license.txt' file, which is part of this package.

param (
 [Parameter(Mandatory=$false)][string]$progdir,
 [switch]$assume_yes = $false
)

$EXITCODE = 0

$UDIR=$progdir
$UURLS="https://mir.vishnevskiy.group/files/"
$UURL=""
$TMPDIR=""
$SHA1=""
$UPDRDY=$false

function MyGet-FileHash($file) {
  [System.BitConverter]::ToString($global:SHA1.ComputeHash([System.IO.File]::ReadAllBytes($file)))
}


function New-TemporaryDirectory {
    $parent = [System.IO.Path]::GetTempPath()
    [string] $name = [System.Guid]::NewGuid()
    $global:TMPDIR = Join-Path $parent $name
    New-Item -ItemType Directory -Force -Path $global:TMPDIR | Out-Null
}


# In PS 2.0 there is no support for unpacking zip files so using COM object
function Expand-ZIPFile($file, $destination) {
  $shell = new-object -com shell.application
  $zip = $shell.NameSpace($file)
  foreach($item in $zip.items()) {
    $shell.Namespace($destination).copyhere($item)
  }
}


# In PS 2.0 there is no support for unpacking tar.gz files
function Expand-TARGZ($file, $destination) {
  # Prefer our gzip.exe
  if (Get-Command ($global:UDIR + "\bin\" + "gzip.exe") -ErrorAction SilentlyContinue) {
    $gzexe = $global:UDIR + "\bin\" + "gzip.exe"
  }
  # or try gzip.exe in PATH
  elseif (Get-Command "gzip.exe" -ErrorAction SilentlyContinue) { 
    $gzexe = "gzip.exe"
  }
  else {
    throw "Cannot find fully functional gzip.exe"
  }

  # Prefer our tar.exe
  if (Get-Command ($global:UDIR + "\bin\" + "tar.exe") -ErrorAction SilentlyContinue) {
    $tarexe = $global:UDIR + "\bin\" + "tar.exe"
  }  
  # or try tar.exe in PATH
  elseif (Get-Command "tar.exe" -ErrorAction SilentlyContinue) { 
    $tarexe = "tar.exe"
  }
  else {
    throw "Cannot find fully functional tar.exe"
  }
  
  & "$gzexe" "-d" "$file"
  if ($LastExitCode) {
    throw ("Error: gzip failed, exit code " + $LastExitCode)
  }
  
  $tarfile = $file -replace ".gz"
  # We need to escape backslashes for the output path of tar
  $dst = $destination -replace "\\","\\"
  & "$tarexe" "-xf" "$tarfile" "-C" "$dst" "--force-local"
  if ($LastExitCode) {
    throw ("Error: tar failed, exit code " + $LastExitCode)
  }
}


function Del-ProgItem($fname) {
  $fpath = $global:UDIR + "\" + $fname
  if(Test-Path -Path $fpath) {Remove-Item -Recurse -Force $fpath | Out-Null}
}


# A script block (anonymous function) that will remove empty dirs
# in a root dir, using tail-recursion to ensure that it only
# walks the tree once. -Force is used to be able to process
# hidden files/dirs as well.
$tailRecursion = {
    param($Path)
    foreach ($childDirectory in Get-ChildItem -Force -LiteralPath $Path | ?{ $_.PSIsContainer }) {
        & $tailRecursion -Path $childDirectory.FullName
    }
    $currentChildren = Get-ChildItem -Force -LiteralPath $Path
    $isEmpty = $currentChildren -eq $null
    if ($isEmpty) {
        Remove-Item -Force -LiteralPath $Path
    }
}

$UPROGSTR = ''
$UVERSTR = ''
$UMAJORVER = ''
$UMINORVER = ''
$UCOMMNUM = ''
$UFILEB = ''

function Parse-UVerFile($fpath) {
  $uprogstr = Get-Content $fpath | Select -Index 0
  $uverstr = Get-Content $fpath | Select -Index 1 # Format: 2.0-1567-g2f1d8f5b (2019-09-02)
  $losstr = Get-Content $fpath | Select -Index 2
  $larchstr =  Get-Content $fpath | Select -Index 3
  $lbldstr = Get-Content $fpath | Select -Index 4
  $umajorver = ($uverstr.Split("-.", 3) | Select -Index 0)
  $uminorver = ($uverstr.Split("-.", 3) | Select -Index 1)
  $ucommnum = ($uverstr.Split("-", 3) | Select -Index 1)

  if ($losstr -eq "Windows") {
    $fosstr = "win"
  }
  else {
    throw "Invalid OS string '$losstr'"
  }

  if ($larchstr -eq "x86_64/Core2") {
    $farchstr = "x86-64-core2"
  }
  elseif ($larchstr -eq "x86/i686") {
    $farchstr = "x86-i686"
  }
  else {
    throw "Invalid Arch string '$larchstr'"
  }

  if ($lbldstr -eq "Release") {
    $fbldstr = "release"
  }
  elseif ($lbldstr -eq "Debug") {
    $fbldstr = "debug"
  }
  else {
    throw "Invalid build type string '$lbldstr'"
  }

  $global:UPROGSTR = $uprogstr
  $global:UVERSTR = $uverstr
  $global:UMAJORVER = $umajorver
  $global:UMINORVER = $uminorver
  $global:UCOMMNUM = $ucommnum
  $global:UFILEB=$uprogstr.ToLower() + "_" + $fosstr + "_" + $farchstr + "_" + $fbldstr
}


function Update-License() {
  $lhtmlicf = $global:UDIR + "\license.html"
  $ltxtlicf = $global:UDIR + "\license.txt"
  $lpdflicf = $global:UDIR + "\license.pdf"
  $rhtmlicf = $global:TMPDIR + "\license.html"
  $htmlic_file_url = $global:UURL + "license.html"
  $txtlic_file_url = $global:UURL + "license.txt"
  $pdflic_file_url = $global:UURL + "license.pdf"
  # Get remote version
  (New-Object Net.WebClient).DownloadFile($htmlic_file_url, $rhtmlicf)
  $rlichash = MyGet-FileHash $rhtmlicf
  if ($lhtmlicf -And (Test-Path -Path $lhtmlicf)) {
    $llichash = MyGet-FileHash $lhtmlicf
  }
  else {
    $llichash = "qwerty"
  }
  if ($rlichash -ne $llichash) {
    if ($lhtmlicf -And (Test-Path -Path $lhtmlicf)) {Move-Item -Path $lhtmlicf -Destination $lhtmlicf.Insert($lhtmlicf.LastIndexOf('.'),"_old") -Force}
    if ($ltxtlicf -And (Test-Path -Path $ltxtlicf)) {Move-Item -Path $ltxtlicf -Destination $ltxtlicf.Insert($ltxtlicf.LastIndexOf('.'),"_old") -Force}
    if ($lpdflicf -And (Test-Path -Path $lpdflicf)) {Move-Item -Path $lpdflicf -Destination $lpdflicf.Insert($lpdflicf.LastIndexOf('.'),"_old") -Force}
    Copy-Item $rhtmlicf -Destination $global:UDIR -Force
    (New-Object Net.WebClient).DownloadFile($txtlic_file_url, $ltxtlicf)
    (New-Object Net.WebClient).DownloadFile($pdflic_file_url, $lpdflicf)
    Write-Output "Warning, license has been updated!"
  }
}


function Validate-URL($url) {
  $HTTP_Request = [System.Net.WebRequest]::Create($url)
  $HTTP_Request.Method = "HEAD"
  $HTTP_Status = 0
  try {
    $HTTP_Response = $HTTP_Request.GetResponse()
    $HTTP_Status = [int]$HTTP_Response.StatusCode
  }
  catch {
    $Error.Clear()
  }
  finally {
    if ($HTTP_Response -eq $null) { }
    else { $HTTP_Response.Close() }
  }

  if ($HTTP_Status -eq 200) {
    return $true
  }
  else {
    return $false
  }
}


function Update-Prog() {
  $ufileb = $global:UFILEB
  $udir = $global:UDIR
  $tmpdir = $global:TMPDIR
  $uprogstr = $global:UPROGSTR

  Write-Output ("Warning, old files in ${uprogstr} directory will be deleted!")
  Write-Output ("${uprogstr} directory: ${udir}")

  if ($assume_yes) {
    $proceed = $true
  }
  else {
    $proceed = $false
    $msg = 'Do you want to proceed? (Y/n)'
    $response = Read-Host -Prompt $msg
    if ($response -eq 'y' -or $response -eq 'Y' -or $response -eq '') {
      $proceed = $true
    }
  }
    
  if ($proceed) {
    # Try first tar.gz
    $uarc_ext = "tar.gz"
    $arc_file_url = $global:UURL + $ufileb + "." + $uarc_ext

    if (!(Validate-URL($arc_file_url))) {
      # O.k., then zip
      $uarc_ext = "zip"
      $arc_file_url = $global:UURL + $ufileb + "." + $uarc_ext
    }

    $rarcf = $tmpdir + "\" + $ufileb + "." + $uarc_ext
    # Get remote archive
    Write-Output ("Downloading from " + $arc_file_url)
    (New-Object Net.WebClient).DownloadFile($arc_file_url, $rarcf)

    Write-Output ("Extracting files.")
    if ($uarc_ext -eq "tar.gz") {
      Expand-TARGZ -File $rarcf -Destination $tmpdir
    }
    elseif ($uarc_ext -eq "zip") {
      Expand-ZIPFile -File $rarcf -Destination $tmpdir
    }
    else {
      throw "Invalid archive file type '$uarc_ext'"
    }

    # Delete old files explicitly
    Write-Output "Deleting old files."
    $offile = $udir + "\files.txt"
    if(Test-Path -Path $offile) {
      $ofiles = Get-Content $offile
      foreach ($ofile in $ofiles) {
        Del-ProgItem $ofile
      }
    }

    # Copy new files
    Write-Output ("Copying new files.")
    Copy-Item ($tmpdir + "\" + $ufileb + "\*") -Destination $udir -Recurse -Force

    # Delete empty directories
    Write-Output ("Deleting empty directories.")
    & $tailRecursion -Path $udir

    Write-Output "Update successfully completed."
  }
  else {
    Write-Output ("Update terminated.")
    $global:EXITCODE = 1
  }
}


function Find-Best-URL() {
  $lmajorver = $global:UMAJORVER
  $lminorver = $global:UMINORVER
  $lcommnum = $global:UCOMMNUM
  $uprogstr = $global:UPROGSTR
  $ufileb = $global:UFILEB
  $tmpdir = $global:TMPDIR
  $rverf = $tmpdir + "\" + $ufileb + ".txt"
  $urls = ($global:UURLS).Split(" ")
  foreach($url in $urls) {
    $ver_file_url = "$url" + $ufileb + ".txt"
    if (Validate-URL($ver_file_url)) {
      $global:UURL = $url

      # Get remote version file
      (New-Object Net.WebClient).DownloadFile($ver_file_url, $rverf)

      $rverstr = Get-Content $rverf | Select -Index 0  # Format: 1.6-1430 (2023-08-07)
      $rmajorver = ($rverstr.Split("-.", 3) | Select -Index 0)
      $rminorver = ($rverstr.Split("-.", 3) | Select -Index 1)
      $rcommnum = ($rverstr.Split("- ", 3) | Select -Index 1)

      # Check priorities: majorver > minorver > commnum
      if ([int]$rmajorver -gt $lmajorver) {
        $global:UPDRDY = $true
      }
      elseif ([int]$rmajorver -eq $lmajorver) {
        if ([int]$rminorver -gt $lminorver) {
          $global:UPDRDY = $true
        }
        elseif ([int]$rminorver -eq $lminorver) {
          if ([int]$rcommnum -gt $lcommnum) {
            $global:UPDRDY = $true
          }
        }
      }

      if ($global:UPDRDY) {
        Write-Output ("An update for ${uprogstr} is available: ${rverstr}")
        break
      }
    }
  }
}


try {
  Write-Output ("Using PowerShell " + $PSVersionTable.PSVersion)

  if (($global:UDIR -eq $null) -or ($global:UDIR -eq "")) {
    $global:UDIR = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
  }
  $udir = $global:UDIR

  New-TemporaryDirectory
  $tmpdir = $global:TMPDIR

  # This is for MyGet-FileHash
  $global:SHA1 = New-Object System.Security.Cryptography.SHA1CryptoServiceProvider

  $lverf = $udir + "\version.txt"
  Parse-UVerFile $lverf
  Write-Output ("Local ${UPROGSTR} version: ${UVERSTR}")

  Find-Best-URL

  if ($global:UURL) {
    Update-License
  }

  if ($global:UPDRDY) {
    Update-Prog
  }
  elseif ($global:UURL) {
    Write-Output ("Local version is up to date.")
  }
  else {
    Write-Output ("Cannot locate server with updates!")
    Write-Output ("Try to update manually!")
    $global:EXITCODE = 1
  }

}
catch {
  Write-Output "$($_.Exception.Message)"
  $global:EXITCODE = 1
}
finally {
  # Code to run on exit
  # Delete temp dir
  Write-Output "Clean up update."
  if ($global:TMPDIR -And (Test-Path -Path $global:TMPDIR)) {Remove-Item -Recurse -Force $global:TMPDIR | Out-Null}
}

exit $EXITCODE
