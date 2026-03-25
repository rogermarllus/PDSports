const track = document.getElementById('carouselTrack');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

function getCardWidth() {
    const card = document.querySelector('.card-item-modalitys');
    return card.offsetWidth + 12; 
}

nextBtn.addEventListener('click', () => {
    track.scrollLeft += getCardWidth();
});

prevBtn.addEventListener('click', () => {
    track.scrollLeft -= getCardWidth();
});
