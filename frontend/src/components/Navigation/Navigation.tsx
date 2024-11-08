import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";

function Navigation() {
	return (
		<ul>
			<li>
				<NavLink to="/">Home</NavLink>
			</li>

			<li>
				<ProfileButton />
			</li>
		</ul>
	);
}

export default Navigation;
