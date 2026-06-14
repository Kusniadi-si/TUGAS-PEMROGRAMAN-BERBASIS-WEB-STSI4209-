Vue.component('order-form', {
    // Template inline menggunakan backtick literals murni (Tanpa XHR / HTTP Fetch)
    template: `<div class="card order-container">
    <div class="card-header-sitta">
        <h2><i class="fa-solid fa-cart-plus"></i> Formulir Pemesanan Bahan Ajar Baru (SITTA)</h2>
    </div>
    <form @submit.prevent="confirmOrderSubmission" class="order-form-sitta">
        <div class="form-grid-3-columns">
            <div class="form-group-sitta">
                <label for="form-order-upbjj"><i class="fa-solid fa-map-location-dot"></i> Wilayah UT-Daerah *</label>
                <select id="form-order-upbjj" name="orderUpbjj" v-model="formOrder.upbjj" class="form-control-sitta">
                    <option value="">-- Pilih UT-Daerah --</option>
                    <option v-for="daerah in upbjjList" :key="daerah" :value="daerah">{{ daerah }}</option>
                </select>
            </div>
            <div class="form-group-sitta">
                <label for="form-order-kategori"><i class="fa-solid fa-tags"></i> Kategori Mata Kuliah *</label>
                <select id="form-order-kategori" name="orderKategori" v-model="formOrder.kategori" class="form-control-sitta">
                    <option value="">-- Pilih Kategori --</option>
                    <option v-for="kat in kategoriList" :key="kat" :value="kat">{{ kat }}</option>
                </select>
            </div>
            <div class="form-group-sitta">
                <label for="form-order-kode"><i class="fa-solid fa-book"></i> Kode / Judul Bahan Ajar *</label>
                <input type="text" id="form-order-kode" name="orderKode" v-model="formOrder.kode" placeholder="Ketik kode/judul (misal: EKMA4116)" class="form-control-sitta">
            </div>
        </div>
        <div class="order-detail-card-sitta fade-in">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; align-items: center;">
                <div class="form-group-sitta">
                    <label for="form-order-rak"><i class="fa-solid fa-warehouse"></i> Penempatan Rak Gudang:</label>
                    <input type="text" id="form-order-rak" name="orderRak" v-model="formOrder.lokasiRak" placeholder="Misal: R1-A3" class="form-control-sitta">
                </div>
                <div class="form-group-sitta">
                    <label for="form-order-harga"><i class="fa-solid fa-tag"></i> Harga Satuan (Rp):</label>
                    <input type="number" id="form-order-harga" name="orderHarga" v-model.number="formOrder.harga" placeholder="0" class="form-control-sitta">
                </div>
                <div class="form-group-sitta">
                    <label for="form-order-safety"><i class="fa-solid fa-shield-halved"></i> Batas Safety Stok (buah) *</label>
                    <input type="number" id="form-order-safety" name="orderSafety" v-model.number="formOrder.safety" placeholder="0" class="form-control-sitta">
                </div>
                <div class="form-group-sitta">
                    <label for="form-order-jumlah"><i class="fa-solid fa-calculator"></i> Jumlah Pesanan (buah):</label>
                    <input type="number" id="form-order-jumlah" name="orderJumlah" v-model.number="formOrder.jumlah" min="1" class="form-control-sitta">
                </div>
            </div>
            <div class="total-summary-box-sitta">
                <span class="total-label-sitta">Subtotal Tagihan Pembayaran:</span>
                <span class="total-amount-sitta">{{ formatRupiah(totalBiaya) }}</span>
            </div>
        </div>
        <div class="form-actions-sitta">
            <button type="submit" class="btn-system btn-system-primary"><i class="fa-solid fa-cart-arrow-down"></i> Konfirmasi & Simpan Transaksi</button>
        </div>
    </form>
</div>`,
    data: function () {
        return {
            formOrder: { upbjj: '', kategori: '', kode: '', lokasiRak: '', harga: 0, safety: 0, jumlah: 1 }
        };
    },
    computed: {
        upbjjList: function () { return this.$root.state.upbjjList; },
        kategoriList: function () { return this.$root.state.kategoriList; },
        totalBiaya: function () {
            if (!this.formOrder.harga || !this.formOrder.jumlah) return 0;
            return this.formOrder.harga * this.formOrder.jumlah;
        }
    },
    methods: {
        validateForm: function (callback) {
            if (!this.formOrder.upbjj || !this.formOrder.kategori || !this.formOrder.kode.trim()) {
                this.$root.$refs.modal.showAlert('Validasi Gagal', 'Field isian bertanda bintang (*) wajib dipilih/diketik.', 'fa-solid fa-circle-xmark');
                return callback(false);
            }
            if (this.formOrder.harga < 0 || this.formOrder.jumlah < 1 || this.formOrder.safety < 0) {
                this.$root.$refs.modal.showAlert('Validasi Gagal', 'Isian harga, safety stok, dan jumlah pesanan harus bernilai positif.', 'fa-solid fa-circle-xmark');
                return callback(false);
            }
            return callback(true);
        },
        confirmOrderSubmission: function () {
            this.validateForm((isValid) => {
                if (!isValid) return;
                const rincianPesan = 'Wilayah: ' + this.formOrder.upbjj + 
                                     '<br>Kategori: ' + this.formOrder.kategori + 
                                     '<br>Bahan Ajar: ' + this.formOrder.kode + 
                                     '<br>Safety Stok: ' + this.formOrder.safety + ' buah' +
                                     '<br>Jumlah: ' + this.formOrder.jumlah + ' buah<br>Total Bayar: ' + this.formatRupiah(this.totalBiaya);
                
                this.$root.$refs.modal.showAlert('Pemesanan Tersimpan', rincianPesan, 'fa-solid fa-circle-check').then(() => {
                    this.formOrder = { upbjj: '', kategori: '', kode: '', lokasiRak: '', harga: 0, safety: 0, jumlah: 1 };
                });
            });
        },
        formatRupiah: function (value) { return !value && value !== 0 ? 'Rp 0' : 'Rp ' + value.toLocaleString('id-ID'); }
    }
});