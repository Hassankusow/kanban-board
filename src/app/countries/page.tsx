"use client";

import { useGetCountriesQuery } from "../../graphql/generated";

export default function CountriesPage() {
  const { data, loading, error } = useGetCountriesQuery();

  if (loading) return <p>Loading countries...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Countries</h1>
      <ul className="space-y-1">
        {data?.countries.map((country) => (
          <li key={country.code} className="border p-2 rounded">
            {country.name} ({country.code})
          </li>
        ))}
      </ul>
    </main>
  );
}
