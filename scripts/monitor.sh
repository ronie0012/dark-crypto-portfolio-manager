#!/bin/bash

# Docker monitoring and management script

show_help() {
    echo "Docker Crypto App Monitor"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status      Show service status"
    echo "  logs        Show application logs"
    echo "  scale       Scale services"
    echo "  update      Update services"
    echo "  backup      Backup database"
    echo "  restore     Restore database"
    echo "  cleanup     Clean up unused resources"
    echo "  health      Check service health"
    echo "  help        Show this help message"
}

show_status() {
    echo "📊 Service Status:"
    if docker stack ls | grep -q crypto-stack; then
        docker stack services crypto-stack
    else
        docker-compose ps
    fi
}

show_logs() {
    echo "📋 Application Logs:"
    if docker stack ls | grep -q crypto-stack; then
        docker service logs -f --tail=50 crypto-stack_app
    else
        docker-compose logs -f --tail=50 app
    fi
}

scale_services() {
    read -p "Enter number of app replicas: " replicas
    if [[ $replicas =~ ^[0-9]+$ ]]; then
        if docker stack ls | grep -q crypto-stack; then
            docker service scale crypto-stack_app=$replicas
        else
            docker-compose up -d --scale app=$replicas
        fi
        echo "✅ Scaled app service to $replicas replicas"
    else
        echo "❌ Invalid number"
    fi
}

update_services() {
    echo "🔄 Updating services..."
    if docker stack ls | grep -q crypto-stack; then
        docker service update --image crypto-app:latest crypto-stack_app
    else
        docker-compose pull
        docker-compose up -d
    fi
    echo "✅ Services updated"
}

backup_database() {
    echo "💾 Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    
    if docker stack ls | grep -q crypto-stack; then
        container_name="crypto-stack_mongodb"
    else
        container_name="crypto-mongodb"
    fi
    
    # Create backup directory
    mkdir -p backups
    
    # Backup MongoDB
    docker exec $container_name mongodump --authenticationDatabase admin -u admin -p password123 --out /tmp/backup
    docker cp $container_name:/tmp/backup ./backups/mongodb_backup_$timestamp
    
    echo "✅ Database backup created: backups/mongodb_backup_$timestamp"
}

restore_database() {
    echo "📁 Available backups:"
    ls -la backups/ | grep mongodb_backup
    
    read -p "Enter backup directory name: " backup_dir
    
    if [ ! -d "backups/$backup_dir" ]; then
        echo "❌ Backup directory not found"
        return 1
    fi
    
    if docker stack ls | grep -q crypto-stack; then
        container_name="crypto-stack_mongodb"
    else
        container_name="crypto-mongodb"
    fi
    
    echo "⚠️ This will overwrite the current database. Continue? (y/N)"
    read -p "" confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        docker cp ./backups/$backup_dir $container_name:/tmp/restore
        docker exec $container_name mongorestore --authenticationDatabase admin -u admin -p password123 --drop /tmp/restore
        echo "✅ Database restored from $backup_dir"
    else
        echo "❌ Restore cancelled"
    fi
}

cleanup_resources() {
    echo "🧹 Cleaning up unused resources..."
    
    echo "Removing unused containers..."
    docker container prune -f
    
    echo "Removing unused images..."
    docker image prune -f
    
    echo "Removing unused volumes..."
    docker volume prune -f
    
    echo "Removing unused networks..."
    docker network prune -f
    
    echo "✅ Cleanup completed"
}

check_health() {
    echo "🏥 Health Check:"
    
    # Check if services are running
    if docker stack ls | grep -q crypto-stack; then
        echo "Stack services:"
        docker stack services crypto-stack --format "table {{.Name}}\t{{.Replicas}}\t{{.Image}}"
    else
        echo "Compose services:"
        docker-compose ps
    fi
    
    echo ""
    echo "Testing application endpoints..."
    
    # Test health endpoint
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Health endpoint: OK"
    else
        echo "❌ Health endpoint: FAILED"
    fi
    
    # Test main page
    if curl -f -s http://localhost:3000 > /dev/null; then
        echo "✅ Main page: OK"
    else
        echo "❌ Main page: FAILED"
    fi
    
    # Check MongoDB connection
    if docker exec crypto-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB: OK"
    else
        echo "❌ MongoDB: FAILED"
    fi
}

# Main script logic
case "${1:-help}" in
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    scale)
        scale_services
        ;;
    update)
        update_services
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    cleanup)
        cleanup_resources
        ;;
    health)
        check_health
        ;;
    help|*)
        show_help
        ;;
esac