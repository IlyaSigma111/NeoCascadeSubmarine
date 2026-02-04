import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, push, onDisconnect, serverTimestamp } from 'firebase/database';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class GameService {
    constructor() {
        this.userId = null;
        this.userRole = null;
        this.gameRef = null;
        this.submarineRef = null;
    }

    connect(userId, role) {
        this.userId = userId;
        this.userRole = role;
        
        this.gameRef = ref(database, 'game');
        this.submarineRef = ref(database, 'game/submarine');
        
        this.initializeGameState();
        this.registerUser(role);
        this.setupDisconnectHandler();
    }

    initializeGameState() {
        const gameStateRef = ref(database, 'game');
        
        onValue(gameStateRef, (snapshot) => {
            if (!snapshot.exists()) {
                const initialGameState = {
                    submarine: {
                        depth: 0,
                        speed: 0,
                        heading: 0,
                        position: { x: 0, y: 0 },
                        systems: {
                            engine: { health: 100, power: 50 },
                            oxygen: { level: 100, consumption: 1 },
                            reactor: { power: 80, temperature: 40 },
                            hull: { integrity: 100, pressure: 1 },
                            communication: { status: 'online', signal: 100 }
                        },
                        threats: [],
                        score: 0,
                        mission: 'exploration',
                        lastUpdate: serverTimestamp()
                    },
                    players: {},
                    activeThreats: [],
                    missionObjectives: [
                        { id: 1, type: 'depth', target: 1000, completed: false },
                        { id: 2, type: 'scan', target: 5, completed: false },
                        { id: 3, type: 'discover', target: 3, completed: false }
                    ],
                    status: 'active'
                };
                
                set(gameStateRef, initialGameState);
            }
        }, { onlyOnce: true });
    }

    registerUser(role) {
        const userRef = ref(database, `game/players/${this.userId}`);
        
        set(userRef, {
            role: role,
            connected: true,
            lastActive: serverTimestamp(),
            actions: 0
        });

        onDisconnect(userRef).update({
            connected: false,
            disconnectedAt: serverTimestamp()
        });
    }

    setupDisconnectHandler() {
        const connectedRef = ref(database, '.info/connected');
        
        onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                const userRef = ref(database, `game/players/${this.userId}`);
                update(userRef, {
                    connected: true,
                    lastActive: serverTimestamp()
                });
            }
        });
    }

    setSpeed(speed) {
        const updates = {};
        updates['game/submarine/speed'] = Math.max(0, Math.min(50, speed));
        updates['game/submarine/lastUpdate'] = serverTimestamp();
        return update(ref(database), updates);
    }

    changeHeading(degrees) {
        const updates = {};
        updates['game/submarine/heading'] = degrees % 360;
        updates['game/submarine/lastUpdate'] = serverTimestamp();
        return update(ref(database), updates);
    }

    startEmergencyProtocol(protocol) {
        const emergencyRef = push(ref(database, 'game/emergencies'));
        return set(emergencyRef, {
            type: protocol,
            initiator: this.userId,
            timestamp: serverTimestamp(),
            status: 'active'
        });
    }

    adjustSystemPower(system, power) {
        const systemRef = ref(database, `game/submarine/systems/${system}/power`);
        return set(systemRef, Math.max(0, Math.min(100, power)));
    }

    repairSystem(system) {
        const systemRef = ref(database, `game/submarine/systems/${system}`);
        return update(systemRef, {
            health: 100,
            lastRepaired: serverTimestamp()
        });
    }

    setCourse(x, y) {
        const updates = {};
        updates['game/submarine/position'] = { x, y };
        updates['game/submarine/heading'] = this.calculateHeading(x, y);
        updates['game/submarine/lastUpdate'] = serverTimestamp();
        return update(ref(database), updates);
    }

    calculateHeading(targetX, targetY) {
        return Math.atan2(targetY, targetX) * (180 / Math.PI);
    }

    scanArea() {
        const scanRef = push(ref(database, 'game/scans'));
        return set(scanRef, {
            operator: this.userId,
            range: 1000,
            timestamp: serverTimestamp(),
            results: []
        });
    }

    reportThreat(threatType, position) {
        const threatRef = push(ref(database, 'game/activeThreats'));
        return set(threatRef, {
            type: threatType,
            position: position,
            reportedBy: this.userId,
            timestamp: serverTimestamp(),
            active: true
        });
    }

    onSubmarineUpdate(callback) {
        return onValue(this.submarineRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            }
        });
    }

    onPlayersUpdate(callback) {
        const playersRef = ref(database, 'game/players');
        return onValue(playersRef, (snapshot) => {
            const players = snapshot.val() || {};
            callback(players);
        });
    }

    onThreatsUpdate(callback) {
        const threatsRef = ref(database, 'game/activeThreats');
        return onValue(threatsRef, (snapshot) => {
            const threats = snapshot.val() || {};
            callback(Object.values(threats));
        });
    }

    onMissionUpdate(callback) {
        const missionRef = ref(database, 'game/missionObjectives');
        return onValue(missionRef, (snapshot) => {
            const objectives = snapshot.val() || [];
            callback(Array.isArray(objectives) ? objectives : Object.values(objectives));
        });
    }

    getCurrentGameState() {
        return new Promise((resolve) => {
            onValue(this.gameRef, (snapshot) => {
                resolve(snapshot.val());
            }, { onlyOnce: true });
        });
    }

    updateScore(points) {
        const scoreRef = ref(database, 'game/submarine/score');
        return set(scoreRef, serverTimestamp());
    }

    addLogEntry(message, type = 'info') {
        const logRef = push(ref(database, 'game/logs'));
        return set(logRef, {
            message,
            type,
            userId: this.userId,
            role: this.userRole,
            timestamp: serverTimestamp()
        });
    }
}

export const gameService = new GameService();
