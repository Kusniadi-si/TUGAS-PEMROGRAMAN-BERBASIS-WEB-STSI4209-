window.ApiService = {
    // Fungsi murni mengambil data dari berkas eksternal dataBahanAjar.json via HTTP Fetch Request (Kriteria 1.1 & 1.2)
    fetchData: function () {
        return fetch('data/dataBahanAjar.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal memuat berkas database eksternal dataBahanAjar.json');
                }
                return response.json();
            })
            .catch(error => {
                console.error('ApiService Fetch Error:', error);
                throw error;
            });
    }
};