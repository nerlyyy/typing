// ==========================================
// SKIN REGISTRY (VISUALS & AUDIO MAPPING)
// ==========================================
import { Constants } from '../core/constants.js';

// Fungsi Helper Konversi Koordinat (akan di-inject dari RenderSys nanti)
// Untuk sementara kita pakai logika kasar atau pass ctx transform
const toCanvasX = (val, ctx) => val; // Placeholder jika perlu scaling manual
const toCanvasY = (val, ctx) => val; 

export const PlayerSkinRegistry = {
    'TRIANGLE_SHIP': {
        // Logika Gambar (Canvas API)
        draw: (ctx, x, y, rotation, isDamaged) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            ctx.shadowBlur = 20;
            ctx.shadowColor = isDamaged ? '#ef4444' : Constants.COLORS.SHIP;
            ctx.fillStyle = isDamaged ? '#ef4444' : Constants.COLORS.SHIP;
            ctx.strokeStyle = '#a5f3fc';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(-20, 20);
            ctx.lineTo(20, 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit
            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },
        // Audio Mapping (Menggunakan preset synthesizer di AudioSys)
        sfx: {
            shoot: 'synthShoot', // Kunci string ini akan dibaca AudioSys
            impact: 'synthImpact'
        }
    },

    'CURSOR_DEFAULT': {
        draw: (ctx, x, y, rotation, isDamaged, extraState) => {
            ctx.save();
            ctx.translate(x, y);
            // Kursor mouse biasanya tidak berputar mengikuti target
            // Tapi kita bisa kasih efek scale saat klik
            const scale = extraState?.clickPulse || 1.0;
            ctx.scale(scale * 1.5, scale * 1.5);

            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 17);
            ctx.lineTo(4, 14);
            ctx.lineTo(7, 20);
            ctx.lineTo(9, 19);
            ctx.lineTo(6, 13);
            ctx.lineTo(12, 13);
            ctx.closePath();

            ctx.fillStyle = '#FFFFFF'; ctx.fill();
            ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
        },
        sfx: {
            shoot: 'clickyType', // Suara klik mouse
            impact: 'synthImpact'
        }
    },
    
    // --- CONTOH CARA NAMBAH SKIN DENGAN AUDIO SENDIRI ---
    /*
    'CUSTOM_GUNDAM': {
        draw: (ctx, x, y) => { ... gambar robot ... },
        sfx: {
            // Cukup taruh path file audio kamu di sini!
            // Sistem Audio saya nanti akan otomatis mendeteksi kalau ini path file.
            shoot: './audio/sfx/gundam_laser.mp3', 
            damage: './audio/sfx/gundam_hit.mp3'
        }
    }
    */
};

export const EnemySkinRegistry = {
    'TRIANGLE_ENEMY': {
        draw: (ctx, x, y, word, isBoss, isDamaged, colorOverride) => {
            ctx.save();
            ctx.translate(x, y);
            
            let baseColor = isBoss ? Constants.COLORS.BOSS : Constants.COLORS.ENEMY;
            if (colorOverride) baseColor = colorOverride;

            ctx.fillStyle = baseColor;
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 10;

            // Gambar Hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const radius = 30;
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.8);
            }
            ctx.closePath();
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = '#ffffff'; 
            ctx.globalAlpha = 0.2; 
            ctx.fill(); 
            
            ctx.restore();
        },
        sfx: {
            explode: 'synthExplode'
        }
    },

    'FOLDER_DEFAULT': {
        draw: (ctx, x, y, word, isBoss, isDamaged) => {
            ctx.save();
            ctx.translate(x, y);
            
            // Visual Folder Windows
            ctx.fillStyle = '#FFE6B3'; 
            ctx.strokeStyle = '#E6C080'; 
            ctx.lineWidth = 1;

            // Tab Folder
            ctx.fillRect(-18, -18, 12, 6);
            ctx.strokeRect(-18, -18, 12, 6);
            // Body Folder
            ctx.fillRect(-18, -12, 36, 24);
            ctx.strokeRect(-18, -12, 36, 24);
            // Garis Lipatan
            ctx.beginPath(); 
            ctx.moveTo(-18, -8); 
            ctx.lineTo(18, -8); 
            ctx.stroke();

            ctx.restore();
        },
        sfx: {
            explode: 'trashDelete' // Suara sampah windows
        }
    }
};