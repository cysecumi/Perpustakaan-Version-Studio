<div id="label-page"><h3>Input Data Buku</h3></div>
<div id="content">
    <form action="proses/buku-input-proses.php" method="post" enctype="multipart/form-data">
        <table id="tabel-input">
            <tr>
                <td class="label-formulir">Cover Buku</td>
                <td class="isian-formulir"><input type="file" name="foto" class="isian-formulir isian-formulir-border"></td>
            </tr>
            <tr>
                <td class="label-formulir">ID Buku</td>
                <td class="isian-formulir"><input type="text" name="idbuku" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir">Judul Buku</td>
                <td class="isian-formulir"><input type="text" name="judulbuku" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir">Kategori</td>
                <td class="isian-formulir">
                    <select name="kategori" class="isian-formulir isian-formulir-border">
                        <option value="Ilmu Komputer">Ilmu Komputer</option>
                        <option value="Fiksi">Fiksi</option>
                        <option value="Sastra">Sastra</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td class="label-formulir">Pengarang</td>
                <td class="isian-formulir"><input type="text" name="pengarang" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir">Penerbit</td>
                <td class="isian-formulir"><input type="text" name="penerbit" class="isian-formulir isian-formulir-border" required></td>
            </tr>
            <tr>
                <td class="label-formulir"></td>
                <td class="isian-formulir"><input type="submit" name="simpan" value="Simpan" class="tombol"></td>
            </tr>
        </table>
    </form>
</div>