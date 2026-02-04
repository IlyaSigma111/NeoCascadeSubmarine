import { gameService } from './gameService.js';

export default class SonarPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="panel glass">
                <div class="panel-header">
                    <h2><i class="fas fa-satellite-dish"></i> Гидролокационный пост</h2>
                    <div class="status-indicator">
                        <span class="pulse" style="color: #06b6d4;">
                            <i class="fas fa-circle"></i> Сонар активен
                        </span>
                    </div>
                </div>
                
                <div class="sonar-controls">
                    <h3><i class="fas fa-wave-square"></i> Управление сонаром</h3>
                    <div class="controls-grid">
                        <button class="control-btn" id="startScan">
                            <i class="fas fa-play"></i>
                            <span>Запустить сканирование</span>
                        </button>
                        <button class="control-btn" id="pulseSonar">
                            <i class="fas fa-bolt"></i>
                            <span>Импульсный сонар</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('startScan').addEventListener('click', () => {
            gameService.scanArea();
        });
        
        document.getElementById('pulseSonar').addEventListener('click', () => {
            gameService.reportThreat('unknown', { x: 100, y: 100 });
        });
    }
}
