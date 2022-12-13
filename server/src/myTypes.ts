export interface Room {
	code: string;
	hostPlayer: string;
	teamOne: Player[];
	teamTwo: Player[];
	teamOneScore: number;
    teamTwoScore: number;
	teamOnePlayerIndex: number;
    teamTwoPlayerIndex: number;
    timerLength: number;
    baffledTimer: number;
	timerDate: number | undefined;
	filters: Category[];
	turn: Turn;
	previousTurn: {winningTeam?: number, wordList: string[]};
	previousWords: string[];
}

export interface Player {
	name: string;
	id: string;
}

export interface Turn {
	team: number;
	player: string;
	phrase: Phrase;
}

export interface Phrase {
	word: string;
	category: string;
}

export interface Blinker {
	show: boolean;
	color: string;
}

export interface Category {
	name: string;
	active: boolean;
}