import { useState } from "react";

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<h1>SoundClone</h1>
			<button type="button" onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</button>
		</>
	);
}

export default App;
