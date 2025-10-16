#!/bin/bash

# SSL certificate setup script

echo "🔒 Setting up SSL certificates..."

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Check if certificates already exist
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo "✅ SSL certificates already exist"
    exit 0
fi

echo "Choose SSL certificate option:"
echo "1) Generate self-signed certificate (for development/testing)"
echo "2) Use Let's Encrypt (for production)"
echo "3) Use existing certificates"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "📝 Generating self-signed certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        echo "✅ Self-signed certificate generated"
        ;;
    2)
        echo "🌐 Setting up Let's Encrypt..."
        read -p "Enter your domain name: " domain
        
        if [ -z "$domain" ]; then
            echo "❌ Domain name is required"
            exit 1
        fi
        
        # Install certbot if not available
        if ! command -v certbot &> /dev/null; then
            echo "Installing certbot..."
            sudo apt-get update
            sudo apt-get install -y certbot
        fi
        
        # Generate certificate
        sudo certbot certonly --standalone -d $domain
        
        # Copy certificates
        sudo cp /etc/letsencrypt/live/$domain/fullchain.pem ssl/cert.pem
        sudo cp /etc/letsencrypt/live/$domain/privkey.pem ssl/key.pem
        sudo chown $USER:$USER ssl/*.pem
        
        echo "✅ Let's Encrypt certificate installed"
        ;;
    3)
        echo "📁 Place your certificate files in the ssl/ directory:"
        echo "  - ssl/cert.pem (certificate file)"
        echo "  - ssl/key.pem (private key file)"
        echo ""
        echo "Press Enter when files are ready..."
        read
        
        if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
            echo "❌ Certificate files not found"
            exit 1
        fi
        
        echo "✅ Certificate files found"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "🔒 SSL setup completed!"
echo "Certificates are ready for production deployment."