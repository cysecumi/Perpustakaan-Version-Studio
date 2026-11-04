<div id="label-page"><h3>Tampil Data Buku</h3></div>
<div id="content">
    <p id="tombol-tambah-container">
        <a href="index.php?p=buku-input" class="tombol">Tambah Buku</a>
    </p>
    <form class="form-inline" method="POST">
        <div align="right">
            <input type="text" name="pencarian" placeholder="Cari judul buku...">
            <input type="submit" name="search" value="Search" class="tombol">
        </div>
    </form>
    <br>
    <table id="tabel-tampil" width="100%" border="1" cellpadding="8" style="border-collapse: collapse; text-align: center;">
        <tr style="background-color: #343a40; color: white;">
            <th style="padding: 10px;">No</th>
            <th style="padding: 10px;">ID Buku</th>
            <th style="padding: 10px;">Cover</th>
            <th style="padding: 10px;">Judul Buku</th>
            <th style="padding: 10px;">Kategori</th>
            <th style="padding: 10px;">Pengarang</th>
            <th style="padding: 10px;">Penerbit</th>
            <th style="padding: 10px;">Status</th>
            <th style="padding: 10px;">Opsi</th>
        </tr>
        <?php
        $batas = 10;
        extract($_GET);
        if(empty($hal)){
            $posisi = 0; $hal = 1; $nomor = 1;
        } else {
            $posisi = ($hal - 1) * $batas; $nomor = $posisi+1;
        }

        if($_SERVER['REQUEST_METHOD'] == "POST"){
            $pencarian = trim(mysqli_real_escape_string($db, $_POST['pencarian']));
            if($pencarian != ""){
                $query = "SELECT * FROM tbbuku WHERE judulbuku LIKE '%$pencarian%' OR pengarang LIKE '%$pencarian%'";
            } else {
                $query = "SELECT * FROM tbbuku LIMIT $posisi, $batas";
            }
        } else {
            $query = "SELECT * FROM tbbuku LIMIT $posisi, $batas";
        }

        $q_tampil_buku = mysqli_query($db, $query);
        if(mysqli_num_rows($q_tampil_buku) > 0) {
            while($r_tampil_buku = mysqli_fetch_array($q_tampil_buku)){
                // Logika foto kosong
                if(empty($r_tampil_buku['foto']) or ($r_tampil_buku['foto'] == '-')){
                    $foto = "admin-no-photo.jpg";
                } else {
                    $foto = $r_tampil_buku['foto'];
                }
        ?>
        <tr>
            <td><?php echo $nomor; ?></td>
            <td><?php echo $r_tampil_buku['idbuku']; ?></td>
            <td><img src="images/<?php echo $foto; ?>" width="50px" height="70px"></td>
            <td><?php echo $r_tampil_buku['judulbuku']; ?></td>
            <td><?php echo $r_tampil_buku['kategori']; ?></td>
            <td><?php echo $r_tampil_buku['pengarang']; ?></td>
            <td><?php echo $r_tampil_buku['penerbit']; ?></td>
            <td><?php echo $r_tampil_buku['status']; ?></td>
            <td>
                <a href="index.php?p=buku-edit&id=<?php echo $r_tampil_buku['idbuku'];?>" class="tombol" style="background-color: #007bff; padding: 5px;">Edit</a>
                <a href="proses/buku-hapus.php?id=<?php echo $r_tampil_buku['idbuku']; ?>" onclick="return confirm('Hapus data ini?')" class="tombol" style="background-color: #dc3545; padding: 5px;">Hapus</a>
            </td>
        </tr>
        <?php $nomor++; } } else { echo "<tr><td colspan='9' style='padding:15px;'>Data Tidak Ditemukan</td></tr>"; } ?>
    </table>
</div>