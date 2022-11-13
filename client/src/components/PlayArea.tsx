import { useCallback, useContext } from "react";
import { Button } from "react-bootstrap";
import { SocketContext } from "../SocketContext";
import Timer from "./Timer";

interface IProps {
	name?: string;
	room?: Room;
	currentPlayer?: string;
	isRoundStarted: boolean;
}

const PlayArea: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);

	const start = useCallback(() => {
		socket.emit("start_timer", props.room?.code);
	}, [props.room]);

	const skip = useCallback(() => {
		socket.emit("skip", props.room?.code);
	}, [props.room]);

	const nextTurn = useCallback(() => {
		socket.emit("next_turn", props.room?.code);
	}, [props.room]);
	
	const isMyTurn = props.currentPlayer === props.name;
	const isTeamOne = props.room?.teamOne && props.room.teamOne.findIndex((player) => player.name === props.name) >= 0;
	const isTeamTwo = props.room?.teamTwo && props.room.teamTwo.findIndex((player) => player.name === props.name) >= 0;
	const isMyTeamsTurn = (props.room?.turn.team === 1 && isTeamOne) || (props.room?.turn.team === 2 && isTeamTwo);

	return (
		<div>
			<Timer name={props.name} room={props.room} />

			{(isMyTurn && !props.isRoundStarted) && (
				<div className="d-flex justify-content-center mt-5">
					<Button className="me-2" variant="primary" type="button" onClick={start} disabled={props.room === undefined}>
						Start Round
					</Button>
					<Button className="me-2" variant="outline-primary" type="button" onClick={nextTurn} disabled={props.room === undefined}>
						Next Player
					</Button>
				</div>
			)}

			{(isMyTurn && props.isRoundStarted) && (
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

			{(!isMyTurn && !props.isRoundStarted) && (
				<h2 className="text-center text-secondary text-capitalize h1 mt-5">Waiting for round to start . . .</h2>
			)}

			{(!isMyTurn && isMyTeamsTurn && props.isRoundStarted) && (
				<h2 className="text-center text-primary text-capitalize h1 mt-5">Time to Guess!</h2>
			)}

			{(!isMyTurn && !isMyTeamsTurn && props.isRoundStarted) && (
				<h2 className="text-center text-secondary text-capitalize h1 mt-5">Other Team's Turn . . .</h2>
			)}
		</div>
	);
}

export default PlayArea;