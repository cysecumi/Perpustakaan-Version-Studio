<?php
session_start();
include 'koneksi.php';
$tgl = date('Y-m-d');

if(isset($_SESSION['sesi'])){
?>
<!doctype html>
<html>
<head>
    <title>Sistem Informasi Perpustakaan</title>
    <!-- PENERAPAN CACHE BUSTING DI BAWAH INI -->
    <link rel="stylesheet" type="text/css" href="style.css?v=<?php echo time(); ?>">
</head>
<body>
    <div id="container">
        <div id="header">
            <div id="logo-perpustakaan-container">
                <img id="logo-perpustakaan" src="images/logo-perpustakaan3.png" width="100" border="0" style="border:0;text-decoration:none; outline: none">
            </div>
            <div id="nama-alamat-perpustakaan-container">
                <div class="nama-alamat-perpustakaan">
                    <h1>PERPUSTAKAAN UMUM</h1>
                    <h4>Jl.Tel aviv, Telp: (123)55555555</h4>
                </div>
            </div>
        </div>
        <div id="header2">
            <div id="nama-user">Hai <?php echo $_SESSION['sesi']; ?>!</div>
        </div>
        <div id="sidebar">
            <a href="index.php?p=beranda">Beranda</a>
            <p class="label-navigasi">Data Master</p>
            <ul>
                <li><a href="index.php?p=anggota">Data Anggota</a></li>
                <li><a href="index.php?p=buku">Data Buku</a></li>
            </ul>
            <p class="label-navigasi">Data Transaksi</p>
            <ul>
                <li><a href="index.php?p=transaksi-peminjaman">Transaksi Peminjaman</a></li>
                <li><a href="index.php?p=transaksi-pengembalian">Transaksi Pengembalian</a></li>
            </ul>
            <p class="label-navigasi" style="color: white;"><a href="index.php?p=transaksi-peminjaman" style="color: white;">Laporan Transaksi</a></p>
            <a href="logout.php">Logout</a>
        </div>
        <div id="content-container">
            <?php
            $pages_dir = 'pages';
            if(!empty($_GET['p'])){
                $pages = scandir($pages_dir, 0);
                unset($pages[0], $pages[1]);
                $p = $_GET['p'];
                if(in_array($p.'.php', $pages)){
                    include($pages_dir.'/'.$p.'.php');
                } else {
                    echo 'Halaman Tidak Ditemukan';
                }
            } else {
                include($pages_dir.'/beranda.php');
            }
            ?>
        </div>
        <div id="footer"><h3>Sistem Informasi Perpustakaan (sipus) | Praktikum</h3></div>
    </div>
</body>
</html>
<?php
} else {
    echo "<script>alert('Anda Harus Login Dahulu!'); window.location.href='login.php';</script>";
}
?>