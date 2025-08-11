# Netlify Deployment Script for BoxCric
Write-Host "🚀 Starting Netlify deployment for BoxCric..." -ForegroundColor Green

# Step 1: Run the fix script
Write-Host "`n1. Running deployment fix script..." -ForegroundColor Yellow
try {
    node fix-netlify-deployment.js
    Write-Host "✅ Fix script completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Fix script failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check if git is initialized
Write-Host "`n2. Checking git status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Git repository not found. Please initialize git first." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Git repository found" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install git first." -ForegroundColor Red
    exit 1
}

# Step 3: Add all changes
Write-Host "`n3. Adding changes to git..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "✅ Changes added to git" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add changes: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Commit changes
Write-Host "`n4. Committing changes..." -ForegroundColor Yellow
try {
    $commitMessage = "Fix Netlify deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    Write-Host "✅ Changes committed: $commitMessage" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to commit changes: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Push to remote
Write-Host "`n5. Pushing to remote repository..." -ForegroundColor Yellow
try {
    git push
    Write-Host "✅ Changes pushed to remote repository" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push changes: $_" -ForegroundColor Red
    Write-Host "Please check your git remote configuration." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🎉 Deployment preparation completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your Netlify dashboard" -ForegroundColor White
Write-Host "2. Your site should automatically redeploy" -ForegroundColor White
Write-Host "3. If not, manually trigger a new deployment" -ForegroundColor White
Write-Host "4. Set environment variable: VITE_API_URL=https://boxcric-api.onrender.com/api" -ForegroundColor White
Write-Host "5. Clear Netlify cache if needed" -ForegroundColor White
Write-Host "`n🔗 Your site will be available at: https://boxcric.netlify.app" -ForegroundColor Green 