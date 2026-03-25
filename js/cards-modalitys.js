// Seleciona o container que possui os cards (o "trilho" do carrossel)
const track = document.getElementById('carouselTrack');

// Seleciona os botões de navegação
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

// Evento de clique no botão "next" (próximo)
nextBtn.addEventListener('click', () => {

    // Seleciona todos os cards
    const cards = document.querySelectorAll('.card-item-modalitys');

    // Percorre os cards na ordem normal
    for (let card of cards) {

        // Verifica qual é o primeiro card que está à direita da posição atual do scroll
        if (card.offsetLeft > track.scrollLeft + 5) {

            // Faz o scroll suave até esse card
            track.scrollTo({
                left: card.offsetLeft,
                behavior: 'smooth'
            });

            // Interrompe o loop após encontrar o próximo card
            break;
        }
    }

    // Aguarda um tempo para o scroll terminar e então atualiza o estado dos botões
    setTimeout(updateButtons, 300);
});

// Evento de clique no botão "prev" (anterior)
prevBtn.addEventListener('click', () => {

    // Seleciona os cards e inverte a ordem para percorrer de trás para frente
    const cards = Array.from(document.querySelectorAll('.card-item-modalitys')).reverse();

    // Percorre os cards ao contrário
    for (let card of cards) {

        // Verifica qual é o primeiro card que está à esquerda da posição atual do scroll
        if (card.offsetLeft < track.scrollLeft - 5) {

            // Faz o scroll suave até esse card
            track.scrollTo({
                left: card.offsetLeft,
                behavior: 'smooth'
            });

            // Interrompe o loop após encontrar o card anterior
            break;
        }
    }

    // Aguarda o scroll terminar e atualiza o estado dos botões
    setTimeout(updateButtons, 300);
});

// Função responsável por ativar/desativar os botões de navegação
function updateButtons() {

    // Calcula o valor máximo de scroll possível (fim do carrossel)
    const maxScroll = track.scrollWidth - track.clientWidth;

    // Verifica se está no início do carrossel
    if (track.scrollLeft <= 0) {

        // Desativa o botão "prev" e reduz a opacidade
        prevBtn.disabled = true;
        prevBtn.style.opacity = "0.5";

    } else {

        // Ativa o botão "prev" e restaura a opacidade
        prevBtn.disabled = false;
        prevBtn.style.opacity = "1";
    }

    // Verifica se está no final do carrossel
    if (track.scrollLeft >= maxScroll - 5) {

        // Desativa o botão "next" e reduz a opacidade
        nextBtn.disabled = true;
        nextBtn.style.opacity = "0.5";

    } else {

        // Ativa o botão "next" e restaura a opacidade
        nextBtn.disabled = false;
        nextBtn.style.opacity = "1";
    }
}