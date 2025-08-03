'use client';

import { useState } from 'react';

type CounterProps = {
  initial: number;
};

export default function Counter({ initial }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="p-4 border rounded w-fit">
      <p className="mb-2 text-lg">Count: {count}</p>
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}

