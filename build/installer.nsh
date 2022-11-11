!macro customInstall
  CreateShortcut "$INSTDIR\串口服务端.lnk" "$INSTDIR\Bittly.exe" "tool-serialport-server"
  CreateShortcut "$STARTMENU\Programs\Bittly\串口服务端.lnk" "$INSTDIR\Bittly.exe" "tool-serialport-server"
  CreateShortcut "$INSTDIR\Web Socket 服务端.lnk" "$INSTDIR\Bittly.exe" "tool-ws-server"
  CreateShortcut "$STARTMENU\Programs\Bittly\Web Socket 服务端.lnk" "$INSTDIR\Bittly.exe" "tool-ws-server"
  CreateShortcut "$INSTDIR\UDP 服务端.lnk" "$INSTDIR\Bittly.exe" "tool-udp-server"
  CreateShortcut "$STARTMENU\Programs\Bittly\UDP 服务端.lnk" "$INSTDIR\Bittly.exe" "tool-udp-server"
  CreateShortcut "$INSTDIR\TCP 服务端.lnk" "$INSTDIR\Bittly.exe" "tool-tcp-server"
  CreateShortcut "$STARTMENU\Programs\Bittly\TCP 服务端.lnk" "$INSTDIR\Bittly.exe" "tool-tcp-server"
  
  DeleteRegKey HKCU "SOFTWARE\Classes\bittly"
  WriteRegStr HKCU "SOFTWARE\Classes\bittly" "" "URL:bittly"
  WriteRegStr HKCU "SOFTWARE\Classes\bittly" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\bittly\shell" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\bittly\shell\Open" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\bittly\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} index %1"
!macroend

!macro customUnInstall
  Delete "$INSTDIR\串口服务端.lnk"
  Delete "$STARTMENU\Programs\Bittly\串口服务端.lnk"
  Delete "$INSTDIR\Web Socket 服务端.lnk"
  Delete "$STARTMENU\Programs\Bittly\Web Socket 服务端.lnk"
  Delete "$INSTDIR\UDP 服务端.lnk"
  Delete "$STARTMENU\Programs\Bittly\UDP 服务端.lnk"
  Delete "$INSTDIR\TCP 服务端.lnk"
  Delete "$STARTMENU\Programs\Bittly\TCP 服务端.lnk"

  DeleteRegKey HKCU "SOFTWARE\Classes\bittly"
!macroend