<!DOCTYPE HTML>
<html>
<head>
    <title>Halaman Login</title>
    <link rel="stylesheet" href="style_login.css">
</head>
<body>
    <div style="color: white; position:absolute; left: 590px; top: 120px; font-size: 30px; background-color: black;">
    </div>
    
    <div class="container">
        <!-- Bagian h1 ini yang akan menjadi 'pegangan' untuk menggeser kotak -->
        <h1>Login ADMIN</h1>
        <form method="post" action="cek_login.php">
            <label>Username</label><br>
            <input type="text" name="user"><br>
            <label>Password</label><br>
            <input type="password" name="pass"><br>
            <button type="submit" name="submit">Log in</button>
        </form>
    </div>

    <!-- SCRIPT UNTUK MEMBUAT KOTAK BISA DIGESER -->
    <script>
        const container = document.querySelector('.container');
        const header = document.querySelector('.container h1'); 

        let isDragging = false;
        let offsetX, offsetY;

        // Memberikan efek kursor 'tangan' agar user tahu ini bisa ditarik
        header.style.cursor = 'grab';
        // Mencegah teks terblok/ter-highlight saat digeser
        header.style.userSelect = 'none'; 

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            header.style.cursor = 'grabbing';
            
            // Mengambil koordinat posisi kotak saat ini
            const rect = container.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Menghapus efek transform bawaan CSS sementara agar pergeseran akurat
            container.style.transform = 'none';
            container.style.left = rect.left + 'px';
            container.style.top = rect.top + 'px';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            // Mengubah posisi kotak sesuai dengan pergerakan mouse
            container.style.left = (e.clientX - offsetX) + 'px';
            container.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    </script>
</body>
</html>