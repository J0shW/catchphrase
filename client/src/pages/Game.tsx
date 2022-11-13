import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Container, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Teams from "../components/Teams";
import DynamicTooltip from "../components/DynamicTooltip";
import { SocketContext } from "../SocketContext";
import SettingsModal from "../components/SettingsModal";

enum BlinkerColor {
	green = 'bg-success',
	orange = 'bg-warning',
	red = 'bg-danger',
}

const DEFAULT_TEMPO = 1000;
const DEFAULT_BLINKER : Blinker = {show: false, color: BlinkerColor.green };
interface IProps {
  	room?: Room;
	setRoom: (room: Room | undefined) => void;
	name?: string;
}

const Game: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [blinker, setBlinker] = useState<Blinker>(DEFAULT_BLINKER);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [codeCopied, setCodeCopied] = useState(false);

	const leaveRoom = useCallback(() => {
		socket.emit("leave_room", props.room?.code);
	}, [props.room]);

	const start = useCallback(() => {
		socket.emit("start_timer", props.room?.code);
	}, [props.room]);

	const end = useCallback(() => {
		if (props.room?.hostPlayer === props.name) {
			socket.emit("end_timer", props.room?.code);
		}
		// const endAudio = new Audio(require('../chime.mp3'));
		// endAudio.play();
	}, [props.room]);

	const skip = useCallback(() => {
		socket.emit("skip", props.room?.code);
	}, [props.room]);

	const nextTurn = useCallback(() => {
		socket.emit("next_turn", props.room?.code);
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

	const beep = useCallback(() => {
		if (props.room?.timerDate) {
			const diff = Date.now() - props.room.timerDate;
			// console.log('diff', diff);
			if (diff >= (props.room.baffledTimer * 1000)) {
				setBlinker(DEFAULT_BLINKER);
				end();
			} else {
				let tempo = ((props.room.baffledTimer * 1000) / diff) * 100;
				tempo = tempo < DEFAULT_TEMPO ? tempo : DEFAULT_TEMPO;
				// console.log('tempo', tempo);

				// const audio = new Audio(require('../beep.mp3'));
				// audio.play();
				let color: BlinkerColor = BlinkerColor.green;
				switch (true) {
					case tempo < 200 : color = BlinkerColor.red; break;
					case tempo < 400 : color = BlinkerColor.orange; break;
				}

				setBlinker(current => {return {show: !current.show, color}});
	
				setTimeout(() => {
					beep();
				}, tempo);
			}
		}
	}, [props.room?.timerDate]);

	useEffect(() => {
		beep();
	}, [props.room?.timerDate]);

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
	const isMyTurn = currentPlayer === props.name;
	const isTeamOne = props.room?.teamOne && props.room.teamOne.findIndex((player) => player.name === props.name) >= 0;
	const isTeamTwo = props.room?.teamTwo && props.room.teamTwo.findIndex((player) => player.name === props.name) >= 0;
	const isMyTeamsTurn = (props.room?.turn.team === 1 && isTeamOne) || (props.room?.turn.team === 2 && isTeamTwo);

	return (
		<Container className="d-flex flex-column justify-content-between">
			<div>
				<div className="d-flex justify-content-between align-items-center mt-4">
					<h1>Phrase Frenzy</h1>
					<Button variant="outline-light" className={`${isHost ? 'd-flex' : 'd-none'}`} onClick={() => setShowSettingsModal(true)} disabled={isRoundStarted}>
						<span className="material-symbols-outlined">settings</span>
					</Button>
				</div>

				<Teams name={props.name} room={props.room} currentPlayer={currentPlayer} />
			</div>

			<div>
				<div className="d-flex justify-content-center">
					<div id="blinker-wrapper" className="border border-5 rounded-circle">
						<div id="blinker" className={`rounded-circle ${blinker.color} ${blinker.show ? 'visible' : 'hidden'}`}></div>
					</div>
				</div>

				{(isMyTurn && !isRoundStarted) && (
					<div className="d-flex justify-content-center mt-5">
						<Button className="me-2" variant="primary" type="button" onClick={start} disabled={props.room === undefined}>
							Start Round
						</Button>
						<Button className="me-2" variant="outline-primary" type="button" onClick={nextTurn} disabled={props.room === undefined}>
							Next Player
						</Button>
					</div>
				)}

				{(isMyTurn && isRoundStarted) && (
					<>
						<h2 className="text-center text-primary text-capitalize h1 mt-5">{props.room?.turn.phrase.word}</h2>
						<p className="text-center text-muted">Category: {props.room?.turn.phrase.category}</p>

						<div className="d-flex justify-content-center mt-2">
							<Button className="me-2" variant="success" type="button" onClick={nextTurn} disabled={props.room === undefined}>
								Got it!
							</Button>
							<Button className="" variant="secondary" type="button" onClick={skip} disabled={props.room === undefined}>
								Skip
							</Button>
						</div>
					</>
				)}

				{(!isMyTurn && !isRoundStarted) && (
					<h2 className="text-center text-secondary text-capitalize h1 mt-5">Waiting for round to start . . .</h2>
				)}

				{(!isMyTurn && isMyTeamsTurn && isRoundStarted) && (
					<h2 className="text-center text-primary text-capitalize h1 mt-5">Time to Guess!</h2>
				)}

				{(!isMyTurn && !isMyTeamsTurn && isRoundStarted) && (
					<h2 className="text-center text-secondary text-capitalize h1 mt-5">Other Team's Turn . . .</h2>
				)}
			</div>

			<div className="d-flex flex-row mb-3 justify-content-between align-items-center">
				<Button variant="outline-danger" type="button" onClick={leaveRoom} disabled={props.room === undefined}>
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
