// === BAGIAN 1 dari 2: DEKLARASI TEMPLATE ANTARMUKA KOMPONEN ===
Vue.component('ba-stock-table', {
    template: `<div class="card stock-container">
    <div class="card-header-sitta">
        <h2><i class="fa-solid fa-boxes-stacked"></i> Manajer Stok Bahan Ajar Universitas Terbuka</h2>
        <button type="button" class="btn-sitta-action" @click="openCreateModal"><i class="fa-solid fa-square-plus"></i> Tambah Data Baru</button>
    </div>
    <div class="filter-wrapper-sitta">
        <div class="filter-grid-sitta">
            <!-- Kolom 1: Dropdown UT-Daerah -->
            <div class="form-group-sitta">
                <label for="filter-upbjj-select"><i class="fa-solid fa-map-location-dot"></i> UT-Daerah</label>
                <select id="filter-upbjj-select" name="filterUpbjj" v-model="filters.upbjj" class="form-control-sitta">
                    <option value="">-- Semua UT Daerah --</option>
                    <option v-for="daerah in upbjjList" :key="daerah" :value="daerah">{{ daerah }}</option>
                </select>
            </div>
            
            <!-- Kolom 2: Dropdown Kategori Menggunakan v-if Agar Hilang Total Sebelum UPBJJ Dipilih -->
            <div class="form-group-sitta" v-if="filters.upbjj">
                <label for="filter-kategori-select"><i class="fa-solid fa-tags"></i> Kategori Mata Kuliah</label>
                <select id="filter-kategori-select" name="filterKategori" v-model="filters.kategori" class="form-control-sitta">
                    <option value="">-- Semua Kategori --</option>
                    <option v-for="kat in kategoriList" :key="kat" :value="kat">{{ kat }}</option>
                </select>
            </div>
            
            <!-- Kolom 3: Urutkan Berdasarkan Bersanding Lurus Sejajar Dengan Tombol Ikon -->
            <div class="form-group-sitta">
                <label for="sort-by-select"><i class="fa-solid fa-arrow-up-down-wide-short"></i> Urutkan Berdasarkan</label>
                <div class="sort-flex-row-sitta">
                    <select id="sort-by-select" name="sortBy" v-model="sortBy" class="form-control-sitta">
                        <option value="judul">Judul Mata Kuliah</option>
                        <option value="qty">Jumlah Stok</option>
                        <option value="harga">Harga</option>
                    </select>
                    <button type="button" class="btn-sort-direction-sitta" @click="toggleSortDirection" :title="isAscending ? 'Urutan Naik' : 'Urutan Turun'">
                        <i :class="isAscending ? 'fa-solid fa-arrow-down-short-wide' : 'fa-solid fa-arrow-up-wide-short'"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="filter-actions-row-sitta">
            <label class="checkbox-container-sitta" for="filter-critical-checkbox">
                <input type="checkbox" id="filter-critical-checkbox" name="filterCritical" v-model="filters.criticalStock">
                <span class="checkmark-sitta"></span>
                <span class="checkbox-label-sitta text-danger-sitta"><i class="fa-solid fa-triangle-exclamation"></i> Tampilkan Stok Menipis & Kosong</span>
            </label>
            <button type="button" class="btn-system btn-system-secondary" @click="resetFilters"><i class="fa-solid fa-rotate-left"></i> Reset Filter</button>
        </div>
    </div>
    <div class="table-responsive-sitta">
        <table class="table-modern-sitta">
            <thead>
                <tr>
                    <th>Kode Mata Kuliah/Nama Mata Kuliah</th><th>Kategori</th><th>UT Daerah</th><th>Lokasi Rak</th><th>Harga</th><th>Stok</th><th>Safety Stok</th><th>Status</th><th class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredAndSortedStock" :key="item.kode">
                    <td><span class="book-code-sitta">{{ item.kode }}</span><span class="book-title-sitta">{{ item.judul }}</span></td>
                    <td>{{ item.kategori }}</td>
                    <td><span class="tag-region-sitta">{{ item.upbjj }}</span></td>
                    <td><code>{{ item.lokasiRak }}</code></td>
                    <td>{{ formatRupiah(item.harga) }}</td>
                    <td>{{ item.qty }} buah</td>
                    <td>{{ item.safety }} buah</td>
                    <td>
                        <div class="status-tooltip-wrapper-sitta">
                            <status-badge :qty="item.qty" :safety="item.safety"></status-badge>
                            <div class="status-tooltip-sitta" v-html="item.catatanHTML || '<em>Tidak ada catatan</em>'"></div>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons-sitta">
                            <button type="button" class="btn-icon-sitta btn-edit-sitta" @click="openEditModal(item)" title="Ubah Data"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button type="button" class="btn-icon-sitta btn-delete-sitta" @click="triggerDelete(item)" title="Hapus Data"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
                <tr v-if="filteredAndSortedStock.length === 0">
                    <td colspan="9" class="text-center no-data-sitta"><i class="fa-solid fa-folder-open"></i> Tidak ada data stok yang cocok.</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="modal-backdrop-system modal-form-core-class" v-if="modalVisible" @click.self="closeModal" tabindex="0" ref="stockModalRef" @keyup.esc="closeModal" @keyup.enter="submitStockForm">
        <div class="modal-box-core form-modal-layout animate-scale">
            <div class="modal-box-header">
                <h3><i class="fa-solid fa-boxes-stacked"></i> {{ isEditMode ? 'Ubah Data Bahan Ajar' : 'Tambah Bahan Ajar Baru' }}</h3>
                <button type="button" class="modal-box-close" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-box-body">
                <div class="form-grid-3-columns">
    <div class="form-group-sitta">
        <label for="form-kode-input">Kode Mata Kuliah *</label>
        <input type="text" id="form-kode-input" name="formKode" v-model="formStock.kode" placeholder="Contoh: EKMA4115" class="form-control-sitta" :disabled="isEditMode">
    </div>
    <div class="form-group-sitta">
        <label for="form-judul-input">Judul Mata Kuliah *</label>
        <input type="text" id="form-judul-input" name="formJudul" v-model="formStock.judul" placeholder="Contoh: Pengantar Akuntansi" class="form-control-sitta">
    </div>
    <div class="form-group-sitta">
        <label for="form-kategori-select">Kategori *</label>
        <select id="form-kategori-select" name="formKategori" v-model="formStock.kategori" class="form-control-sitta">
            <option value="">-- Pilih Kategori --</option>
            <option v-for="kat in kategoriList" :key="kat" :value="kat">{{ kat }}</option>
        </select>
    </div>
    <div class="form-group-sitta">
        <label for="form-upbjj-select">UT Daerah (UPBJJ) *</label>
        <select id="form-upbjj-select" name="formUpbjj" v-model="formStock.upbjj" class="form-control-sitta">
            <option value="">-- Pilih Wilayah --</option>
            <option v-for="d in upbjjList" :key="d" :value="d">{{ d }}</option>
        </select>
    </div>
    <div class="form-group-sitta">
        <label for="form-rak-input">Lokasi Rak Gudang *</label>
        <input type="text" id="form-rak-input" name="formRak" v-model="formStock.lokasiRak" placeholder="Contoh: R1-A4" class="form-control-sitta">
    </div>
    <div class="form-group-sitta">
        <label for="form-harga-input">Harga Satuan (Rp) *</label>
        <input type="number" id="form-harga-input" name="formHarga" v-model.number="formStock.harga" placeholder="Contoh: 60000" class="form-control-sitta">
    </div>
    <div class="form-group-sitta">
        <label for="form-qty-input">Jumlah Stok Awal *</label>
        <input type="number" id="form-qty-input" name="formQty" v-model.number="formStock.qty" placeholder="Contoh: 50" class="form-control-sitta">
    </div>
    <div class="form-group-sitta">
        <label for="form-safety-input">Batas Safety Stok *</label>
        <input type="number" id="form-safety-input" name="formSafety" v-model.number="formStock.safety" placeholder="Contoh: 15" class="form-control-sitta">
    </div>
</div>
                <div v-if="formError" class="error-banner-sitta"><i class="fa-solid fa-circle-xmark"></i> {{ formError }}</div>
            </div>
            <div class="modal-box-footer">
                <button type="button" class="btn-system btn-system-secondary" @click="closeModal">Batal</button>
                <button type="button" class="btn-system btn-system-primary" @click="submitStockForm">Simpan</button>
            </div>
        </div>
    </div>
</div>`,

    // === BAGIAN 2 dari 2: LOGIKA INSTANCE DAN REAKTIVITAS KOMPONEN ===
    data: function () {
        return {
            filters: { upbjj: '', kategori: '', criticalStock: false }, sortBy: 'judul', isAscending: true, modalVisible: false, isEditMode: false, formError: '',
            formStock: { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: '', qty: '', safety: '' }
        };
    },
    computed: {
        upbjjList: function () { return this.$root.state.upbjjList; },
        kategoriList: function () { return this.$root.state.kategoriList; },
        stockList: function () { return this.$root.state.stockList; },
        filteredAndSortedStock: function () {
            let list = [...this.stockList];
            if (this.filters.upbjj) list = list.filter(item => item.upbjj === this.filters.upbjj);
            if (this.filters.upbjj && this.filters.kategori) list = list.filter(item => item.kategori === this.filters.kategori);
            if (this.filters.criticalStock) list = list.filter(item => item.qty < item.safety || item.qty === 0);

            // PENGURUTAN DINAMIS NAIK-TURUN:
            list.sort((a, b) => {
                let fieldA = a[this.sortBy];
                let fieldB = b[this.sortBy];
                let modifier = this.isAscending ? 1 : -1; // <-- Mengatur arah sorting naik atau turun

                if (typeof fieldA === 'string') {
                    return fieldA.localeCompare(fieldB) * modifier;
                }
                return (fieldA - fieldB) * modifier;
            });
            return list;
        }
    },
    watch: {
        'filters.upbjj': function (newVal) { if (!newVal) this.filters.kategori = ''; }
    },
    methods: {
        resetFilters: function () { this.filters.upbjj = ''; this.filters.kategori = ''; this.filters.criticalStock = false; this.sortBy = 'judul'; },
        openCreateModal: function () {
            this.isEditMode = false; this.clearForm(); this.modalVisible = true;
            // PERBAIKAN AUTO FOCUS: Sesuai instruksi, mengunci fokus langsung ke elemen modal itu sendiri (bukan field isiannya)
            this.$nextTick(() => { if (this.$refs.stockModalRef) this.$refs.stockModalRef.focus(); });
        },
        openEditModal: function (stock) {
            this.isEditMode = true; this.formError = ''; this.formStock = { ...stock }; this.modalVisible = true;
            // PERBAIKAN AUTO FOCUS: Sesuai instruksi, mengunci fokus langsung ke elemen modal itu sendiri (bukan field isiannya)
            this.$nextTick(() => { if (this.$refs.stockModalRef) this.$refs.stockModalRef.focus(); });
        },
        closeModal: function () { this.modalVisible = false; this.clearForm(); },
        validateForm: function () {
            if (!this.formStock.kode || !this.formStock.judul || !this.formStock.kategori || !this.formStock.upbjj || !this.formStock.lokasiRak) { this.formError = 'Semua field wajib diisi lengkap.'; return false; }
            if (this.formStock.harga === '' || this.formStock.harga < 0 || this.formStock.qty === '' || this.formStock.qty < 0 || this.formStock.safety === '' || this.formStock.safety < 0) { this.formError = 'Nilai angka harus positif.'; return false; }
            this.formError = ''; return true;
        },
        submitStockForm: function () {
            if (!this.validateForm()) return;
            if (this.isEditMode) {
                const idx = this.stockList.findIndex(item => item.kode === this.formStock.kode);
                if (idx !== -1) { Vue.set(this.stockList, idx, { ...this.stockList[idx], judul: this.formStock.judul, kategori: this.formStock.kategori, upbjj: this.formStock.upbjj, lokasiRak: this.formStock.lokasiRak, harga: parseInt(this.formStock.harga), qty: parseInt(this.formStock.qty), safety: parseInt(this.formStock.safety) }); }
                this.modalVisible = false; this.$root.$refs.modal.showAlert('Berhasil', 'Data bahan ajar berhasil diperbaharui!', 'fa-solid fa-circle-check');
            } else {
                if (this.stockList.some(item => item.kode === this.formStock.kode)) { this.formError = 'Kode mata kuliah sudah ada di sistem.'; return; }
                this.stockList.push({ kode: this.formStock.kode, judul: this.formStock.judul, kategori: this.formStock.kategori, upbjj: this.formStock.upbjj, lokasiRak: this.formStock.lokasiRak, harga: parseInt(this.formStock.harga), qty: parseInt(this.formStock.qty), safety: parseInt(this.formStock.safety), catatanHTML: '<em>Data baru ditambahkan</em>' });
                this.modalVisible = false; this.$root.$refs.modal.showAlert('Berhasil', 'Bahan ajar baru berhasil ditambahkan!', 'fa-solid fa-circle-check');
            }
            this.clearForm();
        },
        triggerDelete: function (stock) {
            this.$root.$refs.modal.showDeleteConfirm('Hapus Bahan Ajar', 'Apakah Anda yakin ingin menghapus data stok ' + stock.kode + ' - ' + stock.judul + '?').then((confirmed) => {
                if (confirmed) {
                    const idx = this.stockList.findIndex(item => item.kode === stock.kode);
                    if (idx !== -1) { this.stockList.splice(idx, 1); this.$root.$refs.modal.showAlert('Terhapus', 'Data berhasil dihapus dari sistem.', 'fa-solid fa-circle-check'); }
                }
            });
        },
        toggleSortDirection: function () {
            this.isAscending = !this.isAscending;
        },

        resetFilters: function () {
            this.filters.upbjj = '';
            this.filters.kategori = '';
            this.filters.criticalStock = false;
            this.sortBy = 'judul';
            this.isAscending = true; // <-- Reset juga arah sortingnya ke default naik
        },

        clearForm: function () { this.formStock = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: '', qty: '', safety: '' }; this.formError = ''; },
        formatRupiah: function (val) { return !val && val !== 0 ? 'Rp 0' : 'Rp ' + val.toLocaleString('id-ID'); }
    }
});
