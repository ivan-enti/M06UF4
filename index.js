const PORT = 7777;
let http = require('http');
let static = require('node-static');
let ws = require('ws');
 
//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./public');
 
let http_server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(PORT);

let ws_server = new ws.Server({server: http_server});

let player1, player2;

let start_time = 5000;
let second_unit = 1000;
let max_score = 3;

ws_server.on('connection', function (conn) {
	console.log("Usuario conectado");	

	if(player1 == null){
		player1 = conn;
		
		let info = {
			player_num: 1
		};

		player1.send(JSON.stringify(info));

		player1.on('close', function(){
			console.log("Player 1 disconnected");
			player1 = null;
			if (player2 != null){
				player2.send()
			}
		});

		player1.on('message',function (msg) {
			if (player2 == null)
				return;
			console.log("Jugador 1: " + msg);

			let info = JSON.parse(msg);

			if(info.y != null){
				player2.send(JSON.stringify(info)) 
			}
			else if(info.bx != null){
				player2.send(JSON.stringify(info)) 
			}
			else if(info.score1 != null){
				player2.send(JSON.stringify(info))
				if (info.score1 >= max_score || info.score2 >= max_score){
					let data = {
						game_over: true,
						winner: 0
					};
					if (info.score1 >= 3)
						data.winner = 1;
					else
						data.winner = 2;
					player1.send(JSON.stringify(data));
					player2.send(JSON.stringify(data));
					return;
				}
			}
		});
	}
	else if (player2 == null){
		player2 = conn;
		
		let info = {
			player_num: 2
		};
		player2.send(JSON.stringify(info));
		
		/*setTimeout(function(){
			let game_info = {
				game_start: true
			};
			player1.send(JSON.stringify(game_info));
			player2.send(JSON.stringify(game_info));
		}, start_time);*/

		let count_timer = start_time / second_unit;
		if(count_timer > 0){
			setInterval(function(){
				info = {
					game_timer: count_timer,
					game_start: count_timer == 0
				}
				player2.send(JSON.stringify(info));
				if(player1 != null)
					player1.send(JSON.stringify(info));

				count_timer--;
			}, second_unit);
		}

		player2.on('close', function(){
			console.log("Player 2 disconnected");
			player2 = null;
		});

		player2.on('message',function (msg) {
			if (player1 == null)
				return;
			console.log("Jugador 2: " + msg);

			let info = JSON.parse(msg);

			if(info.y != null){
				player1.send(JSON.stringify(info));
			}
		});
	}


});
