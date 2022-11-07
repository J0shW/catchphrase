import './App.css';
import Home from './pages/Home';
import Game from './pages/Game';
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketContext, socket } from './SocketContext';
import { Toast, ToastContainer } from 'react-bootstrap';

interface ToastMessage {
	show: boolean;
	message: string;
}

function App() {
	// https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
	const [room, setRoom] = useState<Room | undefined>(undefined);
	const [name, setName] = useState("");
	const [toast, setToast] = useState<ToastMessage>({show: false, message: ''});

	useEffect(() => {
		socket.on("notification", (message: string) => {
			setToast({show: true, message });
		});
	}, []);
	
	return (
		<>
			<BrowserRouter>
				<SocketContext.Provider value={socket}>
					<Routes>
						<Route path="/" element={<Home room={room} setRoom={setRoom} name={name} setName={setName} />}></Route>
						<Route path="game" element={<Game room={room} setRoom={setRoom} name={name} />} />
					</Routes>
				</SocketContext.Provider>
			</BrowserRouter>
			<ToastContainer className="p-3" position={'top-end'}>
				<Toast onClose={() => setToast({show: false, message: ''})} show={toast.show} bg='success' className='w-auto' delay={3000} autohide>
					<Toast.Body className='text-white'>{toast.message}</Toast.Body>
				</Toast>
			</ToastContainer>
		 </>
	);
}

export default App;
