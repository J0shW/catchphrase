import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "../editor/Editor";
import { SocketContext } from "../SocketContext";

interface IProps {
  	room?: string;
	setRoom: (room: string | undefined) => void;
}

const Draw: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (props.room === undefined) {
			navigate('/');
		} else {
			navigate('/draw');
		}
	}, [props.room]);

	return (
		<>
			<Editor room={props.room} />
			<button onClick={() => props.setRoom(undefined)}>Leave Room</button>
		</>
	)
};

export default Draw;