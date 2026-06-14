// js/tracking-app.js - Versi Final Akurat Tanpa Alert Browser Kaku

const { createApp } = Vue;

createApp({
  data() {
    const dataAsal = konfigurasiAplikasiUT.data();
    
    return {
      pengirimanList: dataAsal.pengirimanList,
      paketList: dataAsal.paket,
      stokList: dataAsal.stok,
      trackingRaw: dataAsal.tracking,

      // State Lacak DO
      searchQuery: '',
      hasilLacak: null,
      sudahMencari: false,

      // State Registrasi Order Baru
      formInput: {
        nim: '',
        nama: '',
        paketKode: '',
        ekspedisi: '',
        tanggalKirim: ''
      },
      errors: {},
      nextDoCounter: 2,

      // Kontrol Modal Pop-up Sukses Registrasi Kustom
      modeSuksesAktif: false,
      infoSukses: {
        noDO: '',
        nama: '',
        total: 0
      }
    };
  },

  methods: {
    lacakDO() {
      this.sudahMencari = true;
      this.hasilLacak = null;
      const query = this.searchQuery.trim().toUpperCase();

      if (!query) return;

      if (this.trackingRaw[query]) {
        this.hasilLacak = this.formatObjekTracking(query, this.trackingRaw[query]);
        return;
      }

      for (const noDO in this.trackingRaw) {
        if (this.trackingRaw[noDO].nim === query) {
          this.hasilLacak = this.formatObjekTracking(noDO, this.trackingRaw[noDO]);
          return;
        }
      }
    },

    formatObjekTracking(noDO, objekDO) {
      const infoPaket = this.paketList.find(p => p.kode === objekDO.paket);
      const paketNama = infoPaket ? infoPaket.nama : 'Paket Tidak Diketahui';

      const bukuDetail = [];
      if (infoPaket && infoPaket.isi) {
        infoPaket.isi.forEach(kodeBuku => {
          const detailBuku = this.stokList.find(s => s.kode === kodeBuku);
          if (detailBuku) {
            bukuDetail.push({
              kode: kodeBuku,
              judul: detailBuku.judul,
              lokasiRak: detailBuku.lokasiRak
            });
          } else {
            bukuDetail.push({
              kode: kodeBuku,
              judul: 'Modul Cetak UT',
              lokasiRak: '-'
            });
          }
        });
      }

      return {
        noDO: noDO,
        nim: objekDO.nim,
        nama: objekDO.nama,
        status: objekDO.status,
        ekspedisi: objekDO.ekspedisi,
        tanggalKirim: objekDO.tanggalKirim,
        total: objekDO.total,
        paketNama: paketNama,
        bukuDetail: bukuDetail,
        perjalanan: objekDO.perjalanan
      };
    },

    simpanDO() {
      this.errors = {};

      if (!this.formInput.nim.trim()) this.errors.nim = 'NIM mahasiswa wajib diisi.';
      if (!this.formInput.nama.trim()) this.errors.nama = 'Nama lengkap mahasiswa wajib diisi.';
      if (!this.formInput.paketKode) this.errors.paketKode = 'Silakan pilih jenis paket buku.';
      if (!this.formInput.ekspedisi) this.errors.ekspedisi = 'Silakan tentukan layanan ekspedisi.';
      if (!this.formInput.tanggalKirim) this.errors.tanggalKirim = 'Tanggal pengiriman tidak boleh kosong.';

      if (this.formInput.nim.trim() && isNaN(this.formInput.nim.trim())) {
        this.errors.nim = 'NIM harus berupa deretan angka numerik.';
      }

      if (Object.keys(this.errors).length > 0) return;

      const paketDipilih = this.paketList.find(p => p.kode === this.formInput.paketKode);
      const totalHarga = paketDipilih ? paketDipilih.harga : 0;

      const nomorUrutStr = String(this.nextDoCounter).padStart(4, '0');
      const noDoBaru = `DO2025-${nomorUrutStr}`;

      const waktuSekarang = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Simpan data master ke memori objek
      this.trackingRaw[noDoBaru] = {
        nim: this.formInput.nim.trim(),
        nama: this.formInput.nama.trim(),
        status: "Dalam Perjalanan",
        ekspedisi: this.formInput.ekspedisi,
        tanggalKirim: this.formInput.tanggalKirim,
        paket: this.formInput.paketKode,
        total: totalHarga,
        perjalanan: [
          { waktu: waktuSekarang, keterangan: "Manifest Awal: Berkas DO Berhasil Dibuat di Sistem SITTA UT" },
          { waktu: waktuSekarang, keterangan: "Paket dipersiapkan di Gudang Pusat Tiras" }
        ]
      };

      // Memasukkan data ke info pop-up sukses kustom
      this.infoSukses = {
        noDO: noDoBaru,
        nama: this.formInput.nama.trim(),
        total: totalHarga
      };

      // Memicu jendela pop-up sukses keluar ke layar
      this.modeSuksesAktif = true;
      this.nextDoCounter++;

      // Kosongkan form kembali
      this.formInput = { nim: '', nama: '', paketKode: '', ekspedisi: '', tanggalKirim: '' };
    },

    // Menutup pop-up sukses kustom dan otomatis mengalihkan layar langsung melacak DO baru tersebut
    tutupModalSukses() {
      this.modeSuksesAktif = false; // Menutup jendela pop-up sukses
      this.infoSukses = { noDO: '', nama: '', total: 0 }; // Mengosongkan data penampung pop-up
      
      // Catatan: Baris 'this.lacakDO();' sengaja dihapus agar halaman tidak otomatis melakukan pencarian ke atas
    }
  }
}).mount('#app');
