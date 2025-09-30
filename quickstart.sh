#!/bin/bash

# Self-Service Portal - Quick Start Script
# This script helps you set up the project quickly

set -e

echo "🚀 Self-Service Portal - Quick Start"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    
    # Generate a random secret
    SECRET=$(openssl rand -base64 32)
    
    cat > .env.local << EOF
# Database - Update with your actual database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/service_portal?schema=public"

# NextAuth
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_URL="http://localhost:3000"
EOF
    
    echo "✅ Created .env.local with generated secret"
    echo ""
    echo "⚠️  IMPORTANT: Update DATABASE_URL in .env.local with your actual database connection string"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Check if Prisma Client is generated
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Ask user if they want to set up the database
echo "📊 Database Setup"
echo "-----------------"
read -p "Do you want to push the schema to your database now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Pushing schema to database..."
    npx prisma db push
    echo "✅ Database schema created"
    echo ""
    
    read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        npm run prisma:seed
        echo "✅ Database seeded with test users and products"
        echo ""
    fi
else
    echo "⚠️  Skipping database setup. Run these commands manually:"
    echo "   npx prisma db push"
    echo "   npm run prisma:seed"
    echo ""
fi

echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Make sure your PostgreSQL database is running"
echo "2. Update DATABASE_URL in .env.local if needed"
echo "3. Start the development server:"
echo ""
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Test accounts:"
echo "  • user@bund.de - Regular user (Requester)"
echo "  • it@bund.de - IT Agent"
echo "  • manager@bund.de - Approver"
echo "  • admin@bund.de - Admin"
echo ""
echo "📚 For more information, see:"
echo "   • README.md - Full documentation"
echo "   • SETUP.md - Detailed setup guide"
echo "   • PROJECT_SUMMARY.md - Feature overview"
echo ""
echo "Happy coding! 🚀"

