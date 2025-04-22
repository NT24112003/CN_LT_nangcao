require('dotenv').config({path:'./config/env'});



const express = require('express')
const app = express()
const port = 3000
const path = require("path")
const cors = require("cors")
const expressLayouts = require('express-ejs-layouts')
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")
const connectDB = require("./config/db")
const routers = require("./routers/router")
const sessionMiddleware = require("./middlewares/sessionMiddleware")
const passportMiddleware = require("./middlewares/passportMiddleware")
const methodOverride = require('method-override');
//  require('./middlewares/reminderScheduler');



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/src"));
app.use(expressLayouts);
app.set('layout', 'app');


connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));


app.use(express.static(path.join(__dirname,"../frontend/public")));
app.use(cookieParser());
app.use(flash());
// session
app.use(sessionMiddleware.sessionConfig);
app.use(sessionMiddleware.flashMiddleware);
// passport
app.use(passportMiddleware.initialize());
app.use(passportMiddleware.session());
app.use('/',routers );



app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})