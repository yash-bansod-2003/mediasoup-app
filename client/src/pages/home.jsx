import * as React from "react";
import { useSocket } from "../hooks/use-socket.jsx";
import { useNavigate } from "react-router-dom";

function Home() {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleRoomJoined = React.useCallback(
    (data) => {
      const { roomId } = data;
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  React.useEffect(() => {
    socket.on("joined:room", handleRoomJoined);

    return () => {
      socket.off("joined:room", handleRoomJoined);
    };
  }, [handleRoomJoined, socket]);

  const [values, setValues] = React.useState({
    email: "",
    roomId: "",
  });

  const handleChange = React.useCallback((event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const handleJoinSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      const { email, roomId } = values;
      if (!email || !roomId) {
        alert("Please fill in all fields");
        return;
      }
      socket.emit("join:room", { email, roomId });
    },
    [socket, values]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Welcome to File Sharing
        </h1>
        <p className="text-center mb-6">
          Enter your email and room ID to join a room
        </p>
        <form onSubmit={handleJoinSubmit} className="space-y-4 mb-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
          <input
            type="text"
            name="roomId"
            placeholder="Room ID"
            value={values.roomId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
