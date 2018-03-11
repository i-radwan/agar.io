const GameConfig = require("../configs/GameConfig");
const GameServer = require("./GameServer");

let gameServer = new GameServer(GameConfig().gameConfig);
gameServer.init();