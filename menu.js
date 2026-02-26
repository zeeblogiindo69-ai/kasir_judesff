/* ================= DATA ================= */
let cart = [];
let indexStockAktif = null;
let indexResetAktif = null;
let indexHapusAktif = null;

document.addEventListener("DOMContentLoaded", function () {
  renderMenu();
  renderCart();
});

/* ================= FIX WAKTU LOKAL ================= */
function getTanggalLokal() {
  const now = new Date();
  const tahun = now.getFullYear();
  const bulan = String(now.getMonth() + 1).padStart(2, "0");
  const hari = String(now.getDate()).padStart(2, "0");
  return tahun + "-" + bulan + "-" + hari;
}

function getWaktuLokal() {
  const now = new Date();
  const jam = String(now.getHours()).padStart(2, "0");
  const menit = String(now.getMinutes()).padStart(2, "0");
  const detik = String(now.getSeconds()).padStart(2, "0");
  return jam + ":" + menit + ":" + detik;
}

/* ================= MODAL TAMBAH MENU ================= */
function openModal() {
  let modal = document.getElementById("modal");
  if (modal) modal.style.display = "flex";
}

function closeModal() {
  let modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}

/* ================= NOTIF FRAME ================= */
function showNotif(pesan) {
  let frame = document.getElementById("notifFrame");
  let text = document.getElementById("notifText");

  if (!frame || !text) return;

  text.innerText = pesan;
  frame.style.display = "flex";

  setTimeout(() => {
    frame.style.display = "none";
  }, 1500);
}

/* ================= UTIL ================= */
function rupiah(angka) {
  return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatRupiah(input) {
  let angka = input.value.replace(/\D/g, "");
  input.value = angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getMenu() {
  return JSON.parse(localStorage.getItem("menu")) || [];
}

function saveMenu(data) {
  localStorage.setItem("menu", JSON.stringify(data));
}

function getRiwayat() {
  return JSON.parse(localStorage.getItem("riwayat")) || [];
}

function saveRiwayat(data) {
  localStorage.setItem("riwayat", JSON.stringify(data));
}

/* ================= MENU ================= */
function renderMenu() {
  let list = document.getElementById("menuList");
  if (!list) return;

  let menu = getMenu();
  list.innerHTML = "";

  menu.forEach((m, i) => {
    list.innerHTML += `
      <div class="card" onclick="tambahCart(${i})">
        <h4>${m.nama}</h4>
        <p>${rupiah(m.harga)}</p>
        <p>Stok: ${m.stok} porsi</p>

        <button onclick="event.stopPropagation();bukaModalStock(${i})">Edit Stok</button>
        <button onclick="event.stopPropagation();resetStok(${i})">Reset</button>
        <button onclick="event.stopPropagation();hapusMenu(${i})">Hapus</button>
      </div>
    `;
  });
}

/* ================= SIMPAN MENU ================= */
function simpanMenu() {
  let nama = document.getElementById("nama").value.trim();
  let hargaText = document.getElementById("harga").value;
  let stokKg = parseFloat(document.getElementById("stok").value);

  if (!nama || !hargaText || !stokKg) {
    showNotif("Lengkapi data");
    return;
  }

  let harga = parseInt(hargaText.replace(/\./g, ""));
  let stok = Math.round(stokKg * 10);

  let menu = getMenu();
  menu.push({ nama, harga, stok });

  saveMenu(menu);
  renderMenu();
  closeModal();

  document.getElementById("nama").value = "";
  document.getElementById("harga").value = "";
  document.getElementById("stok").value = "";
}

/* ================= HAPUS MENU ================= */
function hapusMenu(i) {
  indexHapusAktif = i;
  document.getElementById("hapusFrame").style.display = "flex";
}

function konfirmasiHapus() {
  if (indexHapusAktif === null) return;

  let menu = getMenu();
  menu.splice(indexHapusAktif, 1);

  saveMenu(menu);
  renderMenu();

  document.getElementById("hapusFrame").style.display = "none";
  indexHapusAktif = null;

  showNotif("Menu berhasil dihapus");
}

function batalHapus() {
  document.getElementById("hapusFrame").style.display = "none";
  indexHapusAktif = null;
}

/* ================= EDIT / TAMBAH STOK ================= */
function bukaModalStock(index) {
  indexStockAktif = index;
  document.getElementById("modalStock").style.display = "flex";
}

function tutupModalStock() {
  document.getElementById("modalStock").style.display = "none";
}

function simpanTambahStok() {
  let kg = parseFloat(document.getElementById("tambahStokInput").value);

  if (isNaN(kg) || kg <= 0) {
    showNotif("Masukkan jumlah KG yang valid");
    return;
  }

  if (kg > 5) {
    showNotif("Maksimal 5 KG sekali input");
    return;
  }

  let menu = getMenu();
  let tambahanPorsi = Math.round(kg * 10);

  menu[indexStockAktif].stok += tambahanPorsi;

  saveMenu(menu);
  renderMenu();
  tutupModalStock();

  document.getElementById("tambahStokInput").value = "";
}

/* ================= RESET STOK ================= */
function resetStok(i) {
  indexResetAktif = i;
  document.getElementById("resetFrame").style.display = "flex";
}

function konfirmasiReset() {
  if (indexResetAktif === null) return;

  let menu = getMenu();
  menu[indexResetAktif].stok = 0;

  saveMenu(menu);
  renderMenu();

  document.getElementById("resetFrame").style.display = "none";
  indexResetAktif = null;

  showNotif("Stok berhasil direset");
}

function batalReset() {
  document.getElementById("resetFrame").style.display = "none";
  indexResetAktif = null;
}

/* ================= CART ================= */
function tambahCart(i) {
  let menu = getMenu();

  if (menu[i].stok <= 0) {
    showNotif("Stok habis");
    return;
  }

  cart.push({
    nama: menu[i].nama,
    harga: menu[i].harga,
    indexMenu: i,
  });

  menu[i].stok--;
  saveMenu(menu);

  renderMenu();
  renderCart();
}

function hapusItemCart(index) {
  let item = cart[index];
  let menu = getMenu();

  menu[item.indexMenu].stok++;
  saveMenu(menu);

  cart.splice(index, 1);

  renderMenu();
  renderCart();
}

function renderCart() {
  let c = document.getElementById("cart");
  if (!c) return;

  c.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.harga;
    c.innerHTML += `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span>${item.nama} - ${rupiah(item.harga)}</span>
        <button style="width:auto;padding:4px 8px;background:red;"
          onclick="hapusItemCart(${i})">X</button>
      </div>
    `;
  });

  document.getElementById("total").innerText = rupiah(total);
}

/* ================= PEMBAYARAN ================= */
function metodeChange() {
  let metode = document.getElementById("metode").value;
  let div = document.getElementById("pembayaran");
  if (!div) return;

  if (metode == "cash") {
    div.innerHTML = `
      <input id="uang" placeholder="Nominal Uang" onkeyup="hitungKembalian(this)">
      <div id="kembalian" style="margin-top:5px;font-weight:bold;"></div>
    `;
  } else if (metode == "edc") {
    div.innerHTML = `
      <select id="jenisEdc">
        <option value="ShopeeFood">ShopeeFood</option>
        <option value="GrabFood">GrabFood</option>
        <option value="GoFood">GoFood</option>
      </select>
    `;
  } else if (metode == "qris") {
    div.innerHTML = `
      <p style="font-weight:bold;margin-top:5px;">Scan QRIS untuk membayar</p>
    `;
  } else {
    div.innerHTML = "";
  }
}

/* ================= HITUNG KEMBALIAN ================= */
function hitungKembalian(input) {
  formatRupiah(input);

  let total = cart.reduce((a, b) => a + b.harga, 0);
  let uang = parseInt(input.value.replace(/\./g, ""));
  let div = document.getElementById("kembalian");

  if (!uang) {
    div.innerHTML = "";
    return;
  }

  if (uang < total) {
    div.innerHTML = "Uang kurang";
    div.style.color = "red";
  } else {
    div.innerHTML = "Kembalian: " + rupiah(uang - total);
    div.style.color = "green";
  }
}

/* ================= CHECKOUT ================= */
function checkout() {
  if (cart.length == 0) {
    showNotif("Keranjang kosong");
    return;
  }

  let pelanggan = document.getElementById("pelanggan").value.trim();
  let pelayan = document.getElementById("pelayan").value.trim();
  let metode = document.getElementById("metode").value;

  if (!pelanggan || !pelayan) {
    showNotif("Isi nama pelanggan & pelayan");
    return;
  }

  if (!metode) {
    showNotif("Pilih metode pembayaran");
    return;
  }

  let total = cart.reduce((a, b) => a + b.harga, 0);

  let uang = 0;
  let kembalian = 0;
  let edc = "";

  if (metode == "cash") {
    let uangText = document.getElementById("uang").value;
    uang = parseInt(uangText.replace(/\./g, ""));

    if (!uang || uang < total) {
      showNotif("Uang tidak cukup");
      return;
    }

    kembalian = uang - total;
  }

  if (metode == "edc") {
    edc = document.getElementById("jenisEdc")
      ? document.getElementById("jenisEdc").value
      : "";
  }

  let riwayat = getRiwayat();

  let tanggal = getTanggalLokal();
  let waktu = getWaktuLokal();

  riwayat.push({
    pelanggan,
    pelayan,
    items: [...cart],
    total,
    metode,
    uang,
    kembalian,
    edc,
    tanggal,
    waktu,
  });

  saveRiwayat(riwayat);

  cart = [];
  renderCart();

  document.getElementById("pelanggan").value = "";
  document.getElementById("pelayan").value = "";
  document.getElementById("metode").value = "";
  document.getElementById("pembayaran").innerHTML = "";

  showNotif("Transaksi berhasil");
}