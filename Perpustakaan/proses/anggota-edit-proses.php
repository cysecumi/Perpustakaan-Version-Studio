<?php
include '../koneksi.php';
$id_anggota = $_POST['id_anggota'];
$nama = $_POST['nama'];
$alamat = $_POST['alamat'];
// Memastikan tidak error jika jenis kelamin kosong
$jenis_kelamin = isset($_POST['jenis_kelamin']) ? $_POST['jenis_kelamin'] : '';
$foto_awal = $_POST['foto_awal'];

if (isset($_POST['simpan'])){
    $nama_file = $_FILES['foto']['name'];
    
    if(!empty($nama_file)){
        $lokasi_file = $_FILES['foto']['tmp_name'];
        $tipe_file = pathinfo($nama_file, PATHINFO_EXTENSION);
        $file_foto = $id_anggota.".".$tipe_file;
        
        $folder = "../images/".$file_foto;
        move_uploaded_file($lokasi_file, $folder);
    }
    else {
        $file_foto = $foto_awal;
    }
    
    // REVISI: Tambahan penangkap error
    mysqli_query($db, "UPDATE tbanggota SET nama='$nama', jeniskelamin='$jenis_kelamin', alamat='$alamat', foto='$file_foto' WHERE idanggota='$id_anggota'") or die("GAGAL MENGUBAH! Error Database: " . mysqli_error($db));
    
    header("location:../index.php?p=anggota");
}
?>