import React, { useState, useEffect } from 'react';
import { RotateCcw, RefreshCw, Trophy, Edit2 } from 'lucide-react';

interface Statistics {
  [key: string]: {
    [position: number]: number;
  };
}

export const Sorteo: React.FC = () => {
  const [participants, setParticipants] = useState<string[]>(() => {
    const saved = localStorage.getItem('participants');
    return saved ? JSON.parse(saved) : ['Mercau', 'Ludueña', 'Fernández', 'Basanta'];
  });
  
  const [results, setResults] = useState<string[]>(() => {
    const saved = localStorage.getItem('results');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [availableForFirst, setAvailableForFirst] = useState<string[]>(() => {
    const saved = localStorage.getItem('availableForFirst');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableParticipants, setEditableParticipants] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<Statistics>(() => {
    const saved = localStorage.getItem('statistics');
    if (saved) {
      return JSON.parse(saved);
    }
    const stats: Statistics = {};
    participants.forEach(name => {
      stats[name] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    });
    return stats;
  });

  useEffect(() => {
    if (availableForFirst.length === 0) {
      setAvailableForFirst([...participants]);
    }
  }, [availableForFirst, participants]);

  useEffect(() => {
    const newStats: Statistics = {};
    participants.forEach(name => {
      newStats[name] = statistics[name] || { 1: 0, 2: 0, 3: 0, 4: 0 };
    });
    setStatistics(newStats);
  }, [participants]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('availableForFirst', JSON.stringify(availableForFirst));
  }, [availableForFirst]);

  useEffect(() => {
    localStorage.setItem('statistics', JSON.stringify(statistics));
  }, [statistics]);

  const performRaffle = () => {
    if (availableForFirst.length === 0) {
      setAvailableForFirst([...participants]);
      return;
    }

    const firstPlaceIndex = Math.floor(Math.random() * availableForFirst.length);
    const firstPlace = availableForFirst[firstPlaceIndex];

    const newAvailableForFirst = availableForFirst.filter(p => p !== firstPlace);
    setAvailableForFirst(newAvailableForFirst);

    const remainingParticipants = participants.filter(p => p !== firstPlace);
    
    const shuffledRemaining = [...remainingParticipants];
    for (let i = shuffledRemaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRemaining[i], shuffledRemaining[j]] = [shuffledRemaining[j], shuffledRemaining[i]];
    }

    const finalResults = [firstPlace, ...shuffledRemaining];
    setResults(finalResults);
    
    const newStats = { ...statistics };
    finalResults.forEach((name, index) => {
      newStats[name][index + 1]++;
    });
    setStatistics(newStats);
  };

  const resetStatistics = () => {
    const resetStats: Statistics = {};
    participants.forEach(name => {
      resetStats[name] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    });
    setStatistics(resetStats);
    setResults([]);
    setAvailableForFirst([...participants]);
  };

  const openEditModal = () => {
    setEditableParticipants([...participants]);
    setIsEditing(true);
  };

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...editableParticipants];
    newParticipants[index] = value;
    setEditableParticipants(newParticipants);
  };

  const saveParticipants = () => {
    // Validate that we have exactly 4 non-empty names
    if (editableParticipants.some(p => !p.trim()) || editableParticipants.length !== 4) {
      alert('Por favor, ingrese cuatro nombres válidos');
      return;
    }

    setParticipants(editableParticipants);
    setIsEditing(false);
    resetStatistics(); // Reset statistics when participants change
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Asignación automática de causas
        </h2>
        <button
          onClick={openEditModal}
          className="text-gray-600 hover:text-gray-800 transition flex items-center gap-1"
        >
          <Edit2 className="w-4 h-4" />
          <span className="text-sm">Editar Vocales</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-4">
          {availableForFirst.length === 0 ? (
            <p className="text-orange-600 font-medium">
              ¡Todos han sido primer lugar! Click en sortear para comenzar nueva ronda.
            </p>
          ) : (
            <p>
              Vocales disponibles: {availableForFirst.join(', ')}
            </p>
          )}
        </div>

        <button
          onClick={performRaffle}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Realizar Sorteo
        </button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Resultados:</h3>
            <div className="grid gap-2">
              {results.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <span className="font-medium text-gray-700">
                    {index + 1}° Lugar:
                  </span>
                  <span className="text-indigo-600 font-semibold">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Estadísticas:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Vocal</th>
                  {[1, 2, 3, 4].map(pos => (
                    <th key={pos} className="px-4 py-2 text-center text-sm font-semibold text-gray-600">
                      {pos}° Lugar
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map(name => (
                  <tr key={name} className="border-t">
                    <td className="px-4 py-2 text-gray-800">{name}</td>
                    {[1, 2, 3, 4].map(pos => (
                      <td key={pos} className="px-4 py-2 text-center text-gray-600">
                        {statistics[name][pos]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={resetStatistics}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Resetear Estadísticas
        </button>
      </div>

      {/* Modal for editing participants */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Editar Vocales</h3>
            <div className="space-y-4">
              {editableParticipants.map((participant, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Vocal {index + 1}
                  </label>
                  <input
                    type="text"
                    value={participant}
                    onChange={(e) => handleParticipantChange(index, e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={saveParticipants}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sorteo;
