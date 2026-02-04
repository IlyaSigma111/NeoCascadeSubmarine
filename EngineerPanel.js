import { gameService } from './gameService.js';

export default class EngineerPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        this.bindEvents();
        this.setupListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="panel glass">
                <div class="panel-header">
                    <h2><i class="fas fa-cogs"></i> Инженерный отсек</h2>
                    <div class="status-indicator">
                        <span class="pulse" style="color: #f59e0b;">
                            <i class="fas fa-circle"></i> Системы онлайн
                        </span>
                    </div>
                </div>
                
                <div class="systems-control">
                    <h3><i class="fas fa-sliders-h"></i> Управление системами</h3>
                    <div class="systems-grid" id="systemsGrid"></div>
                </div>
            </div>
        `;
        
        this.renderSystems();
    }

    renderSystems() {
        const systemsGrid = document.getElementById('systemsGrid');
        systemsGrid.innerHTML = '';
        
        const systems = [
            { id: 'engine', name: 'Двигатель', icon: 'fas fa-engine', color: '#f59e0b' },
            { id: 'reactor', name: 'Реактор', icon: 'fas fa-radiation', color: '#10b981' },
            { id: 'oxygen', name: 'Кислород', icon: 'fas fa-lungs', color: '#3b82f6' },
            { id: 'hull', name: 'Корпус', icon: 'fas fa-shield-alt', color: '#8b5cf6' }
        ];
        
        systems.forEach(system => {
            const systemElement = document.createElement('div');
            systemElement.className = 'system-control glass';
            systemElement.innerHTML = `
                <div class="system-header">
                    <i class="${system.icon}" style="color: ${system.color};"></i>
                    <h4>${system.name}</h4>
                </div>
                <div class="system-controls">
                    <button class="control-btn" data-system="${system.id}" data-action="power-up"><i class="fas fa-plus"></i> +</button>
                    <span class="power-level" id="power-${system.id}">50%</span>
                    <button class="control-btn" data-system="${system.id}" data-action="power-down"><i class="fas fa-minus"></i> -</button>
                </div>
                <div class="system-health">
                    <div class="health-bar">
                        <div class="health-fill" id="health-${system.id}" style="width: 100%; background: ${system.color};"></div>
                    </div>
                </div>
            `;
            systemsGrid.appendChild(systemElement);
        });
    }

    bindEvents() {
        document.querySelectorAll('[data-action="power-up"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const system = e.target.closest('[data-system]').dataset.system;
                this.adjustPower(system, 10);
            });
        });
        
        document.querySelectorAll('[data-action="power-down"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const system = e.target.closest('[data-system]').dataset.system;
                this.adjustPower(system, -10);
            });
        });
    }

    setupListeners() {
        gameService.onSubmarineUpdate((submarine) => this.updateSystemStatus(submarine.systems));
    }

    updateSystemStatus(systems) {
        Object.entries(systems).forEach(([systemId, systemData]) => {
            const powerElement = document.getElementById(`power-${systemId}`);
            const healthElement = document.getElementById(`health-${systemId}`);
            
            if (powerElement) powerElement.textContent = `${systemData.power || 50}%`;
            
            if (healthElement) {
                const health = systemData.health || 100;
                healthElement.style.width = `${health}%`;
            }
        });
    }

    adjustPower(system, delta) {
        gameService.getCurrentGameState().then(gameState => {
            const currentPower = gameState.submarine.systems[system]?.power || 50;
            const newPower = Math.max(0, Math.min(100, currentPower + delta));
            gameService.adjustSystemPower(system, newPower);
        });
    }
}
