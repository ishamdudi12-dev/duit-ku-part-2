// Saldo Awal Simulasi
let totalSaldo = 999999999999;
let isSaldoVisible = true;

const saldoElement = document.getElementById('saldo');
const modal = document.getElementById('transferModal');
const btnKlaim = document.getElementById('btnKlaim');
const btnProses = document.getElementById('btnProsesTransfer');
const btnBatal = document.getElementById('btnBatalTransfer');
const toggleSaldoBtn = document.getElementById('toggleSaldo');
const triggers = document.querySelectorAll('.btn-transfer-trigger');

// Elemen Toast Notifikasi
const toast = document.getElementById('toastNotification');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');

function formatRupiah(angka) {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ==========================================
// FUNGSI SUARA NOTIFIKASI (Web Audio API)
// ==========================================
function playNotificationSound(isError = false) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();

        if (isError) {
            // Suara Gagal (Nada Rendah / Buzz)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else {
            // Suara Sukses (Nada Ting-Ting Halus)
            const now = audioCtx.currentTime;

            // Nada Pertama
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now); // Nada D5
            gain1.gain.setValueAtTime(0.2, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(now);
            osc1.stop(now + 0.2);

            // Nada Kedua (Lebih Tinggi)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, now + 0.1); // Nada A5
            gain2.gain.setValueAtTime(0.3, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.4);
        }
    } catch (e) {
        console.log("AudioContext tidak didukung atau diblokir browser:", e);
    }
}

// ==========================================
// FUNGSI MENAMPILKAN NOTIFIKASI & BUNYI
// ==========================================
function showNotification(title, message, isError = false) {
    toastTitle.innerText = title;
    toastMessage.innerText = message;

    if (isError) {
        toast.style.borderLeftColor = '#ff4d4f';
        toast.querySelector('.toast-icon').style.color = '#ff4d4f';
        toast.querySelector('.toast-icon i').className = 'fa-solid fa-circle-xmark';
    } else {
        toast.style.borderLeftColor = '#108ee9';
        toast.querySelector('.toast-icon').style.color = '#108ee9';
        toast.querySelector('.toast-icon i').className = 'fa-solid fa-circle-check';
    }

    // Tampilkan Toast
    toast.classList.add('show');

    // Bunyikan Suara
    playNotificationSound(isError);

    // Sembunyikan otomatis setelah 3,5 detik
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Buka modal transfer
triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
});

// Tutup modal transfer
btnBatal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Proses Transfer
btnProses.addEventListener('click', () => {
    const tujuan = document.getElementById('tujuan').value;
    const nominal = parseInt(document.getElementById('nominal').value);

    if (!tujuan || !nominal || nominal <= 0) {
        showNotification('Transfer Gagal', 'Harap isi tujuan dan nominal transfer dengan benar!', true);
        return;
    }

    if (nominal > totalSaldo) {
        showNotification('Transfer Gagal', 'Saldo tidak cukup! Silakan klaim rezeki dulu.', true);
        return;
    }

    // Kelola Saldo
    totalSaldo -= nominal;
    updateSaldoDisplay();

    // Tampilkan Notifikasi + Suara
    showNotification(
        'Transfer Simulasi Sukses!', 
        `Berhasil kirim ${formatRupiah(nominal)} ke ${tujuan}`
    );

    // Reset Form & Tutup Modal
    document.getElementById('tujuan').value = '';
    document.getElementById('nominal').value = '';
    document.getElementById('catatan').value = '';
    modal.style.display = 'none';
});

// Klaim Tambahan Saldo
btnKlaim.addEventListener('click', () => {
    totalSaldo += 500000000;
    updateSaldoDisplay();
    showNotification('Rezeki Masuk!', 'Berhasil menambah saldo Rp 500.000.000');
});

// Sembunyikan/Tampilkan Saldo
toggleSaldoBtn.addEventListener('click', () => {
    isSaldoVisible = !isSaldoVisible;
    if (isSaldoVisible) {
        updateSaldoDisplay();
        toggleSaldoBtn.className = 'fa-regular fa-eye-slash';
    } else {
        saldoElement.innerText = 'Rp ••••••••••••';
        toggleSaldoBtn.className = 'fa-regular fa-eye';
    }
});

function updateSaldoDisplay() {
    if (isSaldoVisible) {
        saldoElement.innerText = formatRupiah(totalSaldo);
    }
}
