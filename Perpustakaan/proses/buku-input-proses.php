<?php
include '../koneksi.php';
$idbuku = $_POST['idbuku'];
$judulbuku = $_POST['judulbuku'];
$kategori = $_POST['kategori'];
$pengarang = $_POST['pengarang'];
$penerbit = $_POST['penerbit'];
$status = "Tersedia"; 

if(isset($_POST['simpan'])){
    $nama_file = $_FILES['foto']['name'];
    if(!empty($nama_file)){
        $lokasi_file = $_FILES['foto']['tmp_name'];
        $tipe_file = pathinfo($nama_file, PATHINFO_EXTENSION);
        $file_foto = $idbuku.".".$tipe_file;
        
        $folder = "../images/".$file_foto;
        move_uploaded_file($lokasi_file, $folder);
    }
    else {
        $file_foto = "-";
    }
    
    // REVISI: Tambahan penangkap error
    mysqli_query($db, "INSERT INTO tbbuku VALUES('$idbuku', '$judulbuku', '$kategori', '$pengarang', '$penerbit', '$status', '$file_foto')") or die("GAGAL MENYIMPAN BUKU! Error Database: " . mysqli_error($db));
    
    header("location:../index.php?p=buku");
}
?>