// URLs da API
const apiUrl1 = 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1';
const apiUrl2 = 'https://api.themoviedb.org/3/tv/latest';
const apiUrl3 = 'https://api.themoviedb.org/3/account/null/favorite/tv?language=pt-BR&page=1&sort_by=created_at.asc';
const bearerToken = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTNhOWFmNWI2YWU4Y2U4ZjQ0NmFlOTUzMmMyMGM2ZSIsIm5iZiI6MTczMzQxNjkwOS40OTYsInN1YiI6IjY3NTFkN2NkNDYyNDM5N2ZhODExNWE3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.W5wgoXzmQ2YcVWFEGoVodEaZV4OyrkEtfBCeRu-GbXY'; 
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_IMAGE = 'assets/default-poster.jpg';

async function loadAuthorData() {
    try {
        const response = await fetch('db.json');
        const data = await response.json();

        if (data.author && data.author.length > 0) {
            const author = data.author[0]; // Pega o primeiro objeto da lista
            console.log(author);
            // Preencher os dados no HTML
            document.getElementById('authorAvatar').src = author.avatar;
            document.getElementById('authorName').textContent = author.name;
            document.getElementById('authorCourse').textContent = `Curso: ${author.course}`;
            document.getElementById('authorClass').textContent = `Turma: ${author.class}`;
            document.getElementById('authorMinibio').textContent = author.minibio;

            const socialLinksContainer = document.getElementById('authorSocialLinks');
            for (let [platform, url] of Object.entries(author.socialLinks)) {
                const linkElement = document.createElement('a');
                linkElement.href = url;
                linkElement.target = "_blank";
                linkElement.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
                socialLinksContainer.appendChild(linkElement);
            }
        } else {
            console.error('Nenhum autor encontrado no JSON.');
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// Carregar os dados quando a página carregar
window.onload = loadAuthorData;

// Função para carregar as séries populares
const loadPopularSeries = async () => {
    try {
        const response = await fetch(apiUrl1, {
            method: 'GET',
            headers: {
                'Authorization': bearerToken,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const series = data.results || [];
        const carouselContent = document.getElementById('carouselContent');

        // Verifica se o carrossel já tem conteúdo para evitar sobrescrever
        if (!carouselContent) {
            console.error('Elemento de carrossel não encontrado');
            return;
        }

        series.forEach((serie, index) => {  
            const activeClass = index === 0 ? 'active' : '';

            // Verifica se a série tem id e poster_path
            if (serie.id && serie.poster_path) {
                const carouselItem = `
                    <div class="carousel-item ${activeClass}">
                        <a href="details.html?id=${serie.id}" style="text-decoration: none; color: inherit;">
                            <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" class="d-block w-100" alt="${serie.name}">
                            <div class="carousel-caption d-none d-md-block">
                                <h5><strong>${serie.name}</strong></h5>
                                <p>${serie.overview || 'Sem descrição'}</p>
                            </div>
                        </a>
                    </div>
                `;
                // Evita sobrescrever o conteúdo já existente, apenas adiciona
                carouselContent.innerHTML += carouselItem;
            } else {
                console.warn('Série sem ID ou poster_path:', serie);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar as séries populares:', error);
    }
};

// Função para carregar as séries recentes
async function fetchRecentSeries() {
    try {
        const response = await fetch(apiUrl2, {
            headers: {
                Authorization: bearerToken,
                accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);  // Verifique o conteúdo da resposta

        const series = [data];  // Transformando o objeto em um array, já que estamos lidando com um único item

        renderRecentSeries(series);  // Passar para a função de renderização das séries recentes
    } catch (error) {
        console.error('Erro ao buscar dados das séries recentes:', error);
    }
}

function renderRecentSeries(series) {
    const container = document.getElementById('recent-series-container');
    container.innerHTML = '';  // Limpar o container antes de adicionar novas séries

    series.forEach(serie => {
        console.log(serie);  // Verifique o conteúdo da série

        const col = document.createElement('div');
        col.classList.add('col-md-4');

        col.innerHTML = `
            <div class="card">
                <img 
                    src="${serie.poster_path ? `${BASE_IMAGE_URL}${serie.poster_path}` : DEFAULT_IMAGE}" 
                    class="card-img-top" 
                    alt="${serie.name || 'Sem imagem disponível'}"
                    onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                <div class="card-body">
                    <h5 class="card-title">${serie.name || 'Título não disponível'}</h5>
                    <p class="card-text">${serie.overview || 'Descrição não disponível.'}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// Função para carregar as séries favoritas
const fetchFavoriteSeries = async () => {
    try {
        const response = await fetch(apiUrl3, {
            method: 'GET',
            headers: {
                'Authorization': bearerToken,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();
        const series = data.results || [];

        renderFavoriteSeries(series);  // Passar para a função de renderização das séries favoritas
    } catch (error) {
        console.error('Erro ao buscar os dados das séries favoritas:', error);
        const seriesContainer = document.getElementById("favorite-series-container");
        if (seriesContainer) {
            seriesContainer.innerHTML = `<p class="text-danger">Não foi possível carregar as séries favoritas. Tente novamente mais tarde.</p>`;
        }
    }
};

function renderFavoriteSeries(series) {
    const container = document.getElementById('favorite-series-container');
    if (container) {
        container.innerHTML = '';  // Limpar o container antes de adicionar novas séries

        series.forEach(serie => {
            const col = document.createElement('div');
            col.classList.add('col-md-4');

            col.innerHTML = `
                <div class="card">
                    <img 
                        src="${serie.poster_path ? `${BASE_IMAGE_URL}${serie.poster_path}` : DEFAULT_IMAGE}" 
                        class="card-img-top" 
                        alt="${serie.name || 'Sem imagem disponível'}"
                        onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                    <div class="card-body">
                        <h5 class="card-title">${serie.name || 'Título não disponível'}</h5>
                        <p class="card-text">${serie.overview || 'Descrição não disponível.'}</p>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    }
}

// Inicializa a carga das séries quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    loadPopularSeries();  // Carregar as séries populares no carrossel
    fetchRecentSeries();  // Carregar as séries recentes
    fetchFavoriteSeries();  // Carregar as séries favoritas
});
