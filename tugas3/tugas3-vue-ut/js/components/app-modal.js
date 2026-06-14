Vue.component('app-modal', {
    // Template terintegrasi backtick literals murni (Tanpa request file XHR eksternal pengganggu thread)
    template: `<div class="system-modal-container">
    <!-- 1. POPUP PEMBERITAHUAN UTAMA (Mode Alert) -->
    <div class="modal-backdrop-system popup-alert-class" v-if="visible && mode === 'alert'" @click.self="handleOutsideClick" tabindex="0" ref="alertRef" @keyup.esc="handleEsc" @keyup.enter="handleEnter">
        <div class="popup-box-core text-center-layout animate-scale">
            <div class="popup-icon-center"><i :class="iconClass"></i></div>
            <h3 class="popup-title-center">{{ title }}</h3>
            <div class="popup-body-center" v-html="message"></div>
            <div class="popup-footer-center">
                <button type="button" class="btn-system btn-system-ok" @click="confirm">OK</button>
            </div>
        </div>
    </div>

    <!-- 2. POPUP KONFIRMASI PENGHAPUSAN DATA (Mode confirmDelete) -->
    <div class="modal-backdrop-system popup-confirm-delete-class" v-if="visible && mode === 'confirmDelete'" @click.self="handleOutsideClick" tabindex="0" ref="deleteRef" @keyup.esc="handleEsc" @keyup.enter="handleEnter">
        <div class="popup-box-core text-center-layout animate-scale">
            <div class="popup-icon-center text-danger-sitta"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h3 class="popup-title-center">{{ title }}</h3>
            <div class="popup-body-center" v-html="message"></div>
            <div class="popup-footer-center">
                <button type="button" class="btn-system btn-system-secondary" @click="cancel">Batal</button>
                <button type="button" class="btn-system btn-system-danger" @click="confirm">Ya, Hapus</button>
            </div>
        </div>
    </div>
</div>`,
    data: function () {
        return {
            visible: false,
            mode: 'alert', 
            title: 'Notifikasi',
            message: '',
            iconClass: 'fa-solid fa-circle-info',
            resolve: null,
            reject: null
        };
    },
    methods: {
        // Penanganan Popup Alert (PERBAIKAN FOKUS: Otomatis mengunci fokus penuh ke elemen backdrop modal)
        showAlert: function (title, message, icon) {
            this.mode = 'alert';
            this.title = title || 'Pemberitahuan';
            this.message = message || '';
            this.iconClass = icon || 'fa-solid fa-circle-check';
            this.visible = true;
            
            this.$nextTick(() => {
                if (this.$refs.alertRef) {
                    this.$refs.alertRef.focus();
                }
            });

            return new Promise((resolve) => {
                this.resolve = resolve;
            });
        },
        // Penanganan Popup Konfirmasi Hapus (PERBAIKAN FOKUS: Otomatis mengunci fokus penuh ke elemen backdrop modal)
        showDeleteConfirm: function (title, message) {
            this.mode = 'confirmDelete';
            this.title = title || 'Konfirmasi Hapus';
            this.message = message || 'Apakah Anda yakin ingin menghapus data ini?';
            this.visible = true;

            this.$nextTick(() => {
                if (this.$refs.deleteRef) {
                    this.$refs.deleteRef.focus();
                }
            });

            return new Promise((resolve) => {
                this.resolve = resolve;
            });
        },
        confirm: function () {
            this.visible = false;
            if (this.resolve) this.resolve(true);
        },
        cancel: function () {
            this.visible = false;
            if (this.resolve) this.resolve(false);
        },
        handleEnter: function () {
            this.confirm();
        },
        handleEsc: function () {
            this.cancel();
        },
        handleOutsideClick: function () {
            this.cancel();
        }
    }
});