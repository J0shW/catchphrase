import './App.css';
import Home from './pages/Home';
import Draw from './pages/Draw';
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketContext, socket } from './SocketContext';

function App() {
	// https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
	const [room, setRoom] = useState<string | undefined>(undefined);
	
	return (
		<BrowserRouter>
			<SocketContext.Provider value={socket}>
				<Routes>
					<Route path="/" element={<Home room={room} setRoom={setRoom} />}></Route>
					<Route path="draw" element={<Draw room={room} setRoom={setRoom} />} />
				</Routes>
			</SocketContext.Provider>
     	</BrowserRouter>
	);
}

export default App;
