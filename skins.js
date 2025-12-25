// ==========================================
// SKIN METADATA (SHOP DATA)
// ==========================================

export const SKINS_DATA = {
    // --- PLAYER SKINS ---
    PLAYER: {
        'TRIANGLE_SHIP': {
            id: 'TRIANGLE_SHIP',
            name: 'Triangle Ship',
            type: 'COMMON',
            price: 0,
            desc: 'Standard Space Fighter'
        },
        'CURSOR_DEFAULT': {
            id: 'CURSOR_DEFAULT',
            name: 'Real Mouse Cursor',
            type: 'RARE',
            price: 10000, // Biasanya dibeli via Bundle
            desc: 'Kursor Realistis + Efek Klik'
        }
    },

    // --- ENEMY SKINS ---
    ENEMY: {
        'TRIANGLE_ENEMY': {
            id: 'TRIANGLE_ENEMY',
            name: 'Hexagon Enemy',
            type: 'COMMON',
            price: 0,
            desc: 'Target Geometris Standar'
        },
        'FOLDER_DEFAULT': {
            id: 'FOLDER_DEFAULT',
            name: 'Cream Folder',
            type: 'RARE',
            price: 10000,
            desc: 'Folder + Menu Popup'
        }
    }
};

export const BUNDLES_DATA = {
    'OFFICE_BUNDLE': {
        id: 'OFFICE_BUNDLE',
        name: 'Office Admin Bundle',
        price: 10000,
        contents: ['CURSOR_DEFAULT', 'FOLDER_DEFAULT'],
        desc: 'Ubah game jadi OS Desktop!'
    }
};