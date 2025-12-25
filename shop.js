import { GameState } from '../core/state.js';
import { SKINS_DATA, BUNDLES_DATA } from '../visual/skins.js';
import { HUD } from './hud.js';

export const ShopSys = {
    // Fungsi dipanggil saat tombol beli diklik
    buyBundle(bundleId) {
        const bundle = BUNDLES_DATA[bundleId];
        if (!bundle) return;

        if (GameState.ownedItems.includes(bundleId)) {
            alert("Bundle sudah dimiliki!");
            return;
        }

        if (GameState.playerCoins >= bundle.price) {
            GameState.playerCoins -= bundle.price;
            GameState.ownedItems.push(bundleId);
            
            // Tambahkan isi bundle ke inventory
            bundle.contents.forEach(itemId => {
                if (!GameState.ownedItems.includes(itemId)) {
                    GameState.ownedItems.push(itemId);
                }
            });
            
            GameState.saveUserData();
            HUD.updateDisplays();
            
            // Update UI Button
            const btn = document.getElementById('buyOfficeBundleBtn'); // Hardcoded ID sementara
            if (btn) {
                btn.textContent = "OWNED";
                btn.classList.replace('bg-blue-600', 'bg-green-600');
            }
            
            alert(`Berhasil membeli ${bundle.name}!`);
            this.updateLoadoutUI(); // Refresh jika loadout sedang terbuka
        } else {
            alert("Koin tidak cukup!");
        }
    },

    redeemCode(code) {
        const normalizedCode = code.trim().toUpperCase();
        const msgEl = document.getElementById('redeemMessage');
        const container = document.getElementById('inputContainer'); // Efek getar di input utama (opsional)

        if (normalizedCode === "KOINS") {
            if (localStorage.getItem('redeemed_koins') === 'true') {
                msgEl.textContent = "KODE SUDAH DIPAKAI!";
                msgEl.className = "text-[10px] mt-1 h-3 text-red-400 font-bold";
            } else {
                GameState.playerCoins += 10000;
                GameState.saveUserData();
                HUD.updateDisplays();
                localStorage.setItem('redeemed_koins', 'true');
                msgEl.textContent = "BERHASIL! +10.000 KOIN";
                msgEl.className = "text-[10px] mt-1 h-3 text-green-400 font-bold";
            }
        } else {
            msgEl.textContent = "KODE TIDAK VALID!";
            msgEl.className = "text-[10px] mt-1 h-3 text-red-400 font-bold";
        }
    },

    equipItem(type, id) {
        if (!GameState.ownedItems.includes(id) && SKINS_DATA[type.toUpperCase()][id].price > 0) {
            console.log("Item belum dimiliki.");
            return;
        }
        
        GameState.equippedSkins[type] = id;
        this.updateLoadoutUI();
    },

    updateLoadoutUI() {
        // Tampilkan item yang tersembunyi jika sudah dibeli
        GameState.ownedItems.forEach(itemId => {
            const el = document.getElementById(`item_player_${itemId}`) || document.getElementById(`item_enemy_${itemId}`);
            if (el) el.classList.remove('hidden');
        });

        // Update badge "EQUIPPED"
        document.querySelectorAll('.equipped-badge[id^="badge_"]').forEach(el => el.classList.add('hidden'));
        
        const playerBadge = document.getElementById(`badge_player_${GameState.equippedSkins.player}`);
        if(playerBadge) playerBadge.classList.remove('hidden');
        
        const enemyBadge = document.getElementById(`badge_enemy_${GameState.equippedSkins.enemy}`);
        if(enemyBadge) enemyBadge.classList.remove('hidden');
    }
};