import { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketContext";

enum BlinkerColor {
	green = 'bg-success',
	orange = 'bg-warning',
	red = 'bg-danger',
}

const DEFAULT_TEMPO = 1000;
const DEFAULT_BLINKER : Blinker = {show: false, color: BlinkerColor.green };

interface IProps {
	name?: string;
	room?: Room;
}

const Timer: React.FC<IProps> = (props: IProps) => {
	const socket = useContext(SocketContext);
	const [blinker, setBlinker] = useState<Blinker>(DEFAULT_BLINKER);

	const end = useCallback(() => {
		if (props.room?.hostPlayer === props.name) {
			socket.emit("end_timer", props.room?.code);
		}
		// const endAudio = new Audio(require('../chime.mp3'));
		// endAudio.play();
	}, [props.room]);

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
	
	return (
		<div className="d-flex justify-content-center">
			<div id="blinker-wrapper" className="border border-5 rounded-circle">
				<div id="blinker" className={`rounded-circle ${blinker.color} ${blinker.show ? 'visible' : 'hidden'}`}></div>
			</div>
		</div>
	);
}

export default Timer;