/* ==========================================
   PROTEKSI HALAMAN (AUTH GUARD) & UTALITAS
   ========================================== */
(function () {
    const sessionUser = localStorage.getItem('sessionUser');
    const path = window.location.pathname;

    // Proteksi rute selain halaman login
    if (!path.includes('index.html') && path !== '/' && path !== '') {
        if (!sessionUser) {
            window.location.replace('index.html');
        } else {
            const showPage = () => {
                document.body.style.opacity = "1";
                document.body.style.display = "flex";
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showPage);
            } else {
                showPage();
            }
        }
    }
})();

// Fungsi utilitas manipulasi display elemen DOM
const setDisplay = (id, mode) => {
    const el = document.getElementById(id);
    if (el) el.style.display = mode;
};

function logoutSitta() {
    localStorage.removeItem('sessionUser');
    window.location.href = 'index.html';
}

/* ==========================================
   LOGIKA HALAMAN LOGIN
   ========================================== */
const loginForm = document.getElementById('login-form-auth');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mail = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        if (typeof dataPengguna !== 'undefined') {
            const user = dataPengguna.find(u => u.email === mail && u.password === pass);

            if (user) {
                showCustomAlert("Berhasil!", `Selamat Datang, ${user.nama}. Anda berhasil masuk ke sistem SITTA.`, "success");
                localStorage.setItem('sessionUser', JSON.stringify(user));
                document.getElementById('login-alert-btn').onclick = () => { window.location.href = 'dashboard.html'; };
            } else {
                showCustomAlert("Gagal!", "Email atau password yang anda masukkan salah. Silakan coba lagi.", "error");
                document.getElementById('login-alert-btn').onclick = closeCustomAlert;
            }
        }
    });
}

function showCustomAlert(title, message, type) {
    const titleEl = document.getElementById('login-alert-title');
    const iconEl = document.getElementById('login-alert-icon');

    document.getElementById('login-alert-message').innerText = message;
    titleEl.innerText = title;

    iconEl.className = "login-alert-icon";
    titleEl.className = "login-alert-title";

    const isSuccess = type === "success";
    iconEl.innerHTML = `<i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>`;
    iconEl.classList.add(isSuccess ? "icon-success" : "icon-error");
    titleEl.classList.add(isSuccess ? "icon-success" : "icon-error");

    setDisplay('login-custom-alert', 'block');
}

function closeCustomAlert() { setDisplay('login-custom-alert', 'none'); }

function loginShowModal(title) {
    const modalTitle = document.getElementById('login-modal-title');
    if (modalTitle) modalTitle.innerText = title;
    setDisplay('login-info-modal', 'block');
}

function loginCloseModal() { setDisplay('login-info-modal', 'none'); }

const togglePasswordBtn = document.getElementById('login-toggle-password');
const passwordInput = document.getElementById('login-password');
const eyeIcon = document.getElementById('login-eye-icon');

if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        // Tukar secara halus antara Mata Terbuka (fa-eye) dan Mata Berbulu Terpejam (fa-eye-low-vision)
        eyeIcon.className = isPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-low-vision';
    });
}


/* ==========================================
   LOGIKA HALAMAN DASHBOARD
   ========================================== */
const session = JSON.parse(localStorage.getItem('sessionUser'));
const userNameEl = document.getElementById('dash-userName');

if (userNameEl) {
    if (session) {
        userNameEl.innerText = session.nama;
        document.getElementById('dash-userLoc').innerText = session.lokasi;
    } else {
        window.location.href = 'index.html';
    }
}

function dashToggleDrop() {
    const dropMenu = document.getElementById('dash-dropMenu');
    const arrow = document.getElementById('dash-arrow');
    if (dropMenu && arrow) {
        dropMenu.classList.toggle('dash-show');
        arrow.classList.toggle('dash-rotate');
    }
}

const dateNowEl = document.getElementById('dash-dateNow');
if (dateNowEl) {
    const now = new Date();
    dateNowEl.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const h = now.getHours();
    const msg = (h < 11) ? "Selamat Pagi," : (h < 15) ? "Selamat Siang," : (h < 18) ? "Selamat Sore," : "Selamat Malam,";
    const greetText = document.getElementById('dash-greetText');
    if (greetText) greetText.innerText = msg;
}

function dashToggleSidebar() {
    document.body.classList.toggle('sidebar-hidden');
    const isHidden = document.body.classList.contains('sidebar-hidden');
    localStorage.setItem('sidebarPref', isHidden ? 'hidden' : 'visible');
    
    const toggleIcon = document.getElementById('dash-toggle-icon');
    if (toggleIcon) {
        toggleIcon.className = isHidden ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebarPref = localStorage.getItem('sidebarPref');
    const toggleIcon = document.getElementById('dash-toggle-icon');
    
    if (sidebarPref === 'hidden' && !window.location.pathname.includes('index.html')) {
        document.body.classList.add('sidebar-hidden');
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-angles-right';
    }
});

/* ==========================================
   LOGIKA HALAMAN STOK (PREFIX: stok-)
   ========================================== */
const stokTableBody = document.getElementById('stok-table-body');

function stokRender() {
    if (!stokTableBody || typeof dataBahanAjar === 'undefined') return;
    stokTableBody.innerHTML = dataBahanAjar.map((item, i) => `
        <tr>
            <td><img src="${item.cover}" class="stok-table-card cover-img" onclick="stokOpenEditModal(${i})"></td>
            <td>${item.kodeLokasi}</td>
            <td><b>${item.kodeBarang}</b></td>
            <td>${item.namaBarang}</td>
            <td>${item.jenisBarang}</td>
            <td>${item.edisi}</td>
            <td>${item.stok}</td>
        </tr>
    `).join('');
}

function stokShowAlert(msg) {
    const alertMsg = document.getElementById('stok-alert-msg');
    if (alertMsg) alertMsg.innerText = msg;
    setDisplay('stok-alert-modal', 'flex');
}

function stokCloseAlert() { setDisplay('stok-alert-modal', 'none'); }

function toggleStokForm(title, showDel, saveFlex) {
    const titleText = document.getElementById('stok-modal-title-text');
    const btnDel = document.getElementById('stok-btn-del');
    const btnSave = document.getElementById('stok-btn-save');

    if (titleText) titleText.innerText = title;
    if (btnDel) btnDel.style.display = showDel;
    if (btnSave) btnSave.style.flex = saveFlex;
    setDisplay('stok-modal-form', 'flex');
}

function stokOpenAddModal() {
    stokResetForm();
    toggleStokForm("Tambah Bahan Ajar", "none", "1");
}

function stokOpenEditModal(i) {
    const d = dataBahanAjar[i];
    if (!d) return;
    document.getElementById('stok-form-idx').value = i;
    document.getElementById('stok-in-lokasi').value = d.kodeLokasi;
    document.getElementById('stok-in-kode').value = d.kodeBarang;
    document.getElementById('stok-in-nama').value = d.namaBarang;
    document.getElementById('stok-in-jenis').value = d.jenisBarang;
    document.getElementById('stok-in-edisi').value = d.edisi;
    document.getElementById('stok-in-stok').value = d.stok;
    document.getElementById('stok-in-cover').value = d.cover.replace('img/', '');

    toggleStokForm("Informasi Bahan Ajar", "block", "2");
}

function stokCloseModal() { setDisplay('stok-modal-form', 'none'); }

function stokResetForm() {
    document.getElementById('stok-form-idx').value = "";
    document.querySelectorAll('#stok-modal-form input').forEach(i => i.value = "");
}

function stokSaveData() {
    const inputs = document.querySelectorAll('#stok-modal-form input:not([type="hidden"])');
    const valid = Array.from(inputs).every(i => i.value.trim() !== "");

    if (!valid) {
        stokShowAlert("Mohon lengkapi semua kolom!");
        return;
    }

    const idx = document.getElementById('stok-form-idx').value;
    const newData = {
        kodeLokasi: document.getElementById('stok-in-lokasi').value,
        kodeBarang: document.getElementById('stok-in-kode').value,
        namaBarang: document.getElementById('stok-in-nama').value,
        jenisBarang: document.getElementById('stok-in-jenis').value,
        edisi: document.getElementById('stok-in-edisi').value,
        stok: document.getElementById('stok-in-stok').value,
        cover: "img/" + document.getElementById('stok-in-cover').value
    };

    if (idx === "") {
        dataBahanAjar.push(newData);
    } else {
        dataBahanAjar[idx] = newData;
    }

    stokRender();
    stokCloseModal();
    stokShowAlert("Data Berhasil Disimpan");
}

function stokDeleteData() {
    const idx = document.getElementById('stok-form-idx').value;
    if (idx !== "" && typeof dataBahanAjar !== 'undefined') {
        dataBahanAjar.splice(idx, 1);
        stokRender();
        stokCloseModal();
        stokShowAlert("Data Telah Dihapus");
    }
}

if (stokTableBody) stokRender();

/* ==========================================
   LOGIKA HALAMAN TRACKING (PREFIX: track-)
   ========================================== */
function trackLacakPaket() {
    const inputVal = document.getElementById('track-noDO').value;
    const resultArea = document.getElementById('track-resultArea');

    if (typeof dataTracking !== 'undefined' && dataTracking[inputVal]) {
        const data = dataTracking[inputVal];
        if (resultArea) resultArea.style.display = "block";

        document.getElementById('track-nama-user').innerText = data.nama;
        document.getElementById('track-do-val').innerText = data.nomorDO;
        document.getElementById('track-status-ekspedisi').innerText = `${data.status} | ${data.ekspedisi}`;
        document.getElementById('track-paket-info').innerText = `Paket: ${data.paket} | Total: ${data.total}`;
        document.getElementById('track-date-val').innerText = data.tanggalKirim;

        const timelineList = document.getElementById('track-timelineList');
        if (timelineList && data.perjalanan) {
            timelineList.innerHTML = data.perjalanan.map(p => `
                <div class="track-timeline-item">
                    <div>
                        <p class="track-status-main">${p.keterangan}</p>
                        ${p.subtext ? `<span class="track-status-sub">${p.subtext}</span>` : ""}
                    </div>
                    <div class="track-status-time">${p.waktu}</div>
                </div>
            `).join('');
        }
    } else {
        alert("Nomor DO tidak ditemukan!");
        if (resultArea) resultArea.style.display = "none";
    }
}

/* ==========================================
   GLOBAL EVENT HANDLER (Klik Luar & Keyboard)
   ========================================== */
window.onclick = (e) => {
    // 1. Fitur Klik Layar Mana Saja Saat Alert Login Muncul (index.html)
    const loginAlert = document.getElementById('login-custom-alert');
    if (loginAlert && loginAlert.style.display === 'block') {
        const loginBtn = document.getElementById('login-alert-btn');
        if (loginBtn) {
            loginBtn.click(); // Otomatis picu tombol OK (Pindah ke dashboard / tutup alert)
            return;
        }
    }

    // 2. Logika Tutup Modal Jika Klik di Area Luar Box (Kondisi Normal)
    if (e.target.id === 'login-info-modal') loginCloseModal();
    if (e.target.id === 'stok-modal-form') stokCloseModal();
    if (e.target.id === 'stok-alert-modal') stokCloseAlert();
};

// Fitur Deteksi Tombol ENTER Universal untuk Semua Alert / Sembul
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const loginAlert = document.getElementById('login-custom-alert');
        const stokAlert = document.getElementById('stok-alert-modal');

        if (loginAlert && loginAlert.style.display === 'block') {
            const loginBtn = document.getElementById('login-alert-btn');
            if (loginBtn) {
                e.preventDefault();
                loginBtn.click();
                return;
            }
        }

        if (stokAlert && stokAlert.style.display === 'flex') {
            const stokBtn = stokAlert.querySelector('.stok-btn-ok');
            if (stokBtn) {
                e.preventDefault();
                stokBtn.click();
            }
        }
    }
});