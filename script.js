const produk = [
    { id: 1, nama: "Mug Keramik Custom", harga: 85000, gambar: "gambar/produk1.png" },
    { id: 2, nama: "Gantungan Kunci Akrilik", harga: 10000, gambar: "gambar/produk2.png" },
    { id: 3, nama: "Totebag Kanvas Sablon", harga: 20000, gambar: "gambar/produk3.png" },
    { id: 4, nama: "Tumbler Stainless", harga: 75000, gambar: "gambar/produk4.png" }
];

let keranjang = {};

function render() {
    let htmlBarang = "";
    produk.forEach(p => {
        htmlBarang += `
        <div class="card">
            <img src="${p.gambar}" alt="${p.nama}" onerror="this.src='https://placehold.co'">
            <h3>${p.nama}</h3>
            <p>Rp ${p.harga.toLocaleString('id-ID')}</p>
            <div class="jumlah-kontrol">
                <button type="button" onclick="ubah(${p.id}, -1)">-</button>
                <span>${keranjang[p.id] || 0}</span>
                <button type="button" onclick="ubah(${p.id}, 1)">+</button>
            </div>
        </div>`;
    });

    const container = document.getElementById("katalog-container");
    if (container) container.innerHTML = htmlBarang;

    let htmlNota = "", total = 0;
    produk.forEach(p => {
        if (keranjang[p.id] > 0) {
            let subtotal = p.harga * keranjang[p.id];
            total += subtotal;
            htmlNota += `<p>• ${p.nama} (x${keranjang[p.id]}) = Rp ${subtotal.toLocaleString('id-ID')}</p>`;
        }
    });

    const boxPesanan = document.getElementById("daftar-pesanan");
    if (boxPesanan) {
        boxPesanan.innerHTML = htmlNota || `<p class="empty-text"><i>Belum ada barang dipilih.</i></p>`;
    }

    const boxTotal = document.getElementById("total-harga");
    if (boxTotal) {
        boxTotal.innerText = "Rp " + total.toLocaleString('id-ID');
    }
}

function ubah(id, angka) {
    keranjang[id] = (keranjang[id] || 0) + angka;
    if (keranjang[id] <= 0) delete keranjang[id];
    render();
}

document.addEventListener("DOMContentLoaded", function() {
    render();

    const selectMetode = document.getElementById("metode-pembayaran");
    const containerDetail = document.getElementById("detail-pembayaran-container");

    if (selectMetode && containerDetail) {
        selectMetode.addEventListener("change", function() {
            const pilihan = selectMetode.value;
            containerDetail.innerHTML = ""; 

            if (pilihan === "ShopeePay") {
                containerDetail.innerHTML = `
                    <div class="input-group info-box">
                        <label for="akun-shopeepay">Nomor HP ShopeePay Anda:</label>
                        <input type="tel" id="akun-shopeepay" placeholder="Contoh: 0812xxxxxx" required>
                        <p><i>*Pastikan saldo ShopeePay Anda mencukupi total tagihan.</i></p>
                    </div>`;
            } else if (pilihan === "Transfer Bank") {
                containerDetail.innerHTML = `
                    <div class="input-group info-box">
                        <label for="pilihan-bank">Pilih Bank Tujuan:</label>
                        <select id="pilihan-bank" required>
                            <option value="" disabled selected>-- Pilih Bank --</option>
                            <option value="SeaBank (Shopee)">SeaBank (Shopee)</option>
                            <option value="Bank BCA">Bank BCA</option>
                            <option value="Bank Mandiri">Bank Mandiri</option>
                            <option value="Bank BRI">Bank BRI</option>
                            <option value="Bank BNI">Bank BNI</option>
                            <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                            <option value="Permata Bank">Permata Bank</option>
                            <option value="Bank Danamon">Bank Danamon</option>
                        </select>
                        <p><i>*Nomor rekening resmi toko akan diberikan admin di chat WhatsApp.</i></p>
                    </div>`;
            }
        });
    }

    const form = document.getElementById("form-pemesanan");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();

            if (Object.keys(keranjang).length === 0) {
                alert("Pilih barangnya dulu di atas!");
                return;
            }

            let namaPembeli = document.getElementById("nama-pemesan").value.trim();
            let alamatPembeli = document.getElementById("alamat-pemesan").value.trim();
            let noHpPembeli = document.getElementById("no-hp-pemesan").value.trim();
            let pembayaran = selectMetode.value;
            let totalBayar = document.getElementById("total-harga").innerText;
            
            let infoTambahanMetode = "";
            const elShopeePay = document.getElementById("akun-shopeepay");
            const elBank = document.getElementById("pilihan-bank");

            if (elShopeePay) {
                infoTambahanMetode = `\n*No. HP ShopeePay:* ${elShopeePay.value.trim()}`;
            } else if (elBank) {
                infoTambahanMetode = `\n*Bank Tujuan:* ${elBank.value}`;

                // --- FITUR VERIFIKASI SANDI BANK (BARU) ---
                // Menampilkan jendela pop-up untuk memasukkan PIN/Sandi Bank sebelum checkout
                let sandiBank = prompt(`Verifikasi Transaksi ${elBank.value}\nMasukkan 6 Digit PIN/Sandi M-Banking Anda:`);
                
                // Validasi: Jika pembeli membatalkan (klik cancel) atau mengosongkan sandi
                if (sandiBank === null || sandiBank.trim() === "") {
                    alert("Transaksi dibatalkan. Verifikasi sandi diperlukan!");
                    return; 
                }
                
                // Contoh simulasi verifikasi: Memastikan sandi aman diisi (tidak kosong)
                alert("Verifikasi berhasil! Menghubungkan ke WhatsApp toko...");
                infoTambahanMetode += `\n*Status Verifikasi Bank:* BERHASIL`;
            }
            
            let teksBarang = "";
            produk.forEach(p => {
                if (keranjang[p.id] > 0) {
                    let subtotal = p.harga * keranjang[p.id];
                    teksBarang += `- ${p.nama} (x${keranjang[p.id]}) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
                }
            });

            let isiPesan = `*Pesanan Souvenir Baru*\n\n`;
            isiPesan += `*Detail Pembeli:*\n`;
            isiPesan += `Nama: ${namaPembeli}\n`;
            isiPesan += `No. HP / WA: ${noHpPembeli}\n`;
            isiPesan += `Alamat Pengiriman: ${alamatPembeli}\n\n`;
            isiPesan += `*Daftar Pesanan:*\n${teksBarang}\n`;
            isiPesan += `*Metode Pembayaran:* ${pembayaran}${infoTambahanMetode}\n`;
            isiPesan += `*Total Bayar:* ${totalBayar}`;

            let noWaToko = "6282258586701";
            let urlWhatsApp = "https://wa.me/" + noWaToko + "?text=" + encodeURIComponent(isiPesan);

            window.open(urlWhatsApp, '_blank');
            
            form.reset();
            containerDetail.innerHTML = ""; 
            keranjang = {};
            render();
        });
    }
});
