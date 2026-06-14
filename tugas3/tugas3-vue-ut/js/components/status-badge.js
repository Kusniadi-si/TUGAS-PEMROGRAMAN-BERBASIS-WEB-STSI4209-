Vue.component('status-badge', {
    // Template inline menggunakan backtick literals murni (Tanpa XHR / HTTP Fetch)
    template: `<span :class="['badge-status-system', badgeClass]"><i :class="['badge-icon-system', iconClass]"></i><span class="badge-text-system">{{ statusText }}</span></span>`,
    props: {
        qty: {
            type: Number,
            required: true
        },
        safety: {
            type: Number,
            required: true
        }
    },
    computed: {
        // Indikator Status Sediaan Reaktif (Indikator 2.2)
        statusText: function () {
            if (this.qty === 0) {
                return 'Kosong';
            }
            if (this.qty < this.safety) {
                return 'Menipis';
            }
            return 'Aman';
        },
        // Aturan Warna Indikator Sesuai Ketentuan Universitas Terbuka (Indikator 2.2)
        badgeClass: function () {
            if (this.qty === 0) {
                return 'badge-danger'; // Latar merah untuk stok habis
            }
            if (this.qty < this.safety) {
                return 'badge-warning'; // Latar orange/kuning untuk stok menipis
            }
            return 'badge-success'; // Latar hijau untuk stok aman
        },
        // Integrasi Penanda Visual Simbol Ikon Font Awesome 7.0.1 (Indikator 2.2)
        iconClass: function () {
            if (this.qty === 0) {
                return 'fa-solid fa-circle-xmark';
            }
            if (this.qty < this.safety) {
                return 'fa-solid fa-triangle-exclamation';
            }
            return 'fa-solid fa-circle-check';
        }
    }
});