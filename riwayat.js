/* ================= RENDER RIWAYAT ================= */ 

document.addEventListener("DOMContentLoaded", function(){
  renderRiwayat();
});

/* ================= UTIL ================= */
function rupiah(angka){
  return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");
}

function getRiwayat(){
  // Ambil riwayat dari localStorage
  return JSON.parse(localStorage.getItem("riwayat")) || [];
}

/* ================= RENDER RIWAYAT ================= */
function renderRiwayat(filter = null){
  const container = document.getElementById("dataRiwayat");
  if(!container) return;

  let data = getRiwayat();
  container.innerHTML = "";

  // Filter tanggal jika ada
  if(filter){
    data = data.filter(trx => trx.tanggal === filter);
  }

  if(data.length === 0){
    container.innerHTML = "<p>Tidak ada transaksi</p>";
    return;
  }

  // ===== HITUNG TOTAL =====
  let tanggalHitung;
  if(filter){
    tanggalHitung = filter;
  }else{
    let today = new Date();
    tanggalHitung =
      today.getFullYear() + "-" +
      String(today.getMonth()+1).padStart(2,'0') + "-" +
      String(today.getDate()).padStart(2,'0');
  }

  let totalHariIni = 0;
  data.forEach(trx=>{
    if(trx.tanggal === tanggalHitung){
      totalHariIni += parseInt(trx.total);
    }
  });

  container.innerHTML += `
    <div style="background:#111;color:#fff;padding:15px;border-radius:10px;margin-bottom:20px;">
      <strong>Total Pendapatan:</strong> ${rupiah(totalHariIni)}
    </div>
  `;

  // ===== DETAIL TRANSAKSI =====
  data.slice().reverse().forEach(trx=>{
    let itemsHTML="";

    if(typeof trx.items === "string"){
      trx.items = JSON.parse(trx.items);
    }

    trx.items.forEach(item=>{
      itemsHTML += `
        <div style="display:flex;justify-content:space-between;margin:6px 0;">
          <span>1x ${item.nama}</span>
          <span>${rupiah(parseInt(item.harga))}</span>
        </div>
      `;
    });

    // PEMBAYARAN
    let pembayaranHTML = "";
    if(trx.metode === "cash"){
      pembayaranHTML = `
        <div style="display:flex;justify-content:space-between;margin-top:6px;">
          <span>Uang Bayar</span>
          <span>${rupiah(parseInt(trx.uang))}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Kembalian</span>
          <span>${rupiah(parseInt(trx.kembalian))}</span>
        </div>
      `;
    }else if(trx.metode === "edc"){
      pembayaranHTML = `
        <div style="display:flex;justify-content:space-between;margin-top:6px;">
          <span>Metode Pembayaran</span>
          <span>EDC (${trx.edc || "-"})</span>
        </div>
      `;
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
          <span>Total Tagihan</span>
          <span>${rupiah(parseInt(trx.total))}</span>
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