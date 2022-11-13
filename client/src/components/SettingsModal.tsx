import { useCallback, useContext, useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { SocketContext } from "../SocketContext";
import Filters from "./Filters";

interface IProps {
	isVisible: boolean;
	onClose: () => void;
	room?: Room;
}

const DEFAULT_TIMER_LENGTH = 60; // seconds

const SettingsModal: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const [timerLength, setTimerLength] = useState(DEFAULT_TIMER_LENGTH);

	const updateTimerLength = useCallback(() => {
		socket.emit("set_timer_length", { roomCode: props.room?.code, timerLength: timerLength});
	}, [props.room, timerLength]);

	const setFilters = useCallback((filters: Category[]) => {
		socket.emit("set_filters", { roomCode: props.room?.code, filters});
	}, [props.room]);

	useEffect(() => {
		updateTimerLength();
	}, [timerLength]);

	return (
		<Modal show={props.isVisible} onHide={props.onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Game Settings</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex flex-column align-items-center my-3">
					<Filters filters={props.room?.filters ?? []} setFilters={setFilters} />
					<div className="d-flex justify-content-center mt-4">
						<Form.Group controlId="formBasicTimer" className="d-flex flex-column">
							<Form.Label>Timer Length (seconds):</Form.Label>
							<Form.Control  type="number" placeholder="Timer length" value={timerLength} onChange={(event: any) => setTimerLength(parseInt(event.target.value))} />
						</Form.Group>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
}

export default SettingsModal;