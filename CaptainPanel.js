import { gameService } from './gameService.js';

export default class CaptainPanel {
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
                    <h2><i class="fas fa-crown"></i> Капитанский мостик</h2>
                    <div class="status-indicator">
                        <span class="pulse" style="color: #10b981;">
                            <i class="fas fa-circle"></i> В эфире
                        </span>
                    </div>
                </div>
                
                <div class="controls-grid">
                    <button class="control-btn" id="speedUp">
                        <i class="fas fa-angle-double-up"></i>
                        <span>Увеличить скорость</span>
                    </button>
                    <button class="control-btn" id="speedDown">
                        <i class="fas fa-angle-double-down"></i>
                        <span>Уменьшить скорость</span>
                    </button>
                    <button class="control-btn" id="turnLeft">
                        <i class="fas fa-undo"></i>
                        <span>Повернуть налево</span>
                    </button>
                    <button class="control-btn" id="turnRight">
                        <i class="fas fa-redo"></i>
                        <span>Повернуть направо</span>
                    </button>
                </div>
                
                <div class="status-display glass">
                    <div class="status-item">
                        <span>Текущая скорость:</span>
                        <span id="currentSpeed">0 узлов</span>
                    </div>
                    <div class="status-item">
                        <span>Курс:</span>
                        <span id="currentHeading">0°</span>
                    </div>
                    <div class="status-item">
                        <span>Координаты:</span>
                        <span id="currentCoords">0,0</span>
                    </div>
                </div>
                
                <div class="emergency-controls">
                    <h3><i class="fas fa-exclamation-triangle"></i> Аварийные протоколы</h3>
                    <div class="emergency-buttons">
                        <button class="control-btn" id="emergencySurface">
                            <i class="fas fa-arrow-up"></i>
                            <span>Срочное всплытие</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('speedUp').addEventListener('click', () => this.adjustSpeed(5));
        document.getElementById('speedDown').addEventListener('click', () => this.adjustSpeed(-5));
        document.getElementById('turnLeft').addEventListener('click', () => this.adjustHeading(-15));
        document.getElementById('turnRight').addEventListener('click', () => this.adjustHeading(15));
        document.getElementById('emergencySurface').addEventListener('click', () => this.activateEmergency('emergency_surface'));
    }

    setupListeners() {
        gameService.onSubmarineUpdate((submarine) => this.updateDisplay(submarine));
    }

    updateDisplay(submarine) {
        document.getElementById('currentSpeed').textContent = `${submarine.speed} узлов`;
        document.getElementById('currentHeading').textContent = `${Math.round(submarine.heading)}°`;
        document.getElementById('currentCoords').textContent = `${Math.round(submarine.position.x)}, ${Math.round(submarine.position.y)}`;
    }

    adjustSpeed(delta) {
        gameService.getCurrentGameState().then(gameState => {
            const currentSpeed = gameState.submarine.speed;
            const newSpeed = Math.max(0, Math.min(50, currentSpeed + delta));
            gameService.setSpeed(newSpeed);
        });
    }

    adjustHeading(delta) {
        gameService.getCurrentGameState().then(gameState => {
            const currentHeading = gameState.submarine.heading;
            const newHeading = (currentHeading + delta + 360) % 360;
            gameService.changeHeading(newHeading);
        });
    }

    activateEmergency(protocol) {
        gameService.startEmergencyProtocol(protocol);
    }
}
