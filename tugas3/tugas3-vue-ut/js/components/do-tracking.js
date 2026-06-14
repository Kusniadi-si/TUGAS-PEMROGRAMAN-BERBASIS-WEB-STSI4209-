// === BAGIAN 1 dari 2: DEKLARASI TEMPLATE ANTARMUKA KOMPONEN ===
Vue.component('do-tracking', {
    template: `<div class="card tracking-container">
    <div class="card-header-sitta">
        <h2><i class="fa-solid fa-map-location-dot"></i> Tracking Delivery Order (DO) Bahan Ajar</h2>
        <button type="button" class="btn-sitta-action" @click="openCreateDOModal"><i class="fa-solid fa-cart-plus"></i> Tambah Order Baru (Form)</button>
    </div>
    <div class="search-section-box">
    <!-- Kotak input pencarian -->
    <div class="search-input-wrapper">
        <i class="fa-solid fa-magnifying-glass search-box-icon"></i>
        <!-- Class diganti biar gak bentrok sama CSS lama -->
        <input type="text" id="search-query-field" name="searchQuery" v-model="searchQuery" placeholder="Cari berdasarkan Nomor DO atau NIM... (Tekan Enter)" @keyup.enter.prevent="performSearch" class="input-pencarian-modern" ref="searchField">
    </div>
        <button type="button" class="btn-sitta-search-submit" @click="performSearch">
        <i class="fa-solid fa-magnifying-glass"></i> Lacak
        </button>
    </div>
<div v-if="searchExecuted && searchResults.length > 0" class="table-responsive-sitta fade-in">
    <table class="table-modern-sitta">
        <thead>
            <tr>
                <th>Nomor DO</th>
                <th>NIM</th>
                <th>Nama Penerima</th>
                <th>Ekspedisi</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in searchResults" :key="item.noDO">
                <td><strong>{{ item.noDO }}</strong></td>
                <td>{{ item.nim }}</td>
                <td>{{ item.nama }}</td>
                <td>{{ item.ekspedisi }}</td>
                <td><span :class="['badge-status-system', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="text-center">
                    <button type="button" class="btn-system-info" @click="openDetailModal(item)">
                        <i class="fa-solid fa-circle-info"></i> Detail
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<!-- Jika data TIDAK ditemukan, tabel tidak akan dirender, melainkan diganti teks peringatan ringkas ini -->
<div v-if="searchExecuted && searchResults.length === 0" class="no-data-sitta text-center fade-in">
    <p><i class="fa-solid fa-folder-open"></i> Data pengiriman tidak ditemukan.</p>
</div>
    <div class="modal-backdrop-system modal-form-core-class" v-if="detailModalVisible" @click.self="closeDetailModal" tabindex="0" ref="detailModalBox" @keyup.esc="closeDetailModal">
        <div class="modal-box-core form-modal-layout animate-scale">
            <div class="modal-box-header">
                <h3><i class="fa-solid fa-circle-info"></i> Rincian Pengiriman - {{ activeDO.noDO }}</h3>
                <button type="button" class="modal-box-close" @click="closeDetailModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-box-body grid-detail-do">
                <div class="info-do-summary">
                    <p><strong>NIM / Nama:</strong> {{ activeDO.nim }} - {{ activeDO.nama }}</p>
                    <p><strong>Ekspedisi:</strong> {{ activeDO.ekspedisi }}</p>
                    <p><strong>Tanggal Kirim:</strong> {{ formatTanggal(activeDO.tanggalKirim) }}</p>
                    <p><strong>Total Harga Paket:</strong> {{ formatRupiah(activeDO.total) }}</p>
                </div>
                <div class="timeline-container-sitta-large">
                    <h4><i class="fa-solid fa-timeline"></i> Riwayat Perjalanan Paket</h4>
                    <ul class="timeline-sitta-modern">
                        <li v-for="(log, idx) in activeDO.perjalanan" :key="idx">
                            <span class="timeline-time-sitta-modern"><i class="fa-regular fa-clock"></i> {{ log.waktu }}</span>
                            <p class="timeline-text-sitta-modern">{{ log.keterangan }}</p>
                        </li>
                    </ul>
                </div>
                <div class="add-progress-box-sitta">
                    <label for="new-progress-input">Tambah Catatan Perjalanan Baru:</label>
                    <div class="input-inline-group-sitta">
                        <input type="text" id="new-progress-input" name="newProgressText" v-model="newProgressText" placeholder="Ketik status posisi paket saat ini..." class="form-control-sitta" @keyup.enter="updateProgressLog" ref="progressInputRef">
                        <button type="button" class="btn-system btn-system-primary" @click="updateProgressLog">Update</button>
                    </div>
                </div>
            </div>
            <div class="modal-box-footer"><button type="button" class="btn-system btn-system-secondary" @click="closeDetailModal">Tutup (Esc)</button></div>
        </div>
    </div>
    <div class="modal-backdrop-system modal-form-core-class" v-if="createModalVisible" @click.self="closeCreateDOModal" tabindex="0" ref="createModalBox" @keyup.esc="closeCreateDOModal" @keyup.enter="submitNewDO">
        <div class="modal-box-core form-modal-layout animate-scale">
            <div class="modal-box-header">
                <h3><i class="fa-solid fa-file-circle-plus"></i> Formulir Pemesanan Baru (Delivery Order)</h3>
                <button type="button" class="modal-box-close" @click="closeCreateDOModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-box-body">
                <div class="form-grid-3-columns">
                    <div class="form-group-sitta"><label for="do-auto-num">Nomor DO (Otomatis)</label><input type="text" id="do-auto-num" name="doAutoNum" :value="nextDONumber" class="form-control-sitta input-disabled-sitta" disabled></div>
                    <div class="form-group-sitta"><label for="do-nim-input">NIM Mahasiswa *</label><input type="text" id="do-nim-input" name="doNim" v-model="formDO.nim" placeholder="Masukkan NIM" class="form-control-sitta"></div>
                    <div class="form-group-sitta"><label for="do-nama-input">Nama Lengkap Penerima *</label><input type="text" id="do-nama-input" name="doNama" v-model="formDO.nama" placeholder="Masukkan Nama" class="form-control-sitta"></div>
                    <div class="form-group-sitta">
                        <label for="do-exp-select">Ekspedisi Pengiriman *</label>
                        <select id="do-exp-select" name="doExp" v-model="formDO.ekspedisi" class="form-control-sitta">
                            <option value="">-- Pilih Kurir --</option>
                            <option v-for="exp in pengirimanList" :key="exp.kode" :value="exp.nama">{{ exp.nama }}</option>
                        </select>
                    </div>
                    <div class="form-group-sitta">
                        <label for="do-paket-select">Paket Bahan Ajar *</label>
                        <select id="do-paket-select" name="doPaket" v-model="formDO.paket" @change="onPaketSelectChange" class="form-control-sitta">
                            <option value="">-- Pilih Paket --</option>
                            <option v-for="p in paketList" :key="p.kode" :value="p.kode">{{ p.nama }}</option>
                        </select>
                    </div>
                    <div class="form-group-sitta"><label for="do-date-input">Tanggal Kurim Berkas</label><input type="date" id="do-date-input" name="doDate" v-model="formDO.tanggalKirim" class="form-control-sitta"></div>
                </div>
                <div v-if="selectedPaketInfo" class="paket-preview-inline-card fade-in">
                    <p><strong>Isi Paket Dokumen:</strong> {{ selectedPaketInfo.isi.join(', ') }}</p>
                    <p><strong>Tarif Total Harga:</strong> <span class="price-highlight-text">{{ formatRupiah(selectedPaketInfo.harga) }}</span></p>
                </div>
            </div>
            <div class="modal-box-footer"><button type="button" class="btn-system btn-system-secondary" @click="closeCreateDOModal">Batal</button><button type="button" class="btn-system btn-system-primary" @click="submitNewDO">Simpan</button></div>
        </div>
    </div>
</div>`,
    // === BAGIAN 2 dari 2: LOGIKA INSTANCE DAN REAKTIVITAS KOMPONEN ===
    data: function () {
        return {
            searchQuery: '', searchExecuted: false, searchResults: [], activeDO: null, detailModalVisible: false, createModalVisible: false, newProgressText: '',
            formDO: { nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: new Date().toISOString().split('T')[0] }, selectedPaketInfo: null
        };
    },
    computed: {
        trackingList: function () { return this.$root.state.trackingList; },
        pengirimanList: function () { return this.$root.state.pengirimanList; },
        paketList: function () { return this.$root.state.paketList; },
        nextDONumber: function () {
            const tahun = new Date().getFullYear();
            if (!this.trackingList || this.trackingList.length === 0) return 'DO' + tahun + '-001';
            let maxSeq = 0;
            this.trackingList.forEach(item => {
                if (item.noDO && item.noDO.startsWith('DO' + tahun + '-')) {
                    const parts = item.noDO.split('-');
                    if (parts.length === 2) {
                        const seqNum = parseInt(parts[1], 10);
                        if (!isNaN(seqNum) && seqNum > maxSeq) maxSeq = seqNum;
                    }
                }
            });
            return 'DO' + tahun + '-' + String(maxSeq + 1).padStart(3, '0');
        }
    },
    mounted: function () { this.focusSearchField(); window.addEventListener('keyup', this.handleGlobalEsc); },
    beforeDestroy: function () {
        // TAMBAHKAN INI: Bersihkan listener saat pindah komponen
        window.removeEventListener('keyup', this.handleGlobalEsc);
    },
    methods: {
        focusSearchField: function () { this.$nextTick(() => { if (this.$refs.searchField) this.$refs.searchField.focus(); }); },
        performSearch: function () {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) { this.searchResults = []; this.searchExecuted = false; return; }
            this.searchResults = this.trackingList.filter(item => item.noDO.toLowerCase() === query || item.nim.toLowerCase() === query);
            this.searchExecuted = true;
        },
        clearSearch: function () { this.searchQuery = ''; this.searchResults = []; this.searchExecuted = false; this.focusSearchField(); },
        openDetailModal: function (item) {
            this.activeDO = item; this.detailModalVisible = true;
            // PERBAIKAN AUTO FOCUS: Mengunci fokus langsung ke backdrop pembungkus modal utama (Bukan field isian)
            this.$nextTick(() => { if (this.$refs.detailModalBox) this.$refs.detailModalBox.focus(); });
        },
        closeDetailModal: function () { this.detailModalVisible = false; this.newProgressText = ''; this.focusSearchField(); },
        openCreateDOModal: function () {
            this.createModalVisible = true;
            // PERBAIKAN AUTO FOCUS: Mengunci fokus langsung ke backdrop pembungkus modal utama (Bukan field isian)
            this.$nextTick(() => { if (this.$refs.createModalBox) this.$refs.createModalBox.focus(); });
        },
        closeCreateDOModal: function () { this.createModalVisible = false; this.formDO = { nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: new Date().toISOString().split('T')[0] }; this.selectedPaketInfo = null; this.focusSearchField(); },
        onPaketSelectChange: function () {
            if (!this.formDO.paket) { this.selectedPaketInfo = null; return; }
            this.selectedPaketInfo = this.paketList.find(p => p.kode === this.formDO.paket) || null;
        },
        updateProgressLog: function () {
            if (!this.newProgressText.trim()) { this.$root.$refs.modal.showAlert('Peringatan', 'Keterangan progress tidak boleh kosong.', 'fa-solid fa-circle-xmark'); return; }
            const s = new Date(); const pad = (n) => String(n).padStart(2, '0');
            const w = s.getFullYear() + '-' + pad(s.getMonth() + 1) + '-' + pad(s.getDate()) + ' ' + pad(s.getHours()) + ':' + pad(s.getMinutes()) + ':' + pad(s.getSeconds());
            this.activeDO.perjalanan.push({ waktu: w, keterangan: this.newProgressText.trim() });
            const savedText = this.newProgressText.trim(); this.newProgressText = '';

            // PERBAIKAN POPUP PROGRESS: Dialihkan memicu custom modal pemberitahuan (Bukan alert bawaan)
            this.$root.$refs.modal.showAlert('Progres Diperbarui', 'Status: "' + savedText + '" berhasil ditambahkan.', 'fa-solid fa-circle-check')
                .then(() => { this.$nextTick(() => { if (this.$refs.progressInputRef) this.$refs.progressInputRef.focus(); }); });
        },
        validateForm: function () {
            if (!this.formDO.nim.trim() || !this.formDO.nama.trim() || !this.formDO.ekspedisi || !this.formDO.paket) {
                this.$root.$refs.modal.showAlert('Validasi Gagal', 'Field bertanda bintang (*) wajib diisi.', 'fa-solid fa-circle-xmark'); return false;
            }
            return true;
        },
        submitNewDO: function () {
            if (!this.validateForm()) return;
            const s = new Date(); const pad = (n) => String(n).padStart(2, '0');
            const w = s.getFullYear() + '-' + pad(s.getMonth() + 1) + '-' + pad(s.getDate()) + ' ' + pad(s.getHours()) + ':' + pad(s.getMinutes()) + ':' + pad(s.getSeconds());
            this.trackingList.push({
                noDO: this.nextDONumber, nim: this.formDO.nim.trim(), nama: this.formDO.nama.trim(), status: 'Dalam Perjalanan', ekspedisi: this.formDO.ekspedisi,
                tanggalKirim: this.formDO.tanggalKirim, paket: this.formDO.paket, total: this.selectedPaketInfo ? this.selectedPaketInfo.harga : 0,
                perjalanan: [{ waktu: w, keterangan: 'Penerimaan di Hub Utama SITTA UT (Gudang Pusat)' }]
            });
            this.closeCreateDOModal();
            this.$root.$refs.modal.showAlert('Sukses', 'Dokumen Delivery Order berhasil tersimpan ke database.', 'fa-solid fa-circle-check');
        },
        formatRupiah: function (v) { return !v ? 'Rp 0' : 'Rp ' + v.toLocaleString('id-ID'); },
        formatTanggal: function (d) {
            if (!d) return '-';
            // Menampung daftar nama bulan resmi sesuai kalender Indonesia
            const b = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            const p = d.split('-');
            if (p.length !== 3) return d;

            // Ambil masing-masing bagian: p[0]=Tahun, p[1]=Bulan, p[2]=Tanggal
            const tgl = parseInt(p[2], 10);
            const blnIndex = parseInt(p[1], 10) - 1; // Dikurangi 1 agar sesuai index array (0-11)
            const thn = p[0];

            return tgl + ' ' + b[blnIndex] + ' ' + thn;
        },
        getStatusClass: function (s) { return s === 'Selesai' ? 'badge-success' : s === 'Dalam Perjalanan' ? 'badge-warning' : 'badge-danger'; },
        handleGlobalEsc: function (event) {
            // Ambil nama key secara standar modern
            const key = event.key || '';
            if (key === 'Escape' || key === 'Esc' || event.keyCode === 27) {
                this.clearSearch();
            }
        }
    }
});