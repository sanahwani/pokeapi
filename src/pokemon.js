import React, { useState, useEffect } from 'react';

const PokeAPIComponent = () => {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50&offset=0');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        const pokemonsData = await Promise.all(
          data.results.map(async (pokemon) => {
            const pokemonRes = await fetch(pokemon.url);
            if (!pokemonRes.ok) {
              throw new Error('Failed to fetch Pokémon data');
            }
            const pokemonData = await pokemonRes.json();
            return {
              name: pokemonData.name,
              image: pokemonData.sprites.front_default,
            };
          })
        );
        setPokemons(pokemonsData);
      } catch (error) {
        console.error( error);
      }
    };

    fetchPokemonData();

    // Cleanup function (optional) if needed
    return () => {
      // Any cleanup code goes here
    };
  }, []); // Empty dependency array means this effect runs only once after the component mounts

  return (
    <div>
      <h1>Pokemons</h1>
      <ul>
        {pokemons.map((pokemon, index) => (
          <li key={index}>
            <img src={pokemon.image} alt={pokemon.name} />
            {pokemon.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PokeAPIComponent;
