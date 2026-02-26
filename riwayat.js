/* ================= GLOBAL ================= */
document.addEventListener("DOMContentLoaded", function(){
  // Set default tanggal hari ini
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("filterTanggalRiwayat").value = today;
  renderRiwayat();
});

/* ================= UTIL ================= */
function getRiwayat() {
  return JSON.parse(localStorage.getItem("riwayat")) || [];
}

function rupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

/* ================= RENDER RIWAYAT ================= */
function renderRiwayat() {
  const tanggal = document.getElementById("filterTanggalRiwayat").value;
  const allData = getRiwayat();
  const data = allData.filter(trx => trx.tanggal === tanggal);
  const container = document.getElementById("dataRiwayat");
  const totalDiv = document.getElementById("totalPendapatanHariIni");

  // Total pendapatan hari ini
  const totalHariIni = data.reduce((sum, t) => sum + Number(t.total), 0);
  totalDiv.innerHTML = `<strong>Total Pendapatan:</strong> ${rupiah(totalHariIni)}`;

  if(data.length === 0){
    container.innerHTML = "<p>Tidak ada transaksi di tanggal ini</p>";
    return;
  }

  container.innerHTML = "";

  data.slice().reverse().forEach(trx => {
    let itemsHTML = "";

    if(typeof trx.items === "string"){
      try { trx.items = JSON.parse(trx.items); } catch(e){ trx.items = []; }
    }

    trx.items.forEach(item => {
      itemsHTML += `
        <div style="display:flex;justify-content:space-between;margin:6px 0;">
          <span>1x ${item.nama}</span>
          <span>${rupiah(Number(item.harga))}</span>
        </div>
      `;
    });

    // PEMBAYARAN
    let pembayaranHTML = "";
    if(trx.metode === "cash"){
      pembayaranHTML = `
        <div style="display:flex;justify-content:space-between;margin-top:6px;">
          <span>Uang Bayar</span><span>${rupiah(Number(trx.uang))}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Kembalian</span><span>${rupiah(Number(trx.kembalian))}</span>
        </div>
      `;
    } else if(trx.metode === "edc"){
      pembayaranHTML = `
        <div style="display:flex;justify-content:space-between;margin-top:6px;">
          <span>Metode Pembayaran</span><span>EDC (${trx.edc || "-"})</span>
        </div>
      `;
    } else if(trx.metode === "qris"){
      pembayaranHTML = `<div style="margin-top:6px;font-weight:bold;">QRIS</div>`;
    }

    container.innerHTML += `
      <div style="background:#fff;padding:18px;margin:20px 0;border-radius:12px;box-shadow:0 5px 12px rgba(0,0,0,0.1);">
        <h3 style="margin:0 0 5px 0;">Cimol Nona Judes</h3>
        <p style="margin:0 0 10px 0;color:gray;font-size:13px;">
          ${trx.tanggal} (${trx.waktu})
        </p>
        <hr>
        ${itemsHTML}
        <hr>
        <div style="display:flex;justify-content:space-between;font-weight:bold;margin-top:6px;">
          <span>Total Tagihan</span><span>${rupiah(Number(trx.total))}</span>
        </div>
        ${pembayaranHTML}
        <hr>
        <div style="font-size:13px;margin-top:8px;">
          <div><strong>Pelanggan:</strong> ${trx.pelanggan}</div>
          <div><strong>Kasir:</strong> ${trx.pelayan}</div>
          <div><strong>Metode:</strong> ${trx.metode.toUpperCase()}</div>
        </div>
      </div>
    `;
  });
}