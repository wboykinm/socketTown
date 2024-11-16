const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static frontend files from the "public" folder
app.use(express.static('public'));

// Mock database for play text
let playText = require('./structured_play_text');

// API route to get play text
app.get('/play_text', (req, res) => {
    res.json(playText);
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('update_text', (data) => {
        const line = playText.find((line) => line.id === data.id);

        if (line) {
            // Update the line's text with the latest edit
            line.text = data.text;

            // Broadcast the updated text to all clients
            io.emit('text_updated', { id: line.id, text: line.text });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
