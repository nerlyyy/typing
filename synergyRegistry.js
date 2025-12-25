// ==========================================
// SYNERGY REGISTRY (BUNDLE EFFECTS)
// ==========================================
import { GameState } from '../core/state.js';

export const SynergyRegistry = {
    // Cek apakah sinergi aktif
    checkSynergy: function() {
        const player = GameState.equippedSkins.player;
        const enemy = GameState.equippedSkins.enemy;

        if (player === 'CURSOR_DEFAULT' && enemy === 'FOLDER_DEFAULT') {
            return 'OFFICE_ENV';
        }
        return null;
    },

    // Efek Visual Khusus per Synergy
    getBackgroundEffect: function(synergyId) {
        if (synergyId === 'OFFICE_ENV') {
            return 'windows_xp_style'; // Placeholder flag
        }
        return 'space_style';
    }
};