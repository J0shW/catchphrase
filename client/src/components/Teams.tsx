import { ListGroup } from "react-bootstrap";

interface IProps {
	name?: string;
	room?: Room;
	currentPlayer?: string;
}

const Teams: React.FC<IProps> = (props: IProps) => {
	const teamOneColor = '#f39c12';
	const teamTwoColor = '#aa7bff';
	
	return (
		<div className="d-flex my-3">
			<ListGroup className="flex-grow-1 has-addon-right" style={props.room?.teamOne && props.room?.teamOne.length > 0 ? {} : {borderBottomRightRadius: 0}}>
				<ListGroup.Item key={'team-one-name'} style={{backgroundColor: teamOneColor, borderColor: teamOneColor, borderWidth: 2}}><b>Team One</b></ListGroup.Item>
				{props.room?.teamOne.map((player) =>
					<ListGroup.Item key={player.id} className={`d-flex justify-content-between align-items-center ${props.currentPlayer === player.name ? "text-white" : "text-muted"}`}>
						{player.name} {player.name === props.name && "- You"}
						{props.currentPlayer === player.name && (
							<div className={'currentPlayer rounded border bg-white'}></div>
						)}
					</ListGroup.Item>
				)}
			</ListGroup>
			<ListGroup className="is-addon-right me-3">
				<ListGroup.Item key={'team-one-score'} style={{borderColor: teamOneColor, borderWidth: 2}}>
					<b>{props.room?.teamOneScore}</b>
				</ListGroup.Item>
			</ListGroup>

			<ListGroup className="is-addon-left">
				<ListGroup.Item key={'team-two-score'} style={{borderColor: teamTwoColor, borderWidth: 2}}>
					<b>{props.room?.teamTwoScore}</b>
				</ListGroup.Item>
			</ListGroup>
			<ListGroup className="flex-grow-1 has-addon-left" style={props.room?.teamTwo && props.room?.teamTwo.length > 0 ? {} : {borderBottomLeftRadius: 0}}>
				<ListGroup.Item key={'team-one-name'} style={{backgroundColor: teamTwoColor, borderColor: teamTwoColor, borderWidth: 2}}><b>Team Two</b></ListGroup.Item>
				{props.room?.teamTwo.map((player) =>
					<ListGroup.Item key={player.id} className={`d-flex justify-content-between align-items-center ${props.currentPlayer === player.name ? "text-white" : "text-muted"}`}>
						{player.name} {player.name === props.name && "- You"}
						{props.currentPlayer === player.name && (
							<div className={'currentPlayer rounded border bg-white'}></div>
						)}
					</ListGroup.Item>
				)}
			</ListGroup>
		</div>
	);
}

export default Teams;