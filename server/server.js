import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Import all your route handlers ---
import loginrouter from "./routes/loginroute.js";
import object_query_router from "./routes/objectqueryroute.js";
import profile_router from "./routes/profileroute.js";
import my_items_router from "./routes/myitemsroute.js";
import chat_router from "./routes/chatroute.js";
import result_router from "./routes/resultroute.js"; // Make sure this is imported

// --- Import middleware and config ---
import { connectdb } from "./config/database.js";
import { validate_token } from "./middlewares/validate_token.js"; // Ensure path is correct

// --- Boilerplate for __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Basic Setup ---
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

// --- Socket.IO Setup ---
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Your frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make the io instance available to other parts of your app (like the chat controller)
app.set('socketio', io);

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: false }));

// --- Static File Serving ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
connectdb();

// --- API Routes ---
app.use('/apis/lost-and-found/auth', loginrouter);
app.use('/apis/lost-and-found/object-query', validate_token, object_query_router);
app.use('/apis/lost-and-found/my-items', validate_token, my_items_router);
app.use('/apis/lost-and-found/MyAccount', validate_token, profile_router);
app.use('/apis/lost-and-found/chat', validate_token, chat_router);
app.use('/apis/lost-and-found/results', validate_token, result_router);


// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- Start Server ---
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
