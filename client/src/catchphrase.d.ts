interface Room {
	code: string;
	teamOne: Player[];
	teamTwo: Player[];
}

interface Player {
	name: string;
	id: string;
}