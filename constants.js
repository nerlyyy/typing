// core/constants.js

export const Constants = {
    // Canvas Dimensions
    CANVAS_WIDTH_LANDSCAPE: 800,
    CANVAS_HEIGHT_LANDSCAPE: 600,
    CANVAS_WIDTH_PORTRAIT: 480,
    CANVAS_HEIGHT_PORTRAIT: 800,

    // Game Config
    DEFAULT_TIME_LIMIT: 30000, // 30 detik untuk mode Time
    SPAWN_INTERVAL_START: 1500,
    BULLET_SPEED: 50,
    MAX_BAR_COMBO: 4,

    // Visual Colors
    COLORS: {
        SHIP: '#38bdf8',
        BULLET: '#fcd34d',
        ENEMY: '#ef4444',
        BOSS: '#06b6d4',
        DISAMBIGUATION: '#10b981', // Warna garis hijau untk target ganda
        TARGET_GLOW: '#38bdf8',
        TEXT_ENEMY: '#ffffff'
    },

    // Word Dictionaries
    WORDS: {
        ID: ['serang', 'gerak', 'tembak', 'lindung', 'perintah', 'analisis', 'strategi', 'kendali', 'sistem', 'jaringan', 'komputer', 'program', 'internet', 'virtual', 'otomatis', 'teknologi', 'evolusi', 'inovasi', 'kecepatan', 'gravitasi', 'molekul', 'energi', 'radiasi', 'bintang', 'galaksi', 'planet', 'atmosfer', 'senjata', 'pertahanan', 'misil', 'penyergapan', 'konstelasi', 'antimateri', 'laser', 'akselerasi', 'degradasi', 'hipotesis', 'validasi', 'konfirmasi', 'eksplorasi', 'penelitian', 'observasi', 'telemetri', 'navigasi', 'sinkron', 'orbital', 'rotasi', 'revolusi', 'struktur', 'mekanik', 'komponen', 'algoritma', 'saya', 'kamu', 'anda', 'dia', 'kita', 'mereka', 'ini', 'itu', 'ada', 'tidak', 'bukan', 'mau', 'bisa', 'harus', 'berarti', 'sesuatu', 'semua', 'waktu', 'hari', 'dunia', 'cinta', 'rasa', 'hati', 'jiwa', 'pergi', 'datang', 'ambil', 'beri', 'ubah', 'kerja', 'main', 'tidur', 'makan', 'minum', 'cepat', 'lambat', 'tinggi', 'rendah', 'baru', 'lama', 'kecil', 'besar', 'hitam', 'putih', 'merah', 'biru', 'hijau', 'kuning', 'terang', 'gelap', 'sulit', 'mudah', 'benar', 'salah', 'berani', 'takut', 'sedih', 'senang', 'marah', 'tenang', 'bicara', 'diam', 'dengar', 'lihat', 'baca', 'tulis', 'hitung', 'cari', 'temu', 'lepas', 'ikat', 'bangun', 'jatuh'],
        EN: ['attack', 'move', 'shoot', 'shield', 'command', 'analyze', 'strategy', 'control', 'system', 'network', 'computer', 'program', 'internet', 'virtual', 'auto', 'technology', 'evolve', 'innovate', 'speed', 'gravity', 'molecule', 'energy', 'radiation', 'star', 'galaxy', 'planet', 'atmosphere', 'weapon', 'defense', 'missile', 'intercept', 'constellation', 'antimatter', 'laser', 'accelerate', 'degrade', 'hypothesis', 'validate', 'confirm', 'explore', 'research', 'observe', 'telemetry', 'navigate', 'synchronize', 'orbital', 'rotate', 'revolve', 'structure', 'mechanical', 'component', 'algorithm', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'there', 'is', 'not', 'do', 'can', 'must', 'mean', 'something', 'all', 'time', 'day', 'world', 'love', 'feel', 'heart', 'soul', 'go', 'come', 'take', 'give', 'change', 'work', 'play', 'sleep', 'eat', 'drink', 'fast', 'slow', 'high', 'low', 'new', 'old', 'small', 'big', 'black', 'white', 'red', 'blue', 'green', 'yellow', 'bright', 'dark', 'difficult', 'easy', 'true', 'false', 'brave', 'afraid', 'sad', 'happy', 'angry', 'calm', 'speak', 'quiet', 'listen', 'see', 'read', 'write', 'count', 'find', 'meet', 'release', 'tie', 'build', 'fall']
    },

    // UI Text (Localization)
    LANGUAGES: {
        id: {
            title: "Penembak Antariksa Kata KBBI",
            score: "Skor", duration: "Durasi", words: "Kata", wpm: "WPM", health: "Nyawa", time: "Waktu", target: "Target",
            inputPlaceholder: "Mulai Ketik...", yourInput: "Input",
            menuTitle: "TYPING SPACE WAR", menuSubtitle: "Pilih mode game Anda!",
            modeClassic: "MODE KLASIK", modeTime: "MODE WPM", 
            settingsBtn: "Pengaturan", timeModeTitle: "MODE WPM", timeModeSubtitle: "Pilih durasi:", backToMenu: "Kembali (Simpan)",
            sec: " Detik", min: " Menit",
            gameOverTitle: "GAME OVER", timeUpTitle: "WAKTU HABIS!",
            finalScore: "Skor Akhir", totalWords: "Kata Benar", finalWPM: "WPM", totalChars: "Total Karakter", finalDuration: "Durasi Bertahan",
            playAgain: "Main Lagi", backToMenuBtn: "Menu", typingError: "GAGAL!", ambiguous: "[AMBIGU:", empty: "] KOSONG",
            pauseBtn: "MENU / PAUSE", pauseTitle: "DIJEDA", resumeBtn: "LANJUT", endGameBtn: "AKHIRI",
            settingsTitle: "PENGATURAN", languageSetting: "Bahasa", deviceMode: "Input Mode", screenRatio: "Rasio Layar", hintMobile: "(Tap)",
            usernameLabel: "Username (Nama Pemain)"
        },
        en: {
            title: "KBBI Word Space Shooter",
            score: "Score", duration: "Duration", words: "Words", wpm: "WPM", health: "HP", time: "Time", target: "Target",
            inputPlaceholder: "Type here...", yourInput: "Input",
            menuTitle: "TYPING SPACE WAR", menuSubtitle: "Choose mode!",
            modeClassic: "CLASSIC MODE", modeTime: "WPM MODE", 
            settingsBtn: "Settings", timeModeTitle: "WPM MODE", timeModeSubtitle: "Select duration:", backToMenu: "Back (Save)",
            sec: " Seconds", min: " Minute",
            gameOverTitle: "GAME OVER", timeUpTitle: "TIME'S UP!",
            finalScore: "Final Score", totalWords: "Correct Words", finalWPM: "WPM", totalChars: "Total Chars", finalDuration: "Survival Time",
            playAgain: "Play Again", backToMenuBtn: "Menu", typingError: "MISS!", ambiguous: "[AMBIGUOUS:", empty: "] EMPTY",
            pauseBtn: "MENU / PAUSE", pauseTitle: "PAUSED", resumeBtn: "RESUME", endGameBtn: "END GAME",
            settingsTitle: "SETTINGS", languageSetting: "Language", deviceMode: "Input Mode", screenRatio: "Screen Ratio", hintMobile: "(Tap)",
            usernameLabel: "Username (Player Name)"
        }
    }
};