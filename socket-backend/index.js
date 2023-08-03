const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true, // Set this to true if you need to send cookies or authorization headers
  },
});

const userSockets = [];
const userData = [];

function addUserData(token, userName,category) {
  let tokenIndex = userData.findIndex((obj) => obj.hasOwnProperty(token));
  if (tokenIndex !== -1) {
    let arr = userData[tokenIndex][token];
    userData[tokenIndex][token] = [...arr, {
      'userName':userName,
      'category':category}];
  } else {
    const obj = {};
    obj[token] = [ {
      'userName':userName,
      'category':category}];
      userData.push(obj);
  }
}

function CreateUpdateUserSockets(token, value) {
  let tokenIndex = userSockets.findIndex((obj) => obj.hasOwnProperty(token));
  if (tokenIndex !== -1) {
    let arr = userSockets[tokenIndex][token];
    userSockets[tokenIndex][token] = [...arr, value];
  } else {
    const obj = {};
    obj[token] = [value];
    userSockets.push(obj);
  }
}

function deleteUserSockets(token, value) {
  let tokenIndex = userSockets.findIndex((obj) => obj.hasOwnProperty(token));
  if (tokenIndex !== -1) {
    const tokenArray = userSockets[tokenIndex][token];

    const indexToRemove = tokenArray.indexOf(value);

    if (indexToRemove !== -1) {
      tokenArray.splice(indexToRemove, 1);
    }
  }
}
const secretKey = "----------------------------";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Authentication error"));
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err){ 
      return next(
      new Error("Authentication error"));
    }
    socket.userId = decoded.userId;
    next();
  });
}


app.use(express.json());

app.post("/login", (req, res) => {
  const userId = Math.random(); // Replace with the actual user ID after successful authentication
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "124h" });
  res.json({ token });
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  CreateUpdateUserSockets(token,socket.id)
  sendChartBarData(token)

  
  socket.on("form_data", (formData) => {
    const userName = formData['userName'];
    const category = formData['category'];
   
    addUserData(token,userName,category)
    sendChartBarData(token)
    
  });
  socket.on("disconnect", () => {
    const token = socket.handshake.auth.token;
    deleteUserSockets(token,socket.id)
  });
});


function sendChartBarData(token){
  let userIndex = userData.findIndex((obj) => obj.hasOwnProperty(token));
  if (userIndex !== -1) {  
      let tokenIndex = userSockets.findIndex((obj) => obj.hasOwnProperty(token));
      if (tokenIndex !== -1) {  
        let id=userSockets[tokenIndex][token]
        id.forEach((socketId) => {
          io.to(socketId).emit("sendChartBarData",userData[userIndex][token]);
        });
      }
  }
}

 
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
