import { forwardRef, useEffect } from "react";
import { Tooltip } from "react-bootstrap";

const DynamicTooltip = forwardRef<HTMLDivElement>((props: any, ref) => {
	useEffect(() => {
		console.log('updating!');
		props.popper.scheduleUpdate();
	}, [props.children, props.popper]);

	return (
		<Tooltip ref={ref} {...props}>
			{props.children}
		</Tooltip>
	);
});

export default DynamicTooltip;