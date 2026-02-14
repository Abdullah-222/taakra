"use client";

import { useState } from "react";

interface RoomLandingProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export default function RoomLanding({ onCreateRoom, onJoinRoom }: RoomLandingProps) {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Video Meeting
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={onCreateRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Create New Room
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => {
              if (roomId.trim()) {
                onJoinRoom(roomId.trim());
              }
            }}
            disabled={!roomId.trim()}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

