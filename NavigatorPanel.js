import { gameService } from './gameService.js';

export default class NavigatorPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="panel glass">
                <div class="panel-header">
                    <h2><i class="fas fa-compass"></i> Штурманский пост</h2>
                    <div class="status-indicator">
                        <span class="pulse" style="color: #3b82f6;">
                            <i class="fas fa-circle"></i> Навигация активна
                        </span>
                    </div>
                </div>
                
                <div class="course-control">
                    <h3><i class="fas fa-route"></i> Управление курсом</h3>
                    <div class="course-inputs">
                        <input type="number" id="targetX" value="0" placeholder="X">
                        <input type="number" id="targetY" value="0" placeholder="Y">
                        <button class="control-btn" id="setCourse"><i class="fas fa-check-circle"></i><span>Установить курс</span></button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('setCourse').addEventListener('click', () => {
            const x = parseInt(document.getElementById('targetX').value) || 0;
            const y = parseInt(document.getElementById('targetY').value) || 0;
            gameService.setCourse(x, y);
        });
    }
}
