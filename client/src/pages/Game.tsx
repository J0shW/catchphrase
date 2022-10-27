import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Col, Container, ListGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketContext";

interface IProps {
  	room?: Room;
	setRoom: (room: Room | undefined) => void;
	name?: string;
}

const Game: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const leaveRoom = useCallback(() => {
		socket.emit("leave_room", props.room?.code);
	}, [props.room]);

	const nextPhrase = useCallback(() => {
		socket.emit("next_phrase", props.room?.code);
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
			socket.off("room_left", () => props.setRoom(undefined));
		};
	}, []);

	useEffect(() => {
		if (props.room === undefined) {
			navigate('/');
		} else {
			navigate('/game');
		}
	}, [props.room]);

	const currentPlayer = props.room?.turn.player;
	const isMyTurn = currentPlayer === props.name;
	const isTeamOne = props.room?.teamOne && props.room.teamOne.findIndex((player) => player.name === props.name) >= 0;
	const isTeamTwo = props.room?.teamTwo && props.room.teamTwo.findIndex((player) => player.name === props.name) >= 0;
	const isMyTeamsTurn = (props.room?.turn.team === 1 && isTeamOne) || (props.room?.turn.team === 2 && isTeamTwo);

	return (
		<Container>
			<h1 className="my-4">Catchphrase</h1>
			<Row>
				<Col>
					<h5>Team One</h5>
					<ListGroup>
						{props.room?.teamOne.map((player) =>
							<ListGroup.Item className={currentPlayer === player.name ? "bg-light text-primary" : ""}>{player.name} {player.name === props.name && "- You"}</ListGroup.Item>
						)}
					</ListGroup>
				</Col>
				<Col>
					<h5>Team Two</h5>
					<ListGroup>
						{props.room?.teamTwo.map((player) =>
							<ListGroup.Item className={currentPlayer === player.name ? "bg-light text-primary" : ""}>{player.name}  {player.name === props.name && "- You"}</ListGroup.Item>
						)}
					</ListGroup>
				</Col>
			</Row>

			{isMyTurn && (
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

			{(!isMyTurn && isMyTeamsTurn) && (
				<h2 className="text-center text-primary text-capitalize h1 mt-5">Time to Guess!</h2>
			)}

			{(!isMyTurn && !isMyTeamsTurn) && (
				<h2 className="text-center text-secondary text-capitalize h1 mt-5">Other Team's Turn . . .</h2>
			)}
			
			<div className="d-sm-flex flex-row mt-5 justify-content-between align-items-center">
				<Button className="" variant="outline-danger" type="button" onClick={leaveRoom} disabled={props.room === undefined}>
					Leave Room
				</Button>
				<h3 className="text-muted mt-2 mt-sm-0">Room code: {props.room?.code}</h3>
			</div>
			
		</Container>
	)
};

export default Game;