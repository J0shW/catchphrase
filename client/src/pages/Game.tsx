import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Container, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Teams from "../components/Teams";
import DynamicTooltip from "../components/DynamicTooltip";
import { SocketContext } from "../SocketContext";
import SettingsModal from "../components/SettingsModal";
import PlayArea from "../components/PlayArea";

interface IProps {
  	room?: Room;
	setRoom: (room: Room | undefined) => void;
	name?: string;
}

const Game: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [codeCopied, setCodeCopied] = useState(false);

	const leaveRoom = useCallback(() => {
		socket.emit("leave_room", props.room?.code);
	}, [props.room]);

	useEffect(() => {
		socket.on("room_left", () => props.setRoom(undefined));

		socket.on("room_updated", (room: Room) => {
			console.log('room', room);
			props.setRoom(room);
		});

		return () => {
			// before the component is destroyed
			// unbind all event handlers used in this component
			console.log('destroy');
			socket.off("room_updated");
			socket.off("room_left");
		};
	}, []);

	useEffect(() => {
		setTimeout(() => {
			setCodeCopied(false);
		}, 4000);
	}, [codeCopied]);

	useEffect(() => {
		if (props.room === undefined) {
			navigate('/');
		} else {
			navigate('/game');
		}
	}, [props.room]);

	const currentPlayer = props.room?.turn.player;
	const isHost = props.name === props.room?.hostPlayer;
	const isRoundStarted = props.room?.timerDate !== undefined;
	
	return (
		<Container className="d-flex flex-column justify-content-between pt-4 pb-3">
			<div>
				<div className="d-flex justify-content-between align-items-center">
					<h1>Phrase Frenzy</h1>
					<Button variant="outline-light" className={`${isHost ? 'd-flex' : 'd-none'}`} onClick={() => setShowSettingsModal(true)} disabled={isRoundStarted}>
						<span className="material-symbols-outlined">settings</span>
					</Button>
				</div>

				<Teams name={props.name} room={props.room} currentPlayer={currentPlayer} />
			</div>

			<PlayArea name={props.name} room={props.room} isRoundStarted={isRoundStarted} currentPlayer={currentPlayer} />

			<div className="d-flex flex-row justify-content-between align-items-center">
				<Button variant="outline-secondary" type="button" onClick={leaveRoom} disabled={props.room === undefined}>
					Leave Room
				</Button>
				<OverlayTrigger
					placement="top"
					delay={{ show: 250, hide: 400 }}
					overlay={
						// @ts-ignore
						<DynamicTooltip id="copycode-tooltip">{codeCopied ? 'Copied!' : 'Click to copy'}</DynamicTooltip>
					}
				>
					<Button variant="dark" onClick={() => {
						navigator.clipboard.writeText(props.room?.code!);
						setCodeCopied(true);
					}}>
						Room code: {props.room?.code}
					</Button>
				</OverlayTrigger>
			</div>

			<SettingsModal isVisible={showSettingsModal} onClose={() => setShowSettingsModal(false)} room={props.room} />
		</Container>
	)
};

export default Game;
