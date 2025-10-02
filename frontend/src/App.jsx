import { useState, useEffect } from "react";

const App = () => {
  const [data, setData] = useState(null);
  const [gameId, setGameId] = useState(null);

  const joinGame = async () => {
    const response = await fetch("http://localhost:5000/api/joingame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: "65cb1f5fc3b1a1b78822de62", username: "frontendTest" }),
    });
    const responseData = await response.json();
    console.log(responseData);
    setData(responseData);
    setGameId(responseData.game._id);
  }


  return (
    <div>
      <h1>Trivia Game</h1>
      <p>{JSON.stringify(data)}</p>
      <p>{JSON.stringify(gameId)}</p>
      <button onClick={joinGame}>JOIN ROOM</button>
    </div>
  )
}

export default App;