import { gameService } from './gameService.js';

class NeoCascadeSubmarine {
    constructor() {
        this.currentRole = null;
        this.userId = this.generateUserId();
        this.init();
    }

    init() {
        this.userId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.setupRoleSelection();
        this.setupModeToggle();
        this.setupPanels();
        
        this.showRoleSelection();
        this.startPlayerCountUpdates();
    }

    setupRoleSelection() {
        const roleButtons = document.querySelectorAll('.role-btn');
        
        roleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const role = e.currentTarget.dataset.role;
                this.selectRole(role);
            });
        });
    }

    setupModeToggle() {
        document.getElementById('modeToggle').addEventListener('click', () => this.showDashboard());
        document.getElementById('backToGame').addEventListener('click', () => this.showGame());
    }

    setupPanels() {
        this.loadPanel('captainPanel', './CaptainPanel.js');
        this.loadPanel('engineerPanel', './EngineerPanel.js');
        this.loadPanel('navigatorPanel', './NavigatorPanel.js');
        this.loadPanel('sonarPanel', './SonarPanel.js');
        this.loadPanel('dashboardContent', './Dashboard.js');
    }

    async loadPanel(containerId, modulePath) {
        try {
            const module = await import(modulePath);
            const container = document.getElementById(containerId);
            if (container && module.default) {
                new module.default(containerId);
            }
        } catch (error) {
            console.error(`Ошибка загрузки панели ${containerId}:`, error);
        }
    }

    selectRole(role) {
        this.currentRole = role;
        
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-role="${role}"]`).classList.add('active');
        
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById(`${role}Panel`).classList.remove('hidden');
        
        gameService.connect(this.userId, role);
        this.updateConnectionStatus(true);
        
        console.log(`Выбрана роль: ${this.getRoleName(role)}`);
    }

    showDashboard() {
        document.getElementById('mobileView').classList.add('hidden');
        document.getElementById('dashboardView').classList.remove('hidden');
    }

    showGame() {
        document.getElementById('mobileView').classList.remove('hidden');
        document.getElementById('dashboardView').classList.add('hidden');
    }

    showRoleSelection() {
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (connected) {
            statusElement.innerHTML = '<i class="fas fa-wifi"></i> Подключено';
            statusElement.className = 'connected';
        } else {
            statusElement.innerHTML = '<i class="fas fa-wifi-slash"></i> Отключено';
            statusElement.className = 'disconnected';
        }
    }

    startPlayerCountUpdates() {
        gameService.onPlayersUpdate((players) => {
            const activePlayers = Object.values(players).filter(p => p.connected).length;
            document.getElementById('playersCount').textContent = activePlayers;
        });
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    getRoleName(role) {
        const names = { captain: 'Капитан', engineer: 'Инженер', navigator: 'Штурман', sonar: 'Сонар' };
        return names[role] || role;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new NeoCascadeSubmarine();
    console.log('NeoCascade Submarine запущен!');
});
