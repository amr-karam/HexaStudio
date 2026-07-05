#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/opt"
LOG_FILE="/opt/deploy.log"

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

cmd_deploy() {
    log "Deploying HexaStudio with Zero-Downtime strategy..."
    cd "$PROJECT_DIR"
    
    # 1. Pull latest images from registry (GHCR)
    log "Pulling latest images..."
    docker compose pull

    # 2. Rolling update services
    local services=("backend" "frontend" "cms")
    for service in "${services[@]}"; do
        log "Updating $service..."
        docker compose up -d --no-deps "$service"
        
        # 3. Health check loop
        log "Verifying health for $service..."
        local attempts=0
        local max_attempts=12
        local healthy=false
        
        while [ $attempts -lt $max_attempts ]; do
            if cmd_check_service "$service"; then
                healthy=true
                break
            fi
            log "Attempt $((attempts+1))/$max_attempts: $service is not healthy yet. Waiting 5s..."
            sleep 5
            attempts=$((attempts+1))
        done
        
        if [ "$healthy" = false ]; then
            error "Service $service failed health checks. Initiating rollback!"
            cmd_rollback "$service"
        fi
        log "$service is healthy!"
    done
    
    log "Deployment complete!"
    cmd_status
}

cmd_rollback() {
    local service="${1:-}"
    log "Rolling back $service to previous version..."
    cd "$PROJECT_DIR"
    # In a real GHCR setup, we would use a specific tagged version. 
    # For now, we restart from the existing image if the new one is bad.
    docker compose restart "$service"
    log "Rollback attempt complete. Please check logs."
}

cmd_check_service() {
    local service="$1"
    case "$service" in
        backend)
            docker compose exec -T backend node -e "fetch('http://localhost:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1 && return 0 || return 1
            ;;
        frontend)
            docker compose exec -T frontend node -e "fetch('http://localhost:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1 && return 0 || return 1
            ;;
        cms)
            docker compose exec -T cms node -e "fetch('http://localhost:1337').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1 && return 0 || return 1
            ;;
        *)
            return 1
            ;;
    esac
}

cmd_update() {
    log "Updating HexaStudio with Zero-Downtime strategy..."
    cd "$PROJECT_DIR"
    log "Pulling latest code..."
    git pull origin main
    cmd_deploy
}

cmd_shell() {
    local service="${1:-backend}"
    log "Opening shell in $service..."
    cd "$PROJECT_DIR"
    docker compose exec "$service" sh
}

cmd_db_migrate() {
    log "Running database migrations..."
    cd "$PROJECT_DIR"
    docker compose exec backend npm run migration:run
    log "Migrations complete!"
}

cmd_db_seed() {
    log "Seeding database..."
    cd "$PROJECT_DIR"
    docker compose exec backend npm run seed
    log "Database seeded!"
}

cmd_clean() {
    log "Cleaning up Docker resources..."
    cd "$PROJECT_DIR"
    docker compose down -v --remove-orphans
    docker system prune -f
    log "Cleanup complete!"
}

cmd_help() {
    echo -e "${BLUE}HexaStudio Deployment Script${NC}"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  deploy              Full deployment (build + start)"
    echo "  start               Start all services"
    echo "  stop                Stop all services"
    echo "  restart             Restart all services"
    echo "  restart-service     Restart a specific service (e.g., backend)"
    echo "  status              Show service status and health checks"
    echo "  logs [service]      Show logs (all or specific service)"
    echo "  backup              Create database and config backup"
    echo "  update              Pull latest code and redeploy"
    echo "  shell [service]     Open shell in service (default: backend)"
    echo "  db-migrate          Run database migrations"
    echo "  db-seed             Seed database with initial data"
    echo "  clean               Remove all containers, volumes, and images"
    echo "  help                Show this help message"
}

COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
    deploy)          cmd_deploy ;;
    start)           cmd_start ;;
    stop)            cmd_stop ;;
    restart)         cmd_restart ;;
    restart-service) cmd_restart_service "$@" ;;
    status)          cmd_status ;;
    logs)            cmd_logs "$@" ;;
    backup)          cmd_backup ;;
    update)          cmd_update ;;
    shell)           cmd_shell "$@" ;;
    db-migrate)      cmd_db_migrate ;;
    db-seed)         cmd_db_seed ;;
    clean)           cmd_clean ;;
    help|*)          cmd_help ;;
esac
