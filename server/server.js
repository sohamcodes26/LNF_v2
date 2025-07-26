import express, { urlencoded } from "express";
import cors from 'cors';
import loginrouter from "./routes/loginroute.js";
import { connectdb } from "./config/database.js"; 
import { validate_token } from "./middlewares/validate_token.js";
import object_query_router from "./routes/objectqueryroute.js";
import my_items_router from "./routes/myitemsroute.js";
import cookieParser from "cookie-parser";
import profile_router from "./routes/profileroute.js";

connectdb();

const app = express();
const port = process.env.PORT || 9000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS','PATCH','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/apis/lost-and-found/auth', loginrouter);

app.use('/apis/lost-and-found/object-query', validate_token, object_query_router);
app.use('/uploads', express.static('uploads'));
app.use('/apis/lost-and-found/MyAccount', validate_token, profile_router);
app.use('/apis/lost-and-found/my-items', validate_token, my_items_router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});