<?php
$id_buku = $_GET['id'];
$q_tampil_buku = mysqli_query($db, "SELECT * FROM tbbuku WHERE idbuku='$id_buku'");
$r_tampil_buku = mysqli_fetch_array($q_tampil_buku);

if(empty($r_tampil_buku['foto']) or ($r_tampil_buku['foto']=='-')){
    $foto = "admin-no-photo.jpg";
} else {
    $foto = $r_tampil_buku['foto'];
}
?>
<div id="label-page"> <h3>Edit Data Buku</h3></div>
<div id="content">
    <form action="proses/buku-edit-proses.php" method="post" enctype="multipart/form-data">
        <table id="tabel-input">
            <tr>
                <td class="label-formulir">Cover Buku</td>
                <td class="isian-formulir">
                    <img src="images/<?php echo $foto; ?>" width="70px" height="90px"><br><br>
                    <input type="file" name="foto" class="isian-formulir isian-formulir-border">
                    <input type="hidden" name="foto_awal" value="<?php echo $r_tampil_buku['foto']; ?>">
                </td>
            </tr>
            <tr>
                <td class="label-formulir">ID Buku</td>
                <td class="isian-formulir"><input type="text" name="idbuku" value="<?php echo $r_tampil_buku['idbuku']; ?>" readonly="readonly" class="isian-formulir isian-formulir-border" style="background-color: #e9ecef;"></td>
            </tr>
            <tr>
                <td class="label-formulir">Judul Buku</td>
                <td class="isian-formulir"><input type="text" name="judulbuku" value="<?php echo $r_tampil_buku['judulbuku']; ?>" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir">Kategori</td>
                <td class="isian-formulir">
                    <select name="kategori" class="isian-formulir isian-formulir-border">
                        <option value="Ilmu Komputer" <?php if($r_tampil_buku['kategori']=="Ilmu Komputer") echo "selected"; ?>>Ilmu Komputer</option>
                        <option value="Fiksi" <?php if($r_tampil_buku['kategori']=="Fiksi") echo "selected"; ?>>Fiksi</option>
                        <option value="Sastra" <?php if($r_tampil_buku['kategori']=="Sastra") echo "selected"; ?>>Sastra</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td class="label-formulir">Pengarang</td>
                <td class="isian-formulir"><input type="text" name="pengarang" value="<?php echo $r_tampil_buku['pengarang']; ?>" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir">Penerbit</td>
                <td class="isian-formulir"><input type="text" name="penerbit" value="<?php echo $r_tampil_buku['penerbit']; ?>" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir">Status</td>
                <td class="isian-formulir">
                    <input type="radio" name="status" value="Tersedia" <?php if($r_tampil_buku['status']=="Tersedia") echo "checked"; ?>> Tersedia
                    <input type="radio" name="status" value="Dipinjam" <?php if($r_tampil_buku['status']=="Dipinjam") echo "checked"; ?>> Dipinjam
                </td>
            </tr>
            <tr>
                <td class="label-formulir"></td>
                <td class="isian-formulir"><input type="submit" name="simpan" value="Simpan Perubahan" class="tombol"></td>
            </tr>
        </table>
    </form>
</div>