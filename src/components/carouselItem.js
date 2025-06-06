// carousel item

import { TMDB_IMAGE_BASE_URL } from '../router.js';

export function createCarouselItem(item, isFirstItem = false, context = 'carousel', onRemove = null, usePoster = false, progressData = null, episodeInfo = null) {
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const formattedDate = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const user_rating = (item.vote_average / 2).toFixed(1);
  let rating = '';
  if (mediaType === 'tv' && item.content_ratings && item.content_ratings.results) {
    const usRating = item.content_ratings.results.find(r => r.iso_3166_1 === 'US');
    rating = usRating ? usRating.rating : '';
  } else if (mediaType === 'movie' && item.release_dates && item.release_dates.results) {
    const usRelease = item.release_dates.results.find(r => r.iso_3166_1 === 'US');
    rating = usRelease && usRelease.release_dates && usRelease.release_dates.length > 0 
      ? usRelease.release_dates[0].certification 
      : '';
  }
  
  const storedProgressData = getWatchProgress(item.id);
  const displayProgressData = progressData || storedProgressData;
  
  let imagePath;
  
  if (usePoster) {
    imagePath = item.poster_path;
  } else {
    imagePath = item.images && item.images.backdrops && item.images.backdrops.length > 0 
      ? item.images.backdrops[0].file_path 
      : item.backdrop_path;
  }
    
  if (!imagePath) {
    return null;
  }
  
  const card = document.createElement('div');
  
  if (context === 'grid') {
    card.className = 'carousel-item w-full bg-button-primary rounded-lg transition-all duration-400 ease-in-out relative cursor-pointer';
  } else {
    card.className = isFirstItem 
      ? 'carousel-item flex-shrink-0 bg-button-primary rounded-lg ml-2 transition-all duration-400 ease-in-out relative cursor-pointer'
      : 'carousel-item flex-shrink-0 bg-button-primary rounded-lg transition-all duration-400 ease-in-out relative cursor-pointer';
  }
  
  if (usePoster) {
    card.classList.add('w-[140px]');
    card.style.aspectRatio = '2/3';
  } else {
    card.classList.add('h-[10.625rem]');
    card.classList.add('aspect-video');
  }
  
  card.dataset.id = item.id;
  card.dataset.mediaType = mediaType;
  
  // bg image
  card.style.backgroundImage = `url(${TMDB_IMAGE_BASE_URL}w500${imagePath})`;
  card.style.backgroundColor = '#1a1a1a';
  card.style.backgroundSize = 'cover';
  card.style.backgroundPosition = 'center';

  const infoPanel = document.createElement('div');

  infoPanel.className = 'carousel-info-popup hidden md:block bg-[#1A1D21] text-text-primary p-3 rounded-b-lg opacity-0 transition-all duration-300 ease-in-out pointer-events-none'; 
  infoPanel.style.transition = 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out';
  infoPanel.style.transform = 'translateY(-6px) scale(0.95)';
  infoPanel.style.opacity = '0';
  infoPanel.style.position = 'absolute';
  infoPanel.style.zIndex = '50';
      
  infoPanel.innerHTML = `
    <h3 class="text-text-primary font-semibold text-xl">${title}</h3>
    <button class="play-button pagebtn px-4 py-3 text-lg my-2 w-full rounded-lg bg-button-primary font-medium flex flex-row items-center justify-center gap-2">
        <i class="fas fa-play text-xl mr-0.5"></i>
        <span>${displayProgressData?.continueText || 'Play'}</span>
    </button>
    <span class="text-sm font-normal"><i class="fas fa-circle-check mr-1 text-accent"></i> Available on QuickWatch</span>
    <div class="flex flex-row items-center gap-2 mt-1 text-[0.9rem] text-zinc-300">
      <span class="mr-[0.2rem]">${formattedDate}</span>
      <span class="mr-[0.2rem]">${user_rating} <i class="fas fa-star text-accent"></i></span>
      ${rating ? `<div class="flex items-center bg-gray-700 px-1.5 py-0.5 rounded text-xs">${rating}</div>` : ''}
    </div>
  `;
  
  infoPanel.className = 'carousel-info-popup hidden md:block bg-[#1A1D21] text-text-primary p-4 rounded-b-lg opacity-0 transition-opacity duration-400 pointer-events-none shadow-lg';
  
  const playButton = infoPanel.querySelector('.play-button');
  
  playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    setTimeout(() => {
      window.history.pushState(null, null, `/${mediaType}/${item.id}?w=true`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 50);
  });
  
  if (displayProgressData) {
    
    if (displayProgressData.continueText) {
      const continueTextElement = document.createElement('div');
      continueTextElement.className = 'hidden md:block text-sm font-bold text-text-primary absolute m-2 bottom-0 z-[3]';
      continueTextElement.style.textShadow = '0 0 0.5rem #000';
      continueTextElement.innerHTML = displayProgressData.statusText 
        ? `${displayProgressData.continueText} <span class="font-light">(${displayProgressData.statusText})</span>`
        : displayProgressData.continueText;
      card.appendChild(continueTextElement);
    }
    
  }
  
  if (displayProgressData) {
    const progressBar = document.createElement('div');
    progressBar.className = 'absolute inset-x-0 bottom-0 h-1.5 bg-[#666] rounded-b-lg';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'h-full bg-text-primary rounded-b-lg';
    progressFill.style.width = `${displayProgressData.percentage}%`;
    
    progressBar.appendChild(progressFill);
    card.appendChild(progressBar);
  }
  
  let hoverTimeout;
  let currentInfoPanel = null;

  const showInfoPanel = () => {
    clearTimeout(hoverTimeout);

    document.querySelectorAll('.carousel-info-popup.visible').forEach(panel => {
      if (panel !== infoPanel) {
        panel.classList.remove('visible');
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-6px) scale(0.95)';
        panel.style.pointerEvents = 'none';
        panel.addEventListener('transitionend', () => panel.remove(), { once: true });
      }
    });

    card.style.transform = 'scale(1.05)';
    card.style.zIndex = '10';
    card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
    card.style.borderBottomLeftRadius = '0';
    card.style.borderBottomRightRadius = '0';

    if (!document.body.contains(infoPanel)) {
      const rect = card.getBoundingClientRect();
      infoPanel.style.width = `${rect.width * 1.05}px`;
      infoPanel.style.left = `${rect.left + window.scrollX - (rect.width * 0.05 / 2)}px`;
      infoPanel.style.top = `${rect.bottom + window.scrollY}px`;
      infoPanel.style.opacity = '0';
      infoPanel.style.transform = 'translateY(-6px) scale(0.95)';
      document.body.appendChild(infoPanel);
      
      infoPanel.offsetHeight;
      
      currentInfoPanel = infoPanel;
    }

    setTimeout(() => {
      infoPanel.classList.add('visible');
      infoPanel.style.opacity = '1';
      infoPanel.style.transform = 'translateY(4.2px) scale(1)';
      infoPanel.style.pointerEvents = 'auto';
    }, 2);

    if (removeButton) {
        removeButton.classList.remove('opacity-0');
        removeButton.classList.add('opacity-100');
    }
  };

  const hideInfoPanel = () => {
     hoverTimeout = setTimeout(() => {
        card.style.transform = 'scale(1)';
        card.style.zIndex = '1';
        card.style.boxShadow = 'none';
        card.style.borderBottomLeftRadius = '0.5rem';
        card.style.borderBottomRightRadius = '0.5rem';

        if (currentInfoPanel) {
          currentInfoPanel.classList.remove('visible');
          currentInfoPanel.style.opacity = '0';
          currentInfoPanel.style.transform = 'translateY(-6px) scale(0.95)';
          currentInfoPanel.style.pointerEvents = 'none';
          
          const panelToRemove = currentInfoPanel;
          panelToRemove.addEventListener('transitionend', () => {
              if (!panelToRemove.classList.contains('visible')) {
                  panelToRemove.remove();
              }
          }, { once: true });
          currentInfoPanel = null;
        }

        if (removeButton) {
            removeButton.classList.remove('opacity-100');
            removeButton.classList.add('opacity-0');
        }
    }, 150);
  };

  const pageChangeHandler = () => {
    if (currentInfoPanel) {
      currentInfoPanel.remove();
      currentInfoPanel = null;
    }
  };

  window.addEventListener('popstate', pageChangeHandler);
  window.addEventListener('pushstate', pageChangeHandler);
  
  const cleanupListeners = () => {
    window.removeEventListener('popstate', pageChangeHandler);
    window.removeEventListener('pushstate', pageChangeHandler);
  };
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === card) {
          cleanupListeners();
          observer.disconnect();
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  let removeButton = null;
  if (onRemove) {
    removeButton = document.createElement('button');
    removeButton.className = 'absolute top-2 right-2 bg-black bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center text-text-primary z-20 opacity-0 transition-opacity duration-400';
    removeButton.innerHTML = '×';
    removeButton.style.fontSize = '18px';
    
    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(item.id, mediaType);
    });
    
    card.appendChild(removeButton);
    
  }

  card.addEventListener('mouseenter', showInfoPanel);
  card.addEventListener('mouseleave', hideInfoPanel);
  
  const attachPanelListeners = () => {
    infoPanel.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
    });
    infoPanel.addEventListener('mouseleave', hideInfoPanel);
  };

  attachPanelListeners();

  card.addEventListener('click', () => {
    setTimeout(() => {
      window.history.pushState(null, null, `/${mediaType}/${item.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 200);
  });
  
  return card;
}

function getWatchProgress(id) {
  // look for any timestamp keys for the anime
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(`quickwatch_timestamp_${id}_`)
  );
  
  if (keys.length === 0) return null;
  
  const key = keys[0];
  
  try {
    const data = JSON.parse(localStorage.getItem(key));
    
    if (data && typeof data.current === 'number' && typeof data.full === 'number') {
      const percentage = Math.min(Math.round((data.current / data.full) * 100), 100);
      const remainingSeconds = Math.max(0, data.full - data.current);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      
      return {
        percentage,
        remainingMinutes,
        current: data.current,
        full: data.full
      };
    }
  } catch (e) {
    console.error('Error parsing watch progress:', e);
  }
  
  return null;
}