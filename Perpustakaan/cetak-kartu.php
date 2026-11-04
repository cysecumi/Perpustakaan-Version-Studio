<?php
include 'koneksi.php';
$id_anggota = $_GET['id'];
$q_tampil_anggota = mysqli_query($db, "SELECT * FROM tbanggota WHERE idanggota='$id_anggota'");
$r_tampil_anggota = mysqli_fetch_array($q_tampil_anggota);

if(empty($r_tampil_anggota['foto']) or ($r_tampil_anggota['foto'] == '-')){
    $foto = "admin-no-photo.jpg";
} else {
    $foto = $r_tampil_anggota['foto'];
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Cetak Kartu Anggota</title>
    <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; }
        .kartu {
            width: 400px;
            border: 2px solid #334155;
            border-radius: 10px;
            padding: 20px;
            margin: 0 auto;
        }
        .header-kartu { text-align: center; border-bottom: 2px solid #334155; margin-bottom: 15px; padding-bottom: 10px; }
        .header-kartu h3 { margin: 0; font-size: 18px; color: #0f172a; }
        .header-kartu p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; }
        .konten-kartu { display: flex; align-items: center; }
        .foto-kartu { width: 90px; height: 110px; object-fit: cover; border: 1px solid #cbd5e1; border-radius: 5px; margin-right: 20px; }
        .detail-kartu table { font-size: 14px; font-weight: 500; color: #334155; }
        .detail-kartu table td { padding: 4px 0; }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer;">Cetak Kartu Sekarang</button>
    </div>

    <div class="kartu">
        <div class="header-kartu">
            <h3>KARTU ANGGOTA PERPUSTAKAAN</h3>
            <p>Jl. Tel aviv, Telp: (123)55555555</p>
        </div>
        <div class="konten-kartu">
            <img src="images/<?php echo $foto; ?>" class="foto-kartu">
            <div class="detail-kartu">
                <table>
                    <tr><td width="80">ID</td><td width="10">:</td><td><?php echo $r_tampil_anggota['idanggota']; ?></td></tr>
                    <tr><td>Nama</td><td>:</td><td><?php echo $r_tampil_anggota['nama']; ?></td></tr>
                    <tr><td>J. Kelamin</td><td>:</td><td><?php echo $r_tampil_anggota['jeniskelamin']; ?></td></tr>
                    <tr><td>Alamat</td><td>:</td><td><?php echo $r_tampil_anggota['alamat']; ?></td></tr>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Membuka dialog print secara otomatis saat halaman dimuat
        window.onload = function() { window.print(); }
    </script>
</body>
</html>