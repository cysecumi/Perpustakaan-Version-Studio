<?php
include '../koneksi.php';
$id_anggota = $_POST['id_anggota'];
$nama = $_POST['nama'];
// Memastikan tidak error jika jenis kelamin lupa diklik
$jenis_kelamin = isset($_POST['jenis_kelamin']) ? $_POST['jenis_kelamin'] : '';
$alamat = $_POST['alamat'];
$status = "Tidak Meminjam";

if(isset($_POST['simpan'])){
    $nama_file = $_FILES['foto']['name'];
    if(!empty($nama_file)){
        $lokasi_file = $_FILES['foto']['tmp_name'];
        $tipe_file = pathinfo($nama_file, PATHINFO_EXTENSION);
        $file_foto = $id_anggota.".".$tipe_file;
        
        $folder = "../images/".$file_foto;
        move_uploaded_file($lokasi_file, $folder);
    }
    else {
        $file_foto = "-";
    }
    
    $sql = "INSERT INTO tbanggota VALUES('$id_anggota', '$nama', '$jenis_kelamin', '$alamat', '$status', '$file_foto')";
    
    // REVISI: Tambahan penangkap error
    mysqli_query($db, $sql) or die("GAGAL MENYIMPAN! Error Database: " . mysqli_error($db));
    
    header("location:../index.php?p=anggota");
}
?>