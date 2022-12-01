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
	const winningTeam = props.room?.previousTurn.winningTeam;
	const myTeamWonRound = (winningTeam === 1 && isTeamOne) || (winningTeam === 2 && isTeamTwo);
	const isMyTurnNext = () => {
		if (!isMyTeamsTurn) {
			const players = isTeamOne ? props.room?.teamOne : props.room?.teamTwo;
			const playerIndex = players?.findIndex((player) => player.name === props.name);

			const nextIndex = isTeamOne ? props.room?.teamOnePlayerIndex : props.room?.teamTwoPlayerIndex;
			return playerIndex === nextIndex;
		}
		return false;
	}

	return (
		<div>
			{props.isRoundStarted && (
				<Timer name={props.name} room={props.room} />
			)}

			{(!props.isRoundStarted && winningTeam) && (
				<>
					<h2 className="text-center">{'Times Up!'}</h2>
					<h2 className={`text-center ${myTeamWonRound ? 'text-success' : 'text-danger'}`}>
						{`${myTeamWonRound ? 'Your' : 'The other'} team got the point ${myTeamWonRound ? '😀' : '🙈'}`}
					</h2>
				</>
			)}

			{(isMyTurn && !props.isRoundStarted) && (
				<div className="d-flex justify-content-center mt-4">
					<Button className="me-2" variant="info" type="button" onClick={start} disabled={props.room === undefined}>
						Start Round
					</Button>
					<Button className="ms-2" variant="outline-light" type="button" onClick={nextTurn} disabled={props.room === undefined}>
						Next Player
					</Button>
				</div>
			)}

			{(isMyTurn && props.isRoundStarted) && (
				<>
					<h2 className="text-center text-info text-capitalize h1 mt-4">{props.room?.turn.phrase.word}</h2>
					<p className="text-center text-muted">Category: {props.room?.turn.phrase.category}</p>

					<div className="d-flex justify-content-center mt-2">
						<Button className="me-2" variant="success" type="button" onClick={nextTurn} disabled={props.room === undefined}>
							Got it!
						</Button>
						<Button className="ms-2" variant="secondary" type="button" onClick={skip} disabled={props.room === undefined}>
							Skip
						</Button>
					</div>
				</>
			)}

			{(!isMyTurn && !props.isRoundStarted) && (
				<h3 className="text-center text-secondary mt-4">{`Waiting for ${props.currentPlayer} to start the round . . .`}</h3>
			)}

			{(!isMyTurn && isMyTeamsTurn && props.isRoundStarted) && (
				<h3 className="text-center text-info mt-4">Time to Guess!</h3>
			)}

			{(!isMyTurn && !isMyTeamsTurn && props.isRoundStarted) && (
				<>
					<h3 className="text-center text-secondary mt-4">Other Team's Turn . . .</h3>
					{isMyTurnNext() &&
						<h2 className="text-center text-primary mt-4">Get Ready! You're up next 🤗</h2>
					}
				</>
			)}
		</div>
	);
}

export default PlayArea;