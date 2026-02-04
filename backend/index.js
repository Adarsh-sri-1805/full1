const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res) => {

    // ---------- GET /data ----------
    if (req.method === 'GET' && req.url === '/data') {
        fs.readFile('data.json', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to read data file' }));
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data || '[]');
        });
    }

    // ---------- POST /data ----------
    else if (req.method === 'POST' && req.url === '/data') {
        let body = '';

        req.on('data', chunk => body += chunk.toString());

        req.on('end', () => {

            // 1️⃣ Parse JSON safely
            let newData;
            try {
                newData = JSON.parse(body);
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid JSON format' }));
            }

            // 2️⃣ Read existing file
            fs.readFile('data.json', 'utf8', (err, data) => {
                let existingData = [];

                if (!err && data) {
                    try {
                        existingData = JSON.parse(data);
                    } catch {
                        existingData = [];
                    }
                }

                // 3️⃣ Prevent nested arrays
                if (Array.isArray(newData)) {
                    existingData.push(...newData);
                } else {
                    existingData.push(newData);
                }

                // 4️⃣ Write back safely
                fs.writeFile(
                    'data.json',
                    JSON.stringify(existingData, null, 2),
                    'utf8',
                    err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'Failed to save data' }));
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Data added successfully' }));
                    }
                );
            });
        });
    }

    // ---------- 404 ----------
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});