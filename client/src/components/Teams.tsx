import { ListGroup } from "react-bootstrap";

interface IProps {
	name?: string;
	room?: Room;
	currentPlayer?: string;
}

const Teams: React.FC<IProps> = (props: IProps) => {
	
	return (
		<div className="d-flex my-3">
			<ListGroup className="flex-grow-1 has-addon-right" style={props.room?.teamOne && props.room?.teamOne.length > 0 ? {} : {borderBottomRightRadius: 0}}>
				<ListGroup.Item key={'team-one-name'}><b>Team One</b></ListGroup.Item>
				{props.room?.teamOne.map((player) =>
					<ListGroup.Item key={player.id} className={props.currentPlayer === player.name ? "text-primary" : ""}>{player.name} {player.name === props.name && "- You"}</ListGroup.Item>
				)}
			</ListGroup>
			<ListGroup className="is-addon-right me-3">
				<ListGroup.Item key={'team-one-score'}>
					<b>{props.room?.teamOneScore}</b>
				</ListGroup.Item>
			</ListGroup>

			<ListGroup className="is-addon-left">
				<ListGroup.Item key={'team-two-score'}>
					<b>{props.room?.teamTwoScore}</b>
				</ListGroup.Item>
			</ListGroup>
			<ListGroup className="flex-grow-1 has-addon-left" style={props.room?.teamTwo && props.room?.teamTwo.length > 0 ? {} : {borderBottomLeftRadius: 0}}>
				<ListGroup.Item key={'team-one-name'}><b>Team Two</b></ListGroup.Item>
				{props.room?.teamTwo.map((player) =>
					<ListGroup.Item key={player.id} className={props.currentPlayer === player.name ? "text-primary" : ""}>{player.name} {player.name === props.name && "- You"}</ListGroup.Item>
				)}
			</ListGroup>
		</div>
	);
}

export default Teams;