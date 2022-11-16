import { Modal } from "react-bootstrap";

interface IProps {
	isVisible: boolean;
	onClose: () => void;
}

const HowToPlayModal: React.FC<IProps> = (props: IProps) => {
	// https://www.fgbradleys.com/rules//Catch%20Phrase%20Electronic.pdf
	return (
		<Modal show={props.isVisible} onHide={props.onClose}>
			<Modal.Header closeButton>
				<Modal.Title>How To Play</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex flex-column align-items-center my-3">
					<h3>Basic Rules</h3>
					<p>
						The game is played in two teams. 
						Your team wins by getting the most points.
					</p>
					<p>
						Each game consists of several rounds of play. 
						To begin a round, press the 'Start Round' button to start the timer.
					</p>
					<p>
						A word will appear on the screen. 
						You need to get your team to guess that word by giving them clues. 
						You can press the 'Skip' button to get a new word if you are not familiar with the word. 
					</p>
					<p>
						When your team guesses the correct word you press the 'Got It!' button. Now it is the other team's turn. Turns will go back and forth until the timer runs out.
					</p>
					<p>
						When the timer runs out, the team currently guessing loses the round and the other team will score one point. 
						Games are usually won when the first team reaches seven points.
					</p>
					<h3>Giving Clues</h3>
					<p>
						You can make any physical gesture and give almost any verbal clue to get your team to say the word. But you CANNOT:
					</p>
					<ul>
						<li>Say a word that RHYMES with the word</li>
						<li>Give the FIRST LETTER of the word</li>
						<li>SAY A PART OF THE WORD in the clue (i.e. “shoe” for “shoe horn”).</li>
					</ul> 
					
				</div>
			</Modal.Body>
		</Modal>
	);
}

export default HowToPlayModal;