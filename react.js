import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/scan")
      .then((res) => res.json())
      .then((data) => setData(Object.entries(data)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Network Monitor</h1>
      <table>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Hostname</th>
            <th>Open Ports</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([ip, details]) => (
            <tr key={ip}>
              <td>{ip}</td>
              <td>{details.hostname || "Unknown"}</td>
              <td>{details.ports.length > 0 ? details.ports.join(", ") : "None"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;