# PowerShell script to fix the ThemeProvider error
# Run this script in PowerShell: .\fix-install.ps1

Write-Host "Cleaning up node_modules and package-lock.json..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Reinstalling packages..." -ForegroundColor Yellow
npm install

Write-Host "Done! Now run 'npm start' to start the app." -ForegroundColor Green

