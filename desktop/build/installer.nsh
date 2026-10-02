; Barcode POS runs the API as a second process using the same .exe (ELECTRON_RUN_AS_NODE).
; NSIS must stop all instances (/T) or file copy fails mid-install.

!macro preInit
  DetailPrint "Stopping any running Barcode POS processes before setup…"
  nsExec::ExecToLog 'taskkill /F /T /IM "Barcode POS.exe" 2>nul'
  Sleep 1000
!macroend

!macro customCheckAppRunning
  DetailPrint "Closing ${PRODUCT_NAME} (including background server)…"
  nsExec::ExecToLog 'taskkill /F /T /IM "${APP_EXECUTABLE_FILENAME}" 2>nul'
  Sleep 1500
!macroend
