import './App.css';
import Home from './pages/Home';
import Game from './pages/Game';
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketContext, socket } from './SocketContext';

function App() {
	// https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
	const [room, setRoom] = useState<Room | undefined>(undefined);
	const [name, setName] = useState("");
	
	return (
		<BrowserRouter>
			<SocketContext.Provider value={socket}>
				<Routes>
					<Route path="/" element={<Home room={room} setRoom={setRoom} name={name} setName={setName} />}></Route>
					<Route path="game" element={<Game room={room} setRoom={setRoom} name={name} />} />
				</Routes>
			</SocketContext.Provider>
     	</BrowserRouter>
	);
}

export default App;
