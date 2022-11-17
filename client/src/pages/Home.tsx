import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketContext";
import { Form, Button, Container } from 'react-bootstrap';

interface IProps {
  	room?: Room;
	setRoom: (room: Room | undefined) => void;
	name?: string;
	setName: (name: string) => void;
}

const Home: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [roomCode, setRoomCode] = useState("");
	const [error, setError] = useState();

	const joinRoom = useCallback(() => {
		console.log('roomCode', {name: props.name, roomCode})
		socket.emit("join_room", {name: props.name, roomCode}, (response: any) => {
			console.log('joinResult', response);
			if (response === 'duplicate') {
				setError(response);
			}
		});
	}, [props.name, roomCode]);

	const createRoom = useCallback(() => {
		socket.emit("create_room", props.name);
	}, [props.name]);

	useEffect(() => {
		socket.on("room_updated", (room: Room) => {
			console.log('room', room);
			props.setRoom(room);
		});

		return () => {
			// before the component is destroyed
			// unbind all event handlers used in this component
			socket.off("room_joined");
		};
	}, []);

	useEffect(() => {
		if (props.room === undefined) {
			navigate('/');
		} else {
			navigate('/game');
		}
	}, [navigate, props.room]);

	return (
		<Container className="align-items-center d-flex flex-column">
			<h1 className="text-center my-4">Phrase Frenzy</h1>
			<Form className="col-12 col-sm-7 col-md-5 col-lg-4">
				<Form.Group className="mb-3" controlId="formBasicName">
					<Form.Label>Name</Form.Label>
					<Form.Control type="text" placeholder="Enter name" value={props.name} onChange={(event: any) => {
							setError(undefined);
							props.setName(event.target.value);
					}} />
					<Form.Control.Feedback type="invalid" className={error ? 'd-block' : 'd-none'}>Name already taken.</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicCode">
					<Form.Label>Room Code</Form.Label>
					<Form.Control type="text" placeholder="Enter code" value={roomCode} onChange={(event: any) => setRoomCode((event.target.value as string).toUpperCase())} maxLength={4} />
				</Form.Group>
				<Button className="w-100" variant="info" type="button" onClick={joinRoom} disabled={props.name === "" || roomCode === ""}>
					Join Room
				</Button>
				<h5 className="w-100 text-center mt-2 text-muted">- OR -</h5>
				<Button className="w-100" variant="info" type="button" onClick={createRoom} disabled={props.name === "" || roomCode !== ""}>
					Create Room
				</Button>
			</Form>
		</Container>
	);
};

export default Home;