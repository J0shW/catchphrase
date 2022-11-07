interface Room {
	code: string;
	hostPlayer: string;
	teamOne: Player[];
	teamTwo: Player[];
	teamOneScore: number,
    teamTwoScore: number,
	teamOnePlayerIndex: number,
    teamTwoPlayerIndex: number,
    timerLength: number,
    baffledTimer: number,
	timerDate: number | undefined;
	turn: Turn;
}

interface Player {
	name: string;
	id: string;
}

interface Turn {
	team: number;
	player: string;
	phrase: Phrase;
}

interface Phrase {
	word: string;
	category: string;
}

interface Blinker {
	show: boolean;
	color: string;
}