import { gameService } from './gameService.js';

export default class Dashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        this.setupListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card glass">
                    <h3><i class="fas fa-heartbeat"></i> Статус подлодки</h3>
                    <div class="status-overview">
                        <div class="status-metric">
                            <div class="metric-label">Глубина</div>
                            <div class="metric-value" id="dashboardDepth">0 м</div>
                        </div>
                        <div class="status-metric">
                            <div class="metric-label">Скорость</div>
                            <div class="metric-value" id="dashboardSpeed">0 узл</div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card glass">
                    <h3><i class="fas fa-users"></i> Активность экипажа</h3>
                    <div class="crew-grid" id="crewGrid"></div>
                </div>
            </div>
        `;
    }

    setupListeners() {
        gameService.onSubmarineUpdate((submarine) => this.updateSubmarineStatus(submarine));
        gameService.onPlayersUpdate((players) => this.updateCrewActivity(players));
    }

    updateSubmarineStatus(submarine) {
        document.getElementById('dashboardDepth').textContent = `${submarine.depth} м`;
        document.getElementById('dashboardSpeed').textContent = `${submarine.speed} узл`;
    }

    updateCrewActivity(players) {
        const crewGrid = document.getElementById('crewGrid');
        crewGrid.innerHTML = '';
        
        Object.entries(players).forEach(([userId, player]) => {
            const crewElement = document.createElement('div');
            crewElement.className = `crew-member ${player.connected ? 'connected' : 'disconnected'}`;
            crewElement.innerHTML = `
                <div class="crew-avatar"><i class="fas fa-user"></i></div>
                <div class="crew-info">
                    <div class="crew-role">${this.getRoleName(player.role)}</div>
                    <div class="crew-status">${player.connected ? 'Онлайн' : 'Оффлайн'}</div>
                </div>
            `;
            crewGrid.appendChild(crewElement);
        });
    }

    getRoleName(role) {
        const names = { captain: 'Капитан', engineer: 'Инженер', navigator: 'Штурман', sonar: 'Сонар' };
        return names[role] || role;
    }
}
