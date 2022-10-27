interface Room {
	code: string;
	teamOne: Player[];
	teamTwo: Player[];
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