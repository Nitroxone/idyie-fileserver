const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = 3000;
const SIZE_THRESHOLD = 5 * 1024 * 1024;

// Serve static files : test
app.get('/file', (req, res) => {
    const filePath = req.query.path;

    // Check if filepath is provided and if the file exists
    if(!filePath) {
        return res.status(400).send('File path is required.');
    }

    // Normalize file path
    const normalizedPath = path.normalize(filePath);

    // Check if the file exists
    fs.access(normalizedPath, fs.constants.F_OK, (err) => {
        if(err) {
            return res.status(400).send('File not found.');
        }

        fs.stat(normalizedPath, (err, stats) => {
            if(err) {
                return res.status(500).send('Error retrieving file stats!');
            }

            if(stats.size > SIZE_THRESHOLD && path.extname(normalizedPath).match(/\.(jpg|jpeg|png)$/i)) {
                // If picture is larger than 5MB, compress
                sharp(normalizedPath)
                .resize({ width: 1920 })
                .toBuffer()
                .then((data) => {
                    res.set('Content-Type', 'image/jpeg');
                    res.send(data);
                })
                .catch((err) => {
                    res.status(500).send('Error compressing image.');
                });
            } else {
                res.sendFile(normalizedPath);
            }
        });
    });
});

// Boot server
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});