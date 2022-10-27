import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketContext";
import { Form, Button, Container } from 'react-bootstrap';

interface IProps {
  	room?: string;
	setRoom: (room: string | undefined) => void;
}

const Home: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [name, setName] = useState("");
	const [roomCode, setRoomCode] = useState("");

	const joinRoom = useCallback(() => {
		console.log('roomCode', {name, roomCode})
		socket.emit("join_room", {name, roomCode});
	}, [name, roomCode]);

	const createRoom = useCallback(() => {
		socket.emit("create_room", name);
	}, [name]);

	useEffect(() => {
		socket.on("room_joined", props.setRoom);

		return () => {
			// before the component is destroyed
			// unbind all event handlers used in this component
			socket.off("room_joined", props.setRoom);
		};
	}, []);

	useEffect(() => {
		if (props.room === undefined) {
			navigate('/');
		} else {
			navigate('/draw');
		}
	}, [navigate, props.room]);

	return (
		<Container>
			<h1>Catchphrase</h1>
			<Form>
				<Form.Group className="mb-3" controlId="formBasicName">
					<Form.Label>Name</Form.Label>
					<Form.Control type="text" placeholder="Enter name" value={name} onChange={(event: any) => setName(event.target.value)} />
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicCode">
					<Form.Label>Room Code</Form.Label>
					<Form.Control type="text" placeholder="Enter code" value={roomCode} onChange={(event: any) => setRoomCode((event.target.value as string).toUpperCase())} maxLength={4} />
				</Form.Group>
				<Button className="w-100" variant="primary" type="button" onClick={joinRoom} disabled={name === "" || roomCode === ""}>
					Join Room
				</Button>
				<h5 className="w-100 text-center mt-2 text-muted">- OR -</h5>
				<Button className="w-100" variant="primary" type="button" onClick={createRoom} disabled={name === ""}>
					Create Room
				</Button>
			</Form>
		</Container>
	);
};

export default Home;