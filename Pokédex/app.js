const pokemonList = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const typeInput = document.getElementById('type-input');
const orderInput = document.getElementById('order-input');
const pokemonDetailsContainer = document.getElementById('pokemon-details');

let allPokemon = [];
let filteredPokemon = [];

const typeTranslation = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Oscuro",
    steel: "Acero",
    fairy: "Hada"
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchPokemon() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();
        allPokemon = data.results;

        const pokemonDetailsPromises = allPokemon.map(pokemon => fetch(pokemon.url).then(response => response.json()));
        const pokemonDetails = await Promise.all(pokemonDetailsPromises);

        allPokemon = allPokemon.map((pokemon, index) => ({
            ...pokemon,
            details: pokemonDetails[index]
        }));

        filteredPokemon = [...allPokemon];

        renderPokemon(filteredPokemon);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
}

function renderPokemon(pokemonArray) {
    pokemonList.innerHTML = '';
    pokemonArray.forEach((pokemon) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');

        const pokemonImage = document.createElement('img');
        pokemonImage.src = pokemon.details.sprites.front_default;
        pokemonImage.loading = "lazy";

        const pokemonName = document.createElement('h3');
        pokemonName.textContent = capitalize(pokemon.name);

        const pokemonId = document.createElement('p');
        pokemonId.textContent = `#${pokemon.details.id}`;

        const typesDiv = document.createElement('div');
        pokemon.details.types.forEach(type => {
            const typeButton = document.createElement('button');
            typeButton.classList.add('type-button', `type-${type.type.name}`);
            typeButton.textContent = typeTranslation[type.type.name] || capitalize(type.type.name);
            typesDiv.appendChild(typeButton);
        });

        pokemonCard.appendChild(pokemonImage);
        pokemonCard.appendChild(pokemonName);
        pokemonCard.appendChild(pokemonId);
        pokemonCard.appendChild(typesDiv);

        pokemonCard.addEventListener('click', () => showPokemonDetails(pokemon));

        pokemonList.appendChild(pokemonCard);
    });
}

async function getTypeWeaknesses(types) {
    const weaknesses = new Set();
    const typeData = await Promise.all(
        types.map(type => 
            fetch(`https://pokeapi.co/api/v2/type/${type.type.name}`)
                .then(response => response.json())
        )
    );

    typeData.forEach(type => {
        type.damage_relations.double_damage_from.forEach(weakness => {
            weaknesses.add(weakness.name);
        });
    });

    return [...weaknesses];
}

function createTypeButton(type) {
    const button = document.createElement('button');
    button.classList.add('type-button', `type-${type}`);
    button.textContent = typeTranslation[type] || capitalize(type);
    return button;
}

function createWeaknessButton(weakness) {
    const button = document.createElement('button');
    button.classList.add('weakness-button', `type-${weakness}`);
    button.textContent = typeTranslation[weakness] || capitalize(weakness);
    return button;
}

async function showPokemonDetails(pokemon) {
    pokemonList.style.display = 'none';
    pokemonDetailsContainer.style.display = 'block';

    pokemonDetailsContainer.innerHTML = '';

    const detailsCard = document.createElement('div');
    detailsCard.classList.add('details-card');

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemon.details.sprites.other['official-artwork'].front_default || pokemon.details.sprites.front_default;
    pokemonImage.alt = pokemon.name;
    pokemonImage.classList.add('pokemon-image');

    const pokemonName = document.createElement('h3');
    pokemonName.textContent = `${capitalize(pokemon.name)} (#${pokemon.details.id})`;

    const pokemonWeight = document.createElement('p');
    pokemonWeight.textContent = `Peso: ${(pokemon.details.weight / 10).toFixed(1)} kg`;

    const pokemonHeight = document.createElement('p');
    pokemonHeight.textContent = `Altura: ${(pokemon.details.height / 10).toFixed(1)} m`;

    const pokemonAbilities = document.createElement('p');
    pokemonAbilities.textContent = `Habilidad: ${pokemon.details.abilities.map(ability => capitalize(ability.ability.name)).join(', ')}`;

    const pokemonTypesSection = document.createElement('div');
    pokemonTypesSection.classList.add('info-box');
    const typesLabel = document.createElement('h4');
    typesLabel.textContent = 'Tipo:';
    pokemonTypesSection.appendChild(typesLabel);

    const pokemonTypes = document.createElement('div');
    pokemon.details.types.forEach(type => {
        const typeButton = createTypeButton(type.type.name);
        pokemonTypes.appendChild(typeButton);
    });

    pokemonTypesSection.appendChild(pokemonTypes);

    const pokemonWeaknessesSection = document.createElement('div');
    pokemonWeaknessesSection.classList.add('info-box');
    const weaknessesLabel = document.createElement('h4');
    weaknessesLabel.textContent = 'Debilidad:';
    pokemonWeaknessesSection.appendChild(weaknessesLabel);

    const pokemonWeaknesses = document.createElement('div');
    const weaknesses = await getTypeWeaknesses(pokemon.details.types);
    weaknesses.forEach(weakness => {
        const weaknessButton = createWeaknessButton(weakness);
        pokemonWeaknesses.appendChild(weaknessButton);
    });

    pokemonWeaknessesSection.appendChild(pokemonWeaknesses);

    detailsCard.appendChild(pokemonImage);
    detailsCard.appendChild(pokemonName);
    detailsCard.appendChild(pokemonWeight);
    detailsCard.appendChild(pokemonHeight);
    detailsCard.appendChild(pokemonAbilities);
    detailsCard.appendChild(pokemonTypesSection);
    detailsCard.appendChild(pokemonWeaknessesSection);

    const backButton = document.createElement('button');
    backButton.textContent = 'Volver';
    backButton.classList.add('back-button');
    backButton.addEventListener('click', () => {
        pokemonList.style.display = 'grid';
        pokemonDetailsContainer.style.display = 'none';
    });
    detailsCard.appendChild(backButton);

    pokemonDetailsContainer.appendChild(detailsCard);
}

function addClickEventToPokemonCard(pokemon) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemon.details.sprites.front_default;
    pokemonImage.loading = "lazy";

    const pokemonName = document.createElement('h3');
    pokemonName.textContent = capitalize(pokemon.name);

    const pokemonId = document.createElement('p');
    pokemonId.textContent = `#${pokemon.details.id}`;

    const typesDiv = document.createElement('div');
    pokemon.details.types.forEach(type => {
        const typeButton = document.createElement('button');
        typeButton.classList.add('type-button', `type-${type.type.name}`);
        typeButton.textContent = typeTranslation[type.type.name] || capitalize(type.type.name);
        typesDiv.appendChild(typeButton);
    });

    pokemonCard.appendChild(pokemonImage);
    pokemonCard.appendChild(pokemonName);
    pokemonCard.appendChild(pokemonId);
    pokemonCard.appendChild(typesDiv);

    pokemonCard.addEventListener('click', () => showPokemonDetails(pokemon));

    return pokemonCard;
}

async function getWeaknesses(types) {
    const weaknesses = new Set();

    for (const type of types) {
        const typeResponse = await fetch(type.type.url);
        const typeData = await typeResponse.json();

        typeData.damage_relations.double_damage_from.forEach(weakness => {
            weaknesses.add(weakness.name);
        });
    }

    return Array.from(weaknesses);
}

let currentFilter = {
    type: 'all',
    order: 'ascendente'
};

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allPokemon.filter(pokemon => {
        return currentFilter.type === 'all' || pokemon.details.types.some(type => type.type.name === currentFilter.type);
    });

    filtered = filtered.filter(pokemon => {
        return pokemon.name.toLowerCase().startsWith(searchTerm) || 
               pokemon.details.id.toString().startsWith(searchTerm) ||
               pokemon.details.types.some(type => typeTranslation[type.type.name].toLowerCase().includes(searchTerm));
    });

    if (currentFilter.order === 'ascendente') {
        filtered.sort((a, b) => a.details.id - b.details.id);
    } else if (currentFilter.order === 'descendente') {
        filtered.sort((a, b) => b.details.id - a.details.id);
    } else if (currentFilter.order === 'az') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentFilter.order === 'za') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    renderPokemon(filtered);
});

typeInput.addEventListener('change', () => {
    currentFilter.type = typeInput.value;

    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allPokemon.filter(pokemon => {
        return currentFilter.type === 'all' || pokemon.details.types.some(type => type.type.name === currentFilter.type);
    });

    filtered = filtered.filter(pokemon => {
        return pokemon.name.toLowerCase().startsWith(searchTerm) || pokemon.details.id.toString().startsWith(searchTerm);
    });

    if (currentFilter.order === 'ascendente') {
        filtered.sort((a, b) => a.details.id - b.details.id);
    } else if (currentFilter.order === 'descendente') {
        filtered.sort((a, b) => b.details.id - a.details.id);
    } else if (currentFilter.order === 'az') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentFilter.order === 'za') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    renderPokemon(filtered);
});

orderInput.addEventListener('change', () => {
    currentFilter.order = orderInput.value;

    let filtered = allPokemon.filter(pokemon => {
        return currentFilter.type === 'all' || pokemon.details.types.some(type => type.type.name === currentFilter.type);
    });

    const searchTerm = searchInput.value.toLowerCase();
    filtered = filtered.filter(pokemon => {
        return pokemon.name.toLowerCase().startsWith(searchTerm) || pokemon.details.id.toString().startsWith(searchTerm);
    });

    if (currentFilter.order === 'ascendente') {
        filtered.sort((a, b) => a.details.id - b.details.id);
    } else if (currentFilter.order === 'descendente') {
        filtered.sort((a, b) => b.details.id - a.details.id);
    } else if (currentFilter.order === 'az') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentFilter.order === 'za') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    renderPokemon(filtered);
});

fetchPokemon();
