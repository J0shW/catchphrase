// import { useState } from "react";
import { Dropdown, Form } from "react-bootstrap";

// const INITIAL_CATEGORIES: Category[] = [
// 	{ name:"Random Stuff", active: true },
// 	{ name:"Science & Nature", active: true },
// 	{ name:"Sports & Games", active: true },
// 	{ name:"Technology", active: true },
// ];

interface IProps {
	filters: Category[];
	setFilters: (filters: Category[]) => void;
}

const Filters: React.FC<IProps> = (props: IProps) => {
	// const [categories, setCategories] = useState(INITIAL_CATEGORIES);

	return (
		<Dropdown autoClose='outside' className="category-dropdown">
			<Dropdown.Toggle variant="outline-light" id="dropdown-basic" className="w-100">
				Categories
			</Dropdown.Toggle>

			<Dropdown.Menu className="w-100">
				{props.filters.map((category) => 
					<Dropdown.Item href="#/action-category" key={`check-${category.name}`}>
						<Form.Check 
							type={'checkbox'}
							id={category.name}
							label={category.name}
							checked={category.active}
							onClick={() => {
								const tempCat = [...props.filters];
								let catIndex = tempCat.findIndex((cat) => cat.name === category.name);
								tempCat[catIndex].active = tempCat[catIndex].active === true ?  false : true;
								console.log('active', tempCat[catIndex].active);
								props.setFilters(tempCat);
							}}
							onChange={(event) => console.log('checked', event.target.checked)}
							// onChange={(event) => {
							// 	console.log('event', event)
							// 	console.log('checked:', event.target.checked);
							// 	const tempCat = [...categories];
							// 	let catIndex = tempCat.findIndex((cat) => cat.name === category.name);
							// 	console.log('catIndex', catIndex);
							// 	tempCat[catIndex].active = event.target.checked === true ? false : true;
							// 	console.log('active', tempCat[catIndex].active)
							// 	setCategories(tempCat);
							// }}
						/>
					</Dropdown.Item>		
				)}
			</Dropdown.Menu>
		</Dropdown>
	);
}

export default Filters;