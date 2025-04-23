document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const locationSelector = document.getElementById('location-selector');
  const votingInterface = document.getElementById('voting-interface');
  const undoBtn = document.getElementById('undo-btn');

  let currentIndex = 0;
  let selectedLocation = '';
  let voteData = {
    location: '',
    votes: []
  };
  let lastSwipedCard = null;

  function setupCard(card, index) {
    let startX = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      startX = e.clientX;
      isDragging = true;
      card.style.transition = 'none';
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 20}deg)`;
    };

    const onMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 100) {
        swipeCard(deltaX > 0 ? 'right' : 'left');
      } else {
        card.style.transition = 'transform 0.3s';
        card.style.transform = 'translateX(0) rotate(0)';
      }
    };

    card.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function swipeCard(direction) {
    const card = cards[currentIndex];
    if (!card) return;

    const product = card.dataset.name;

    // Prevent duplicate votes
    if (voteData.votes.find(v => v.product === product)) {
      showNextCard();
      return;
    }

    card.classList.add(direction === 'right' ? 'swipe-right' : 'swipe-left');

    lastSwipedCard = {
      index: currentIndex,
      card: card,
      product: product
    };
    undoBtn.style.display = 'block';

    setTimeout(() => {
      card.style.display = 'none';
      card.style.transform = 'translateX(0) rotate(0)';
      card.classList.remove('swipe-right', 'swipe-left');
      voteData.votes.push({ product: product, vote: direction });
      showNextCard();
    }, 300);
  }

  function showNextCard() {
    currentIndex++;
    if (currentIndex < cards.length) {
      cards[currentIndex].style.display = 'block';
    }
  }

  undoBtn.addEventListener('click', () => {
    if (!lastSwipedCard) return;

    const { index, card, product } = lastSwipedCard;

    // Remove the last vote
    voteData.votes = voteData.votes.filter(v => v.product !== product);

    // Show the card again, fully reset
    card.style.display = 'block';
    card.style.transform = 'translateX(0) rotate(0)';
    card.classList.remove('swipe-left', 'swipe-right');

    // Reset current index so the user is back at that card
    currentIndex = index;

    // Hide all other cards
    cards.forEach((c, i) => {
      c.style.display = i === currentIndex ? 'block' : 'none';
    });

    // Clear last swiped info
    lastSwipedCard = null;
    undoBtn.style.display = 'none';
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      swipeCard('left');
    } else if (e.key === 'ArrowRight') {
      swipeCard('right');
    }
  });

  document.querySelectorAll('.location-btn').forEach(button => {
    button.addEventListener('click', () => {
      selectedLocation = button.dataset.location;
      voteData.location = selectedLocation;

      // Show voting interface and hide location selection
      locationSelector.style.display = 'none';
      votingInterface.style.display = 'flex';

      // Reset and show first card
      currentIndex = 0;
      cards.forEach((card, index) => {
        card.style.display = index === 0 ? 'block' : 'none';
        setupCard(card, index);
      });
    });
  });
});
