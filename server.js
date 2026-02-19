const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

// 模拟数据库
const users = [
  {
    uid: '1001',
    username: 'User01',
    password: 'Password123',
    withdrawPin: '888888',
    balance: 5000.0,
    isFrozen: false,
    updatedAt: new Date().toISOString(),
  },
  {
    uid: '1002',
    username: 'Trader02',
    password: 'Password123',
    withdrawPin: '777777',
    balance: 11240.34,
    isFrozen: false,
    updatedAt: new Date().toISOString(),
  },
  {
    uid: '1003',
    username: 'Alpha03',
    password: 'Password123',
    withdrawPin: '666666',
    balance: 386.22,
    isFrozen: true,
    updatedAt: new Date().toISOString(),
  },
];

const markets = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 98241.5, change: 2.3 },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 3456.28, change: 1.2 },
  { symbol: 'SOL/USDT', name: 'Solana', price: 182.96, change: -0.8 },
];

function getDashboardSummary() {
  const totalUsers = users.length;
  const frozenUsers = users.filter((u) => u.isFrozen).length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  return {
    totalUsers,
    frozenUsers,
    activeUsers: totalUsers - frozenUsers,
    totalBalance: Number(totalBalance.toFixed(2)),
  };
}

app.get('/api/markets', (req, res) => {
  res.json(markets);
});

app.get('/api/profile/:uid', (req, res) => {
  const user = users.find((u) => u.uid === req.params.uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    uid: user.uid,
    username: user.username,
    balance: user.balance,
    isFrozen: user.isFrozen,
    updatedAt: user.updatedAt,
  });
});

app.get('/api/admin/summary', (req, res) => {
  res.json(getDashboardSummary());
});

app.get('/api/admin/users', (req, res) => {
  res.json(users);
});

app.post('/api/admin/freeze', (req, res) => {
  const { uid, status } = req.body;
  const user = users.find((u) => u.uid === uid);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.isFrozen = Boolean(status);
  user.updatedAt = new Date().toISOString();

  io.emit(`freeze_status_${uid}`, { isFrozen: user.isFrozen });
  io.emit('admin_user_updated', { uid: user.uid, isFrozen: user.isFrozen });

  return res.json({ success: true, user });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
