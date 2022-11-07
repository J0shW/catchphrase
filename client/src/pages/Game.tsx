import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Col, Container, Form, ListGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketContext";

enum BlinkerColor {
	green = 'bg-success',
	orange = 'bg-warning',
	red = 'bg-danger',
}

const DEFAULT_TIMER_LENGTH = 60; // seconds
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

	const [timerLength, setTimerLength] = useState(DEFAULT_TIMER_LENGTH);
	const [blinker, setBlinker] = useState<Blinker>(DEFAULT_BLINKER);

	const leaveRoom = useCallback(() => {
		socket.emit("leave_room", props.room?.code);
	}, [props.room]);

	const start = useCallback(() => {
		socket.emit("start_timer", props.room?.code);
	}, [props.room]);

	const updateTimerLength = useCallback(() => {
		socket.emit("set_timer_length", { roomCode: props.room?.code, timerLength: timerLength});
	}, [props.room, timerLength]);

	const end = useCallback(() => {
		if (props.room?.hostPlayer === props.name) {
			socket.emit("end_timer", props.room?.code);
		}
		const endAudio = new Audio(require('../chime.mp3'));
		endAudio.play();
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
		<Container>
			<h1 className="my-4">Catchphrase</h1>
			<div className="d-flex justify-content-center mb-4">
				<div id="blinker-wrapper" className="border border-5 rounded-circle">
					<div id="blinker" className={`rounded-circle ${blinker.color} ${blinker.show ? 'visible' : 'hidden'}`}></div>
				</div>
			</div>
			<Row>
				<Col>
					<h5>Team One: {props.room?.teamOneScore}</h5>
					<ListGroup>
						{props.room?.teamOne.map((player) =>
							<ListGroup.Item key={player.id} className={currentPlayer === player.name ? "bg-light text-primary" : ""}>{player.name} {player.name === props.name && "- You"}</ListGroup.Item>
						)}
					</ListGroup>
				</Col>
				<Col>
					<h5>Team Two: {props.room?.teamTwoScore}</h5>
					<ListGroup>
						{props.room?.teamTwo.map((player) =>
							<ListGroup.Item key={player.id} className={currentPlayer === player.name ? "bg-light text-primary" : ""}>{player.name}  {player.name === props.name && "- You"}</ListGroup.Item>
						)}
					</ListGroup>
				</Col>
			</Row>

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

			{(isHost && !isRoundStarted) && (
				<div className="d-flex justify-content-center mt-4">
					<Form.Group controlId="formBasicTimer" className="d-flex flex-column">
						<Form.Label>Timer Length (seconds):</Form.Label>
						<Form.Control  type="number" placeholder="Timer length" value={timerLength} onChange={(event: any) => setTimerLength(parseInt(event.target.value))} />
						<Button className="mt-2" variant="outline-primary" type="button" onClick={updateTimerLength} disabled={props.room === undefined}>
							Set Length
						</Button>
					</Form.Group>
				</div>
			)}
			
			<div className="d-sm-flex flex-row mt-5 justify-content-between align-items-center">
				<Button className="" variant="outline-danger" type="button" onClick={leaveRoom} disabled={props.room === undefined}>
					Leave Room
				</Button>
				<h3 className="text-muted mt-2 mt-sm-0 mb-0">Room code: {props.room?.code}</h3>
			</div>
			
		</Container>
	)
};

export default Game;