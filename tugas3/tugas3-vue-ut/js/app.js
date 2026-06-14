new Vue({
    el: '#app',
    data: function () {
        return {
            currentTab: 'beranda', // Default navigasi tab utama (Halaman 6 & 7)
            isSidebarCollapsed: false, // State reaktif menyembunyikan sidebar (Halaman 9)
            state: {
                upbjjList: [],
                kategoriList: [],
                pengirimanList: [],
                paketList: [],
                stockList: [],
                trackingList: []
            },
            isLoading: true
        };
    },
    // Implementasi minimal 2 Watcher untuk pengawasan data reaktif (Indikator 1.5)
    watch: {
        // Watcher 1: Memantau perpindahan halaman navigasi utama
        currentTab: function (newTab, oldTab) {
            console.log('SITTA Navigasi: Berpindah dari ' + oldTab + ' ke ' + newTab);
        },
        // Watcher 2: Memantau kondisi sediaan kritis di seluruh gudang
        'state.stockList': {
            deep: true,
            handler: function (newList) {
                const criticalCount = newList.filter(item => item.qty === 0 || item.qty < item.safety).length;
                if (criticalCount > 0) {
                    console.warn('SITTA Warning: Terdeteksi ' + criticalCount + ' item bahan ajar kritis/habis.');
                }
            }
        }
    },
    created: function () {
        this.loadInitialData();
    },
    methods: {
        // Memuat seluruh data referensi dari database dummy JSON SITTA UT (Halaman 5)
        loadInitialData: function () {
            this.isLoading = true;
            ApiService.fetchData()
                .then(data => {
                    this.state.upbjjList = data.upbjjList || [];
                    this.state.kategoriList = data.kategoriList || [];
                    this.state.pengirimanList = data.pengirimanList || [];
                    this.state.paketList = data.paket || [];
                    this.state.stockList = data.stok || [];
                    this.state.trackingList = data.tracking || [];
                    this.isLoading = false;
                })
                .catch(error => {
                    this.isLoading = false;
                    this.$nextTick(() => {
                        if (this.$refs.modal) {
                            this.$refs.modal.showAlert('Error', 'Gagal memuat basis data utama dari JSON.', 'fa-solid fa-circle-xmark');
                        }
                    });
                });
        },
        // Aksi toggle menyembunyikan sidebar panel kiri (Halaman 9)
        toggleSidebar: function () {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        // Otomatis membuka sidebar kembali saat menu ikon diklik (Halaman 9)
        handleMenuClick: function (tabName) {
            this.currentTab = tabName;
            if (this.isSidebarCollapsed) {
                this.isSidebarCollapsed = false;
            }
        }
    }
});
