// js/stok-app.js - Versi Final dengan Integrasi Konfirmasi Hapus Terpadu

const { createApp } = Vue;

createApp({
  data() {
    const dataAsal = konfigurasiAplikasiUT.data();
    
    return {
      upbjjList: dataAsal.upbjjList,
      kategoriList: dataAsal.kategoriList,
      stok: dataAsal.stok,

      filterForm: {
        upbjj: '',
        kategori: '',
        sortBy: 'judul',
        isKritis: false
      },

      // Kontrol Modal Tambah Data Baru
      modeTambahAktif: false,
      formInput: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      },
      errors: {},

      // Kontrol Modal Edit Stok Terintegrasi Hapus
      modeEditAktif: false,
      konfirmasiHapusAktif: false, // Menandai apakah sedang di langkah pertanyaan yakin/tidak
      formEdit: {
        indexAsli: null,
        kode: '',
        judul: '',
        upbjj: '',
        qty: 0
      },
      errorEdit: ''
    };
  },

  watch: {
    // Watcher 1: Memantau perubahan pilihan UPBJJ pada filter (Kode asli Anda)
    'filterForm.upbjj'(newVal) {
      if (newVal === '') {
        this.filterForm.kategori = '';
      }
    },

    // Watcher 2: Memantau kuantitas stok baru secara real-time untuk otomatisasi catatan HTML
    'formInput.qty'(newQty) {
      const qtyNum = parseInt(newQty);
      const safetyNum = parseInt(this.formInput.safety);

      // Jika kuantitas valid dan berada di bawah batas safety stock
      if (!isNaN(qtyNum) && !isNaN(safetyNum) && qtyNum < safetyNum) {
        this.formInput.catatanHTML = '<span style="color: #d9534f; font-weight: bold;">⚠️ Stok awal kritis (di bawah safety stock)</span>';
      } else if (!isNaN(qtyNum) && !isNaN(safetyNum) && qtyNum >= safetyNum) {
        this.formInput.catatanHTML = ''; // Kosongkan otomatis jika stok aman
      }
    }
  },

  computed: {
    // Properti komputasi untuk mengolah penyaringan dan pengurutan data secara real-time
    dataStokTersaring() {
      // 1. Petakan data master ke objek baru dengan menyertakan indeks asli sebagai penanda waktu input
      let result = this.stok.map((item, index) => {
        return { ...item, indeksAsli: index };
      });

      // 2. Saringan berdasarkan lokasi UT-Daerah (UPBJJ)
      if (this.filterForm.upbjj !== '') {
        result = result.filter(item => item.upbjj === this.filterForm.upbjj);
      }

      // 3. Saringan berdasarkan Kategori Mata Kuliah (Kunci dependencies)
      if (this.filterForm.upbjj !== '' && this.filterForm.kategori !== '') {
        result = result.filter(item => item.kategori === this.filterForm.kategori);
      }

      // 4. Saringan kondisi Kritis / Butuh Re-order (Stok < Safety Stock ATAU Stok == 0)
      if (this.filterForm.isKritis) {
        result = result.filter(item => item.qty === 0 || item.qty < item.safety);
      }

      // 5. Proses Pengurutan Data (Sorting) yang Dibuat Imutabel Agar Tidak Bentrok dengan Filter
      const sortKey = this.filterForm.sortBy;
      
      // Menggunakan teknik [...result] agar pengurutan dilakukan pada array salinan yang bersih
      let sortedResult = [...result];

      sortedResult.sort((a, b) => {
        if (sortKey === 'terbaru') {
          // Mengurutkan berdasarkan indeks tertinggi ke terendah (Data baru otomatis melesat ke atas)
          return b.indeksAsli - a.indeksAsli;
        } else if (sortKey === 'qty' || sortKey === 'harga') {
          // Mengurutkan tipe angka dari kecil ke besar (Ascending)
          return a[sortKey] - b[sortKey];
        } else {
          // Mengurutkan teks judul berdasarkan abjad A-Z
          return a[sortKey].localeCompare(b[sortKey], 'id', { sensitivity: 'base' });
        }
      });

      return sortedResult;
    }
  },

  methods: {
    resetFilter() {
      this.filterForm.upbjj = '';
      this.filterForm.kategori = '';
      this.filterForm.sortBy = 'judul';
      this.filterForm.isKritis = false;
    },

    // Aksi Modal Tambah
    bukaModalTambah() {
      this.errors = {};
      this.modeTambahAktif = true;
    },
    tutupModalTambah() {
      this.modeTambahAktif = false;
      this.formInput = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: '', qty: '', safety: '', catatanHTML: '' };
      this.errors = {};
    },

    simpanBahanAjar() {
      this.errors = {};

      if (!this.formInput.kode.trim()) this.errors.kode = 'Kode modul wajib diisi.';
      if (!this.formInput.judul.trim()) this.errors.judul = 'Judul buku wajib diisi.';
      if (!this.formInput.kategori) this.errors.kategori = 'Silakan pilih kategori kuliah.';
      if (!this.formInput.upbjj) this.errors.upbjj = 'Silakan pilih lokasi UT-Daerah.';
      if (!this.formInput.lokasiRak.trim()) this.errors.lokasiRak = 'Lokasi rak wajib diisi.';
      
      if (this.formInput.harga === '' || this.formInput.harga < 0) this.errors.harga = 'Harga harus angka positif.';
      if (this.formInput.qty === '' || this.formInput.qty < 0) this.errors.qty = 'Jumlah qty harus angka positif.';
      if (this.formInput.safety === '' || this.formInput.safety < 0) this.errors.safety = 'Batas safety stock harus angka positif.';

      if (this.formInput.kode.trim()) {
        const pattern = /^[A-Z]{4}\d{4}$/;
        if (!pattern.test(this.formInput.kode.trim().toUpperCase())) {
          this.errors.kode = 'Format wajib 4 huruf besar diikuti 4 angka (Contoh: EKMA4115).';
        }
      }

      if (this.formInput.kode.trim() && this.formInput.upbjj) {
        const isDuplicate = this.stok.some(item => {
          return item.kode.toUpperCase() === this.formInput.kode.trim().toUpperCase() && 
                 item.upbjj === this.formInput.upbjj;
        });
        if (isDuplicate) {
          this.errors.kode = 'Kode modul tersebut sudah terdaftar di lokasi UT Daerah ini.';
        }
      }

      if (Object.keys(this.errors).length > 0) {
        return;
      }

      const dataBaru = {
        kode: this.formInput.kode.trim().toUpperCase(),
        judul: this.formInput.judul.trim(),
        kategori: this.formInput.kategori,
        upbjj: this.formInput.upbjj,
        lokasiRak: this.formInput.lokasiRak.trim().toUpperCase(),
        harga: parseInt(this.formInput.harga),
        qty: parseInt(this.formInput.qty),
        safety: parseInt(this.formInput.safety),
        catatanHTML: this.formInput.catatanHTML.trim()
      };

      this.stok.push(dataBaru);
      this.tutupModalTambah();
    },

    // Aksi Modal Edit & Sistem Pengamanan Hapus Terpadu
    bukaModeEdit(item) {
      this.errorEdit = '';
      this.konfirmasiHapusAktif = false; // Reset langkah ke form utama saat modal dibuka
      const idx = this.stok.findIndex(s => s.kode === item.kode && s.upbjj === item.upbjj);
      
      if (idx !== -1) {
        this.formEdit = {
          indexAsli: idx,
          kode: item.kode,
          judul: item.judul,
          upbjj: item.upbjj,
          qty: item.qty
        };
        this.modeEditAktif = true;
      }
    },
    tutupModeEdit() {
      this.modeEditAktif = false;
      this.konfirmasiHapusAktif = false;
      this.formEdit = { indexAsli: null, kode: '', judul: '', upbjj: '', qty: 0 };
      this.errorEdit = '';
    },

    perbaruiStok() {
      this.errorEdit = '';

      if (this.formEdit.qty === '' || this.formEdit.qty < 0) {
        this.errorEdit = 'Jumlah stok harus angka dan tidak boleh negatif.';
        return;
      }

      const idx = this.formEdit.indexAsli;
      this.stok[idx].qty = parseInt(this.formEdit.qty);
      this.tutupModeEdit();
    },

    // Navigasi Langkah Pengamanan Internal Modal
    pemicuKonfirmasiHapus() {
      this.konfirmasiHapusAktif = true; // Bergeser ke tampilan pertanyaan yakin/tidak
    },
    batalkanKonfirmasiHapus() {
      this.konfirmasiHapusAktif = false; // Kembali ke formulir edit biasa
    },
    eksekusiHapusDariModal() {
      const idx = this.formEdit.indexAsli;
      if (idx !== null && idx !== -1) {
        this.stok.splice(idx, 1);
      }
      this.tutupModeEdit();
    }
  }
}).mount('#app');
