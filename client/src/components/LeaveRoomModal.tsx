import { useCallback, useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import { SocketContext } from "../SocketContext";

interface IProps {
	isVisible: boolean;
	onClose: () => void;
	room?: Room;
}

const LeaveRoomModal: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);

	const leaveRoom = useCallback(() => {
		socket.emit("leave_room", props.room?.code);
	}, [props.room]);

	return (
		<Modal show={props.isVisible} onHide={props.onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Leave Room?</Modal.Title>
			</Modal.Header>
			<Modal.Footer className="">
				<Button variant="secondary" onClick={props.onClose}>Cancel</Button>
				<Button variant="info" onClick={leaveRoom}>Yes, leave</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default LeaveRoomModal;