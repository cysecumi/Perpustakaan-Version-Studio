<div id="label-page"><h3>Tampil Data Anggota</h3></div>
<div id="content">
    <p id="tombol-tambah-container">
        <a href="index.php?p=anggota-input" class="tombol">Tambah Anggota</a>
    </p>
    <form class="form-inline" method="POST">
        <div align="right">
            <input type="text" name="pencarian" placeholder="Cari data anggota...">
            <input type="submit" name="search" value="Search" class="tombol">
        </div>
    </form>
    <br>
    <table id="tabel-tampil" width="100%" border="1" cellpadding="8" style="border-collapse: collapse; text-align: center;">
        <tr style="background-color: #343a40; color: white;">
            <th style="padding: 10px;">No</th>
            <th style="padding: 10px;">ID Anggota</th>
            <th style="padding: 10px;">Nama</th>
            <th style="padding: 10px;">Foto</th>
            <th style="padding: 10px;">Jenis Kelamin</th>
            <th style="padding: 10px;">Alamat</th>
            <th style="padding: 10px;">Opsi</th>
        </tr>
        <?php
        $batas = 10;
        extract($_GET);
        if(empty($hal)){
            $posisi = 0;
            $hal = 1;
            $nomor = 1;
        } else {
            $posisi = ($hal - 1) * $batas;
            $nomor = $posisi+1;
        }

        if($_SERVER['REQUEST_METHOD'] == "POST"){
            $pencarian = trim(mysqli_real_escape_string($db, $_POST['pencarian']));
            if($pencarian != ""){
                $sql = "SELECT * FROM tbanggota WHERE nama LIKE '%$pencarian%'
                        OR idanggota LIKE '%$pencarian%'
                        OR jeniskelamin LIKE '%$pencarian%'
                        OR alamat LIKE '%$pencarian%'";
                $query = $sql;
                $queryJml = $sql;
            } else {
                $query = "SELECT * FROM tbanggota LIMIT $posisi, $batas";
                $queryJml = "SELECT * FROM tbanggota";
            }
        } else {
            $query = "SELECT * FROM tbanggota LIMIT $posisi, $batas";
            $queryJml = "SELECT * FROM tbanggota";
        }

        $q_tampil_anggota = mysqli_query($db, $query);
        if(mysqli_num_rows($q_tampil_anggota) > 0) {
            while($r_tampil_anggota = mysqli_fetch_array($q_tampil_anggota)){
                if(empty($r_tampil_anggota['foto']) or ($r_tampil_anggota['foto'] == '-')){
                    $foto = "admin-no-photo.jpg";
                } else {
                    $foto = $r_tampil_anggota['foto'];
                }
        ?>
        <tr>
            <td><?php echo $nomor; ?></td>
            <td><?php echo $r_tampil_anggota['idanggota']; ?></td>
            <td><?php echo $r_tampil_anggota['nama']; ?></td>
            <td><img src="images/<?php echo $foto; ?>" width="50px" height="50px" style="border-radius: 4px; object-fit: cover;"></td>
            <td><?php echo $r_tampil_anggota['jeniskelamin']; ?></td>
            <td><?php echo $r_tampil_anggota['alamat']; ?></td>
            <td>
                <!-- TOMBOL CETAK -->
                <a href="cetak-kartu.php?id=<?php echo $r_tampil_anggota['idanggota'];?>" target="_blank" class="tombol" style="background-color: #f59e0b; padding: 5px; margin-right: 3px;">Cetak</a>
                <!-- TOMBOL EDIT -->
                <a href="index.php?p=anggota-edit&id=<?php echo $r_tampil_anggota['idanggota'];?>" class="tombol" style="background-color: #007bff; padding: 5px; margin-right: 3px;">Edit</a>
                <!-- TOMBOL HAPUS -->
                <a href="proses/anggota-hapus.php?id=<?php echo $r_tampil_anggota['idanggota']; ?>" onclick="return confirm('Apakah Anda Yakin Akan Menghapus Data Ini?')" class="tombol" style="background-color: #dc3545; padding: 5px;">Hapus</a>
            </td>
        </tr>
        <?php 
                $nomor++; 
            }
        } else {
            echo "<tr><td colspan='7' style='padding: 15px;'>Data Tidak Ditemukan</td></tr>";
        }
        ?>
    </table>
</div>