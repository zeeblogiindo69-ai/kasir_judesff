/* ================= GLOBAL ================= */
let chartHarian = null;
let chartProfit = null;

/* ================= NAVIGASI ================= */
function showLaporan(menu) {
  if (menu === "penjualan") renderPenjualan();
  if (menu === "profit") renderProfit();
  if (menu === "statistik") renderStatistik();
}

/* ================= UTIL ================= */
function getRiwayat() {
  return JSON.parse(localStorage.getItem("riwayat")) || [];
}

function rupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

/* ================= PENJUALAN ================= */
function renderPenjualan() {
  const container = document.getElementById("laporanContent");
  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
    <h3>Laporan Penjualan</h3>
    <input type="date" id="filterTanggalPenjualan" value="${today}" onchange="renderTabelPenjualan()">
    <div id="tabelPenjualanContainer"></div>
  `;
  renderTabelPenjualan();
}

function renderTabelPenjualan() {
  const tanggal = document.getElementById("filterTanggalPenjualan").value;
  const allData = getRiwayat();
  const data = allData.filter(trx => trx.tanggal === tanggal);
  const container = document.getElementById("tabelPenjualanContainer");

  if (data.length === 0) {
    container.innerHTML = "<p>Tidak ada transaksi di tanggal ini</p>";
    return;
  }

  let hasil = {};
  data.forEach(trx => {
    let metodeKey = trx.metode;
    if (trx.metode === "edc") metodeKey = "EDC - " + (trx.edc || "LAINNYA");
    if (!hasil[metodeKey]) hasil[metodeKey] = {};

    trx.items.forEach(item => {
      if (!hasil[metodeKey][item.nama]) hasil[metodeKey][item.nama] = 0;
      hasil[metodeKey][item.nama]++;
    });
  });

  let html = "";
  Object.keys(hasil).forEach(metode => {
    html += `<h4 style="margin-top:30px;">Metode: ${metode.toUpperCase()}</h4>
      <table class="stat-table">
        <thead><tr><th>Nama Menu</th><th>Jumlah Terjual</th></tr></thead>
        <tbody>`;
    Object.keys(hasil[metode]).forEach(nama => {
      html += `<tr><td>${nama}</td><td>${hasil[metode][nama]}</td></tr>`;
    });
    html += `</tbody></table>`;
  });

  container.innerHTML = html;
}

/* ================= PROFIT ================= */
function renderProfit() {
  const container = document.getElementById("laporanContent");
  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
    <h3>Profit Harian</h3>
    <input type="date" id="filterTanggalProfit" value="${today}" onchange="hitungProfit()">
    <div class="card"><h4>Total Pendapatan</h4><h2 id="pendapatanHarian">Rp 0</h2></div>
    <div class="card"><h4>Pengeluaran Tetap (Lapak)</h4><h2 id="lapakHarian">Rp 0</h2></div>
    <div class="card">
      <h4>Pengeluaran Lainnya</h4>
      <label>Operasional:</label><input type="number" id="inputOperasional" oninput="hitungProfit()" placeholder="0">
      <label style="margin-top:10px;">Bahan Baku:</label><input type="number" id="inputBahanBaku" oninput="hitungProfit()" placeholder="0">
    </div>
    <div class="card"><h3>Keuntungan Bersih</h3><h2 id="profitBersih">Rp 0</h2></div>
    <canvas id="grafikProfit"></canvas>
  `;
  hitungProfit();
}

function hitungProfit() {
  const tanggal = document.getElementById("filterTanggalProfit").value;
  const transaksi = getRiwayat().filter(t => t.tanggal === tanggal);

  let pendapatan = transaksi.reduce((sum, t) => sum + Number(t.total), 0);
  const lapakHarian = 550000 / 30;
  const operasional = Number(document.getElementById("inputOperasional").value) || 0;
  const bahanBaku = Number(document.getElementById("inputBahanBaku").value) || 0;
  const totalPengeluaran = lapakHarian + operasional + bahanBaku;
  const profitBersih = pendapatan - totalPengeluaran;

  document.getElementById("pendapatanHarian").innerText = rupiah(pendapatan);
  document.getElementById("lapakHarian").innerText = rupiah(lapakHarian);
  document.getElementById("profitBersih").innerText = rupiah(profitBersih);

  const ctx = document.getElementById("grafikProfit").getContext("2d");
  if (chartProfit) chartProfit.destroy();
  chartProfit = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pendapatan", "Total Pengeluaran", "Profit Bersih"],
      datasets: [{ label: "Jumlah (Rp)", data: [pendapatan, totalPengeluaran, profitBersih] }]
    }
  });
}

/* ================= STATISTIK ================= */
function renderStatistik() {
  const container = document.getElementById("laporanContent");
  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
    <h3>Statistik Harian</h3>
    <input type="date" id="filterTanggal" value="${today}" onchange="renderGrafikHarian(); renderTabelHarian();">
    <div class="card"><h4>Total Pendapatan</h4><h2 id="totalHarian">Rp 0</h2></div>
    <canvas id="grafikHarian"></canvas>
    <table class="stat-table">
      <thead><tr><th>Jam</th><th>Jumlah Pembeli</th></tr></thead>
      <tbody id="tabelHarianBody"></tbody>
    </table>
  `;

  renderGrafikHarian();
  renderTabelHarian();
}

function renderGrafikHarian() {
  const tanggal = document.getElementById("filterTanggal").value;
  const transaksi = getRiwayat().filter(t => t.tanggal === tanggal);

  let total = 0, jamMap = {};
  transaksi.forEach(t => {
    total += Number(t.total);
    const jam = t.waktu.substring(0, 2) + ":00";
    if (!jamMap[jam]) jamMap[jam] = 0;
    jamMap[jam]++;
  });

  document.getElementById("totalHarian").innerText = rupiah(total);

  const labels = Object.keys(jamMap);
  const values = Object.values(jamMap);
  const ctx = document.getElementById("grafikHarian").getContext("2d");

  if (chartHarian) chartHarian.destroy();
  chartHarian = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: "Jumlah Pembeli", data: values }] }
  });
}

function renderTabelHarian() {
  const tanggal = document.getElementById("filterTanggal").value;
  const transaksi = getRiwayat().filter(t => t.tanggal === tanggal);

  let jamMap = {};
  transaksi.forEach(t => {
    const jam = t.waktu.substring(0, 2) + ":00";
    if (!jamMap[jam]) jamMap[jam] = 0;
    jamMap[jam]++;
  });

  const tbody = document.getElementById("tabelHarianBody");
  tbody.innerHTML = "";
  Object.keys(jamMap).sort().forEach(jam => {
    tbody.innerHTML += `<tr><td>${jam}</td><td>${jamMap[jam]}</td></tr>`;
  });
}