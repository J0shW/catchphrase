import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketContext";

interface IProps {
  	room?: string;
	setRoom: (room: string | undefined) => void;
}

const Home: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [selectedRoom, setSelectedRoom] = useState('');
	const [roomList, setroomList] = useState<string[]>([]);
	const [newRoomName, setNewRoomName] = useState('');

	const joinRoom = () => {
		if (selectedRoom !== "") {
			console.log('join', selectedRoom)
			handleJoinRoom();
			props.setRoom(selectedRoom);
		}
	};

	const handleJoinRoom = useCallback(() => {
		console.log('selectedRoom', selectedRoom)
		socket.emit("join_room", selectedRoom);
	}, [selectedRoom]);

	const createRoom = useCallback(() => {
		socket.emit("create_room", newRoomName);
	}, [newRoomName]);

	const getRoomList = useCallback(() => {
		console.log('get room list')
		socket.emit('get_room_list');
	}, []);

	const setRoomList = useCallback((roomList: string[]) => {
		console.log('roomList', roomList);
		setroomList(roomList)
	  }, [roomList]);

	useEffect(() => {
		socket.on("room_list", setRoomList);

		console.log('test')
		getRoomList();

		return () => {
			// before the component is destroyed
			// unbind all event handlers used in this component
			socket.off("room_list", setRoomList);
		};
	}, []);

	useEffect(() => {
		if (props.room === undefined) {
			navigate('/');
		} else {
			navigate('/draw');
		}
	}, [props.room]);
	

	return (
		<div className="App">
			<header>
				<h1>Pixel Playground</h1>
			</header>
			<main>
				<div className='createRoomContainer'>
					<h1>Create a room</h1>
					<input
						placeholder="New Room..."
						onChange={(event) => {
							setNewRoomName(event.target.value);
						}}
					/>
					<button onClick={createRoom}>Create Room</button>
				</div>
				<div className='joinRoomContainer'>
					<h1>Join a room</h1>
					<div className='roomList'>
						{roomList.map((room, index) => 
							<div 
								key={index}
								className={selectedRoom === room ? 'selectedRoom roomItem' : 'roomItem'}
								onClick={() => setSelectedRoom(room)}
							>
								{room}
							</div>)
						}
					</div>
					<button onClick={joinRoom}>Join Room</button>
				</div>
			</main>
		</div>
	);
};

export default Home;