import { useCallback, useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import { SocketContext } from "../SocketContext";

interface IProps {
	player: Player | undefined;
	onClose: () => void;
	room?: Room;
}

const LeaveRoomModal: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);

	const leaveRoom = useCallback(() => {
		console.log('props.player', props.player)
		socket.emit("leave_room", {roomCode: props.room?.code, id: props.player?.id});
		props.onClose();
	}, [props.room, props.player]);

	return (
		<Modal show={props.player !== undefined} onHide={props.onClose}>
			<Modal.Header closeButton>
				<Modal.Title>{`Remove ${props.player?.name} from the room?`}</Modal.Title>
			</Modal.Header>
			<Modal.Footer className="">
				<Button variant="secondary" onClick={props.onClose}>Cancel</Button>
				<Button variant="info" onClick={leaveRoom}>Yes, leave</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default LeaveRoomModal;