import React, { useState, useEffect } from "react";


export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState(""); 
  const [error, setError] = useState(""); 
  const[selectedId, setSelectedId]= useState(null);

  function handleSelectedPokemon(id){
    setSelectedId((setSelectedId)=> (id === selectedId ? null :id ));
  }

  function handleClosePokemon(){
    setSelectedId(null);
  }
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setError(""); 
        let url = `https://pokeapi.co/api/v2/pokemon?limit=100&offset=0`;
         if (query) {
          url = `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`;
        }
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch Searched Pokemon details. Try another one.");
        }

        let pokemonsData = [];
        //if user enters query
        if (query) {
          const pokemonData = await res.json();
          pokemonsData = [{
            imdbID: pokemonData.id,
            Title: pokemonData.name,
            Poster: pokemonData.sprites.front_default,
          }];
          //when there is no query. by default ftchng list
        } else {
          const data = await res.json();
          pokemonsData = await Promise.all(
            data.results.map(async (pokemon) => {
              const pokemonRes = await fetch(pokemon.url);
              if (!pokemonRes.ok) {
                throw new Error("Failed to fetch Searched Pokemon details, Try another one ❗");
              }
              const pokemonDetail = await pokemonRes.json();
              return {
                imdbID: pokemonDetail.id,
                Title: pokemonDetail.name,
                Poster: pokemonDetail.sprites.front_default,
              };
            })
          );
        }
        setPokemons(pokemonsData);
        console.log("data" + pokemonsData);
      } catch (error) {
        console.error("Error fetching Pokemon data:", error);
        setError(error.message); 
      }
    };

    fetchPokemons();
  }, [query]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
      
        <NumResults pokemons={pokemons} />
      </NavBar>

      <Main>
        <Box>
         {!error && <PokemonList pokemons={pokemons} onSelectPokemon={handleSelectedPokemon} />
          }
          {error && <ErrorMessage message={error} /> }
        </Box>

        <Box>
         { selectedId ? <PokemonDetails selectedId={selectedId}  onClosePokemon={handleClosePokemon} /> :
        <>
          <WatchedSummary watched={watched} />
          <WatchedPokemonsList watched={watched} />
        </>  
          }
          
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({message}){
  return(
    <p className="error">
      <span>❌</span>{message}
    </p>
  );

}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🤡</span>
      <h1>Pokemon</h1>
    </div>
  );
}

function Search({ query, setQuery }) { 
  return (
    <input
      className="search"
      type="text"
      placeholder="Search pokemon..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function PokemonDetails({ selectedId, onClosePokemon }) {
  const [pokemon, setPokemon] = useState({});

  useEffect(() => {
    if (selectedId) {
      async function getPokemonDetails() {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${selectedId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch Pokemon details');
          }
          const data = await res.json();
          setPokemon(data);
        } catch (error) {
          console.error('Error fetching Pokemon details:', error);
        }
      }
      getPokemonDetails();
    }
  }, [selectedId]);

  const {
    name: title,
    sprites,
    types,
    abilities,
    moves,
    height,
    weight,
    species
  } = pokemon;

  return (
    <div className="details">
      <button className="btn-back" onClick={onClosePokemon}>&larr;</button>
      {selectedId && (
        <>
         
          {sprites && sprites.front_default && (
            <img src={sprites.front_default} alt={`${title} poster`} />
          )}
          <div className="details-overview">
            <h2>{title}</h2>
          <p>Type: {types && types.map(type => type.type.name).join(', ')}</p>
          <p>Abilities: {abilities && abilities.map(ability => ability.ability.name).join(', ')}</p>
          <p>Moves: {moves && moves.map(move => move.move.name).join(', ')}</p>
          <p>Height: {height}</p>
          <p>Weight: {weight}</p>
          {species && (
            <p>Gender: {species.gender_rate === -1 ? 'Genderless' : 'Male / Female'}</p>
          )}
          </div>
        </>
      )}
    </div>
  );
}





function NumResults({ pokemons }) {
  return (
    <p className="num-results">
      Found <strong>{pokemons.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function PokemonList({ pokemons , onSelectPokemon}) { 
  return (
    <ul className="list list-movies">
      {pokemons.map((pokemon) => (
        <Pokemon pokemon={pokemon} key={pokemon.imdbID} onSelectPokemon={onSelectPokemon}  />
      ))}
    </ul>
  );
}


function Pokemon({ pokemon , onSelectPokemon,}) { 
  return (
    <li onClick={()=>onSelectPokemon(pokemon.imdbID)}>
      <img src={pokemon.Poster} alt={`${pokemon.Title} poster`} />
      <h3>{pokemon.Title}</h3>
      {/* <p>Type: {pokemon.Type}</p>
      <p>Abilities: {pokemon.Abilities}</p>
      <p>Moves: {pokemon.Moves}</p> */}
    </li>
  );
}

function WatchedSummary({ watched }) {
 
  return (
    <div className="summary">
      <h2>Pokemons in detail</h2>
     
     
    </div>
  );
}

function WatchedPokemonsList({ watched }) { 
  return (
    <ul className="list">
      {watched.map((pokemon) => (
        <WatchedPokemon pokemon={pokemon} key={pokemon.imdbID} />
      ))}
    </ul>
  );
}

function WatchedPokemon({ pokemon }) { 
  return 
    // <li>
    //   <img src={pokemon.Poster} alt={`${pokemon.Title} poster`} />
    //   <h3>{pokemon.Title}</h3>
    //   <div>
    //     <p>
    //       <span>⭐️</span>
    //       <span>{pokemon.imdbRating}</span>
    //     </p>
    //     <p>
    //       <span>🌟</span>
    //       <span>{pokemon.userRating}</span>
    //     </p>
    //     <p>
    //       <span>⏳</span>
    //       <span>{pokemon.runtime} min</span>
    //     </p>
    //   </div>
    // </li>
  
}
