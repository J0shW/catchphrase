import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Col, Container, ListGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketContext";

interface IProps {
  	room?: Room;
	setRoom: (room: Room | undefined) => void;
}

const Game: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

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

	return (
		<Container>
			<h1 className="text-center my-4">{props.room?.code}</h1>

			<Row>
				<Col>
					<h5>Team One</h5>
					<ListGroup>
						{props.room?.teamOne.map((player) =>
							<ListGroup.Item>{player.name}</ListGroup.Item>
						)}
					</ListGroup>
				</Col>
				<Col>
					<h5>Team Two</h5>
					<ListGroup>
						{props.room?.teamTwo.map((player) =>
							<ListGroup.Item>{player.name}</ListGroup.Item>
						)}
					</ListGroup>
				</Col>
			</Row>
			<Button className="mt-5" variant="danger" type="button" onClick={leaveRoom} disabled={props.room === undefined}>
					Leave Room
				</Button>
		</Container>
	)
};

export default Game;