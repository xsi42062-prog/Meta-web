const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

// 模拟数据库
let users = [
    { 
        uid: "1001", 
        username: "User01", 
        password: "Password123", 
        withdrawPin: "888888",   
        balance: 5000.00, 
        isFrozen: false 
    }
];

app.get('/api/admin/users', (req, res) => {
    res.json(users);
});

app.post('/api/admin/freeze', (req, res) => {
    const { uid, status } = req.body;
    const user = users.find(u => u.uid === uid);
    if (user) {
        user.isFrozen = status;
        io.emit(`freeze_status_${uid}`, { isFrozen: status });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
