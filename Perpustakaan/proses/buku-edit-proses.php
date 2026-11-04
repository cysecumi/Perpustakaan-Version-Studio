<?php
include '../koneksi.php';
$idbuku = $_POST['idbuku'];
$judulbuku = $_POST['judulbuku'];
$kategori = $_POST['kategori'];
$pengarang = $_POST['pengarang'];
$penerbit = $_POST['penerbit'];
$status = $_POST['status'];
$foto_awal = $_POST['foto_awal'];

if (isset($_POST['simpan'])){
    $nama_file = $_FILES['foto']['name'];
    
    if(!empty($nama_file)){
        $lokasi_file = $_FILES['foto']['tmp_name'];
        $tipe_file = pathinfo($nama_file, PATHINFO_EXTENSION);
        $file_foto = $idbuku.".".$tipe_file;
        
        $folder = "../images/".$file_foto;
        move_uploaded_file($lokasi_file, $folder);
    }
    else {
        $file_foto = $foto_awal;
    }
    
    // REVISI: Tambahan penangkap error
    mysqli_query($db, "UPDATE tbbuku SET judulbuku='$judulbuku', kategori='$kategori', pengarang='$pengarang', penerbit='$penerbit', status='$status', foto='$file_foto' WHERE idbuku='$idbuku'") or die("GAGAL MENGEDIT BUKU! Error Database: " . mysqli_error($db));
    
    header("location:../index.php?p=buku");
}
?>