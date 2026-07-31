#!/bin/bash

# ===================================
# 📧 GAMIL - Setup Script
# ===================================
# This script automates the entire setup process
# Just run: bash setup.sh
# ===================================

set -e

echo ""
echo "📧 GAMIL - Email Management System Setup"
echo "========================================="
echo ""

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        echo -e "${YELLOW}⚠️  Wrangler CLI not found. Installing...${NC}"
        npm install -g wrangler
        echo -e "${GREEN}✅ Wrangler installed successfully!${NC}"
    else
        echo -e "${GREEN}✅ Wrangler already installed${NC}"
    fi
}

# Check if logged in to Cloudflare
check_login() {
    if ! wrangler whoami &> /dev/null; then
        echo ""
        echo -e "${YELLOW}⚠️  Not logged in to Cloudflare${NC}"
        echo "Please login to your Cloudflare account..."
        wrangler login
    else
        echo -e "${GREEN}✅ Logged in to Cloudflare${NC}"
    fi
}

# Create D1 Database
create_database() {
    echo ""
    echo "📦 Creating D1 Database..."
    
    # Run the create command and capture the output
    OUTPUT=$(wrangler d1 create gamil-emails 2>&1)
    
    # Extract database_id from output
    DATABASE_ID=$(echo "$OUTPUT" | grep -oP 'database_id = "\K[^"]+')
    
    if [ -z "$DATABASE_ID" ]; then
        echo -e "${RED}❌ Failed to create database. Please check the error above.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Database created successfully!${NC}"
    echo ""
    echo "Database ID: $DATABASE_ID"
    
    # Update wrangler.toml with the database ID
    if [ -f "worker/wrangler.toml" ]; then
        # Use different sed syntax for macOS vs Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/YOUR_D1_DATABASE_ID_HERE/$DATABASE_ID/" worker/wrangler.toml
        else
            sed -i "s/YOUR_D1_DATABASE_ID_HERE/$DATABASE_ID/" worker/wrangler.toml
        fi
        echo -e "${GREEN}✅ Updated wrangler.toml with database ID${NC}"
    fi
}

# Initialize database tables
init_database() {
    echo ""
    echo "🗄️  Initializing database tables..."
    
    cd worker
    wrangler d1 execute gamil-emails --file=./schema.sql
    cd ..
    
    echo -e "${GREEN}✅ Database tables created!${NC}"
}

# Set environment variables
set_secrets() {
    echo ""
    echo "🔐 Setting up environment variables..."
    echo ""
    echo -e "${YELLOW}You'll need to enter values for:${NC}"
    echo "  1. RESEND_API_KEY - Get from resend.com"
    echo "  2. FRONTEND_URL  - Your Vercel deployment URL"
    echo "  3. API_KEY       - A secure random string for authentication"
    echo "  4. CONFIGURED_EMAILS - Your email addresses (comma separated)"
    echo ""
    
    cd worker
    
    # Resend API Key
    echo -e "${YELLOW}Enter your Resend API Key:${NC}"
    wrangler secret put RESEND_API_KEY
    
    # Frontend URL (placeholder for now)
    echo -e "${YELLOW}Enter your Frontend URL (you can update this later):${NC}"
    echo "Example: https://your-app.vercel.app"
    wrangler secret put FRONTEND_URL
    
    # Generate API Key
    echo ""
    echo -e "${YELLOW}Generating secure API Key...${NC}"
    API_KEY=$(openssl rand -hex 32)
    echo "$API_KEY" | wrangler secret put API_KEY
    echo -e "${GREEN}✅ API Key generated: $API_KEY${NC}"
    
    # Save API Key to .env for frontend
    echo "NEXT_PUBLIC_API_KEY=$API_KEY" > ../frontend/.env.local
    echo -e "${GREEN}✅ Saved API Key to frontend/.env.local${NC}"
    
    # Configured Emails
    echo -e "${YELLOW}Enter your email addresses (comma separated):${NC}"
    echo "Example: hello@yourdomain.com,support@yourdomain.com"
    wrangler secret put CONFIGURED_EMAILS
    
    cd ..
}

# Deploy worker
deploy_worker() {
    echo ""
    echo "🚀 Deploying Cloudflare Worker..."
    
    cd worker
    wrangler deploy
    cd ..
    
    # Get the worker URL
    WORKER_URL=$(cd worker && wrangler whoami 2>&1 | head -1)
    
    echo ""
    echo -e "${GREEN}✅ Worker deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Copy your Worker URL from Cloudflare Dashboard"
    echo "2. Update config.js with your Worker URL"
    echo "3. Setup Cloudflare Email Routing"
    echo "4. Deploy frontend to Vercel"
}

# Main setup function
main() {
    echo ""
    echo -e "${YELLOW}This script will:${NC}"
    echo "  1. Check and install Wrangler CLI"
    echo "  2. Login to Cloudflare"
    echo "  3. Create D1 Database"
    echo "  4. Initialize database tables"
    echo "  5. Set up environment variables"
    echo "  6. Deploy Cloudflare Worker"
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    check_wrangler
    check_login
    create_database
    init_database
    set_secrets
    deploy_worker
    
    echo ""
    echo "========================================="
    echo -e "${GREEN}🎉 Setup Complete!${NC}"
    echo "========================================="
    echo ""
    echo -e "${YELLOW}Remaining steps:${NC}"
    echo "1. Setup Cloudflare Email Routing in dashboard"
    echo "2. Update config.js with your Worker URL"
    echo "3. Deploy frontend: cd frontend && npm install && vercel"
    echo ""
    echo "📖 See README.md for detailed instructions"
    echo ""
}

# Run main function
main
