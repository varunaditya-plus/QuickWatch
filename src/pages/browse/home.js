// Home Page
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../../router.js';
import { renderHeader } from '../../components/header.js';
import { createCarouselItem } from '../../components/carouselItem.js';
import { showToast } from '../../components/toast.js';

export function renderHomePage(container) {
  container.innerHTML = `
    ${renderHeader()}
    
    <div class="pb-32 md:pb-64">
      <div id="hero-section" class="h-[700px] w-full flex items-end justify-end relative">
        <div class="absolute inset-x-0 md:inset-x-auto md:left-[4.4rem] text-text-primary z-[6] flex flex-col items-center md:items-start opacity-0" style="transform: translateY(30px);">
          <img id="logo" class="w-[250px] md:w-[400px] opacity-0" style="transform: translateY(20px);">
          <span id="overview" class="text-[14px] md:text-[18px] mt-4 w-[80%] md:w-[37%] line-clamp-3 md:line-clamp-2 font-light text-center md:text-left">
            Peter Parker is on his way to becoming a hero, but his path to get there is anything but ordinary.
          </span>
          <div class="flex flex-row gap-4 mt-4 text-text-primary">
            <button id="watch-now-btn" class="px-4 py-2 md:px-6 md:py-4 rounded-lg bg-button-primary text-lg md:text-xl pagebtn font-medium opacity-0">Watch now</button>
            <button id="info-btn" class="w-[2.75rem] h-[2.75rem] md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-button-primary text-2xl md:text-3xl flex items-center justify-center pagebtn font-medium opacity-0"><i class="icon-info"></i></button>
            <button id="add-watchlist-btn" class="w-[2.75rem] h-[2.75rem] md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-button-primary text-3xl md:text-4xl flex items-center justify-center pagebtn font-medium opacity-0"><i class="icon-plus"></i></button>
          </div>
        </div>
        <div class="absolute inset-y-0 left-0 w-full md:w-[50%] bg-gradient-to-r from-background-primary to-transparent z-[3]"></div>
        <div class="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-background-primary to-transparent z-[3]"></div>
        <img id="herobk" class="h-[700px] w-full md:w-full object-cover items-center ml-auto opacity-0">
      </div>
      
      <div class="bg-background-primary">
        <div class="mt-12 md:mt-24">
          <h2 class="text-xl md:text-2xl text-text-primary mb-4 ml-4 md:ml-[4.4rem] font-medium">Continue watching</h2>
          <div id="continue-watching" class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-text-primary mb-4 ml-4 md:ml-[4.4rem] font-medium">Trending Movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="trending-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-text-primary mb-4 ml-4 md:ml-[4.4rem] font-medium">Trending TV Shows</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="trending-tv"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-text-primary mb-4 ml-4 md:ml-[4.4rem] font-medium">Top rated movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="top-rated-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-text-primary mb-4 ml-4 md:ml-[4.4rem] font-medium">Popular movies</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="popular-movies"></div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl md:text-2xl text-text-primary mb-4 ml-4 md:ml-[4.4rem] font-medium">Popular TV shows</h2>
          <div class="movie-carousel flex flex-row gap-4 overflow-x-auto pb-4 pl-4" data-category="popular-tv"></div>
        </div>
      </div>
    </div>
  `;
  
  fetchAllCategories();
  initButtonListeners();
}

async function fetchAllCategories() {
  try {
    await loadContinueWatching();
    
    const isMobile = window.innerWidth < 768;
    
    const categories = [
      {
        url: `${TMDB_BASE_URL}/trending/movie/week?language=en-US&append_to_response=images,content_ratings,release_dates&include_image_language=en`,
        selector: '[data-category="trending-movies"]',
        updateHero: true
      },
      {
        url: `${TMDB_BASE_URL}/trending/tv/week?language=en-US&append_to_response=images,content_ratings,release_dates&include_image_language=en`,
        selector: '[data-category="trending-tv"]'
      },
      {
        url: `${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=1&append_to_response=images,content_ratings,release_dates&include_image_language=en`,
        selector: '[data-category="top-rated-movies"]'
      },
      {
        url: `${TMDB_BASE_URL}/movie/popular?language=en-US&page=1&append_to_response=images,content_ratings,release_dates&include_image_language=en`,
        selector: '[data-category="popular-movies"]'
      },
      {
        url: `${TMDB_BASE_URL}/tv/popular?language=en-US&page=1&append_to_response=images,content_ratings,release_dates&include_image_language=en`,
        selector: '[data-category="popular-tv"]'
      }
    ];

    for (const category of categories) {
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': TMDB_API_KEY
        }
      };

      const response = await fetch(category.url, options);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        if (category.updateHero) {
          const detailUrl = `${TMDB_BASE_URL}/${data.results[0].media_type || 'movie'}/${data.results[0].id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`;
          const detailResponse = await fetch(detailUrl, options);
          const detailData = await detailResponse.json();
          
          updateHeroSection({...detailData, media_type: data.results[0].media_type || 'movie'});
        }
        
        const detailedResults = await Promise.all(
          data.results.slice(0, 10).map(async (item) => {
            const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            const detailUrl = `${TMDB_BASE_URL}/${mediaType}/${item.id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`;
            const detailResponse = await fetch(detailUrl, options);
            return {...await detailResponse.json(), media_type: mediaType};
          })
        );
        
        const carousel = document.querySelector(category.selector);
        if (carousel) {
          updateMovieCarousel(detailedResults, carousel, isMobile);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

async function loadContinueWatching() {
  const continueWatchingContainer = document.querySelector('#continue-watching');
  if (!continueWatchingContainer) {
    return;
  }
  
  const isMobile = window.innerWidth < 768;
  
  const continueWatchingItems = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
  
  const groupedItems = continueWatchingItems.reduce((acc, item) => {
    const key = `${item.id}_${item.mediaType}`;
    if (!acc[key]) {
      acc[key] = item;
    } else {
      // Update if the timestamp is more recent
      if (item.timestamp > acc[key].timestamp) {
        acc[key] = item;
      }
    }
    return acc;
  }, {});

  if (Object.keys(groupedItems).length === 0) {
    const sectionTitle = continueWatchingContainer.previousElementSibling;
    if (sectionTitle) {
      sectionTitle.style.display = 'none';
    }
    continueWatchingContainer.style.display = 'none';
    return;
  }

  const sectionTitle = continueWatchingContainer.previousElementSibling;
  if (sectionTitle) {
    sectionTitle.style.display = 'block';
  }
  continueWatchingContainer.style.display = 'flex';
  
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': TMDB_API_KEY
    }
  };
  
  let index = 0;
  for (const item of Object.values(groupedItems)) {
    const response = await fetch(`${TMDB_BASE_URL}/${item.mediaType}/${item.id}?append_to_response=images,content_ratings,release_dates&language=en-US&include_image_language=en`, options);
    
    if (response.ok) {
      const detailData = await response.json();
      detailData.media_type = item.mediaType;
      
      // Add progress information to detailData
      detailData.progress = item.watchedDuration / item.fullDuration;
      detailData.timestamp = item.timestamp;
      
      // Use the season and episode directly from continue watching data
      if (item.mediaType === 'tv') {
        detailData.season = item.season || 1;
        detailData.episode = item.episode || 1;
      }
      
      const removeCallback = (id, mediaType) => {
        removeFromContinueWatching(id, mediaType);
        
        if (continueWatchingContainer.contains(carouselItem)) {
          carouselItem.remove();
          
          if (continueWatchingContainer.children.length === 0) {
            const sectionTitle = continueWatchingContainer.previousElementSibling;
            if (sectionTitle) {
              sectionTitle.style.display = 'none';
            }
            continueWatchingContainer.style.display = 'none';
          }
        }
      };
      
      const progressData = {
        percentage: (item.watchedDuration / item.fullDuration) * 100,
        watchedDuration: item.watchedDuration,
        fullDuration: item.fullDuration
      };
      
      if (item.mediaType === 'tv') {
        if (item.watchedDuration > 0) {
          progressData.continueText = `Continue Episode ${item.episode}`;
          progressData.statusText = `${Math.round((item.fullDuration - item.watchedDuration) / 60)}min left`;
        } else {
          progressData.continueText = `Start Episode ${item.episode}`;
        }
      } else {
        if (item.watchedDuration > 0) {
          progressData.continueText = 'Continue Watching';
          const remainingMinutes = Math.round((item.fullDuration - item.watchedDuration) / 60);
          if (remainingMinutes >= 60) {
            const hours = Math.floor(remainingMinutes / 60);
            const minutes = remainingMinutes % 60;
            progressData.statusText = `${hours}h${minutes}m left`;
          } else {
            progressData.statusText = `${remainingMinutes}min left`;
          }
        } else {
          progressData.continueText = 'Play movie';
          progressData.statusText = '';
        }
      }
      
      const episodeInfo = item.mediaType === 'tv' ? 
        { season: detailData.season, episode: detailData.episode } : null;
      
      const carouselItem = createCarouselItem(
        detailData, 
        index === 0, 
        'continue-watching', 
        removeCallback, 
        isMobile,
        progressData,
        episodeInfo
      );
      
      carouselItem.style.opacity = '0';
      carouselItem.style.transform = 'translateY(20px)';
      continueWatchingContainer.appendChild(carouselItem);
      
      setTimeout(() => {
        carouselItem.style.opacity = '1';
        carouselItem.style.transform = 'translateY(0)';
      }, 50 * index);
      
      index++;
    }
  }
}

function removeFromContinueWatching(id, mediaType) {
  const continueWatchingItems = JSON.parse(localStorage.getItem('quickwatch-continue') || '[]');
  const updatedItems = continueWatchingItems.filter(item => { return !(String(item.id) === String(id) && item.mediaType === mediaType); });
  localStorage.setItem('quickwatch-continue', JSON.stringify(updatedItems));
}

function updateMovieCarousel(items, carousel, usePoster = false) {
  carousel.innerHTML = '';
  
  items.forEach((item, index) => {
    const carouselItem = createCarouselItem(item, index === 0, 'carousel', null, usePoster);
    if (carouselItem) {
      carouselItem.style.opacity = '0';
      carouselItem.style.transform = 'translateY(20px)';
      carousel.appendChild(carouselItem);
      
      setTimeout(() => {
        carouselItem.style.opacity = '1';
        carouselItem.style.transform = 'translateY(0)';
      }, 50 * index);
    }
  });
}

async function updateHeroSection(item) {
  const heroBackground = document.querySelector('#herobk');
  const overview = document.querySelector('#overview');
  const studioLogo = document.querySelector('#logo');
  const heroSection = document.querySelector('#hero-section');
  const heroContent = heroSection.querySelector('.absolute.inset-x-0');
  const watchNowBtn = document.querySelector('#watch-now-btn');
  const infoBtn = document.querySelector('#info-btn');
  const addWatchlistBtn = document.querySelector('#add-watchlist-btn');
  
  const isMobile = window.innerWidth < 768;
  
  try {
    if (item.images && item.images.logos && item.images.logos.length > 0) {
      const logo = item.images.logos.find(l => l.iso_639_1 === 'en') || item.images.logos[0];
      studioLogo.src = `${TMDB_IMAGE_BASE_URL}original${logo.file_path}`;
      studioLogo.style.display = 'block';
    } else {
      studioLogo.style.display = 'none';
      
      const titleElement = document.createElement('h1');
      titleElement.className = 'text-4xl font-bold opacity-0';
      titleElement.style.transform = 'translateY(20px)';
      titleElement.textContent = item.title || item.name;
      
      studioLogo.parentNode.insertBefore(titleElement, studioLogo);
      
      requestAnimationFrame(() => {
        titleElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        titleElement.style.opacity = '1';
        titleElement.style.transform = 'translateY(0)';
      });
    }
    
    // Use poster for mobile and backdrop for desktop
    if (isMobile && item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    } else if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    }
    
    heroBackground.alt = item.title || item.name;
    
    heroBackground.onload = () => {
      heroBackground.style.transition = 'opacity 0.6s ease';
      heroBackground.style.opacity = '1';
      
      requestAnimationFrame(() => {
        heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
        
        if (studioLogo.style.display !== 'none') {
          requestAnimationFrame(() => {
            studioLogo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            studioLogo.style.opacity = '1';
            studioLogo.style.transform = 'translateY(0)';
          });
        }
        
        if (watchNowBtn) {
          requestAnimationFrame(() => {
            watchNowBtn.style.transition = 'opacity 0.4s ease';
            watchNowBtn.style.opacity = '1';
          });
        }
        
        if (infoBtn) {
          setTimeout(() => {
            infoBtn.style.transition = 'opacity 0.4s ease';
            infoBtn.style.opacity = '1';
          }, 50);
        }
        
        if (addWatchlistBtn) {
          setTimeout(() => {
            addWatchlistBtn.style.transition = 'opacity 0.4s ease';
            addWatchlistBtn.style.opacity = '1';
          }, 100);
        }
      });
    };
    
  } catch (error) {
    console.error('Error updating hero section:', error);
    studioLogo.style.display = 'none';
    
    if (isMobile && item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    } else if (item.backdrop_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.backdrop_path}`;
      heroBackground.classList.remove('object-contain');
    } else if (item.poster_path) {
      heroBackground.src = `${TMDB_IMAGE_BASE_URL}original${item.poster_path}`;
      heroBackground.classList.add('object-contain');
    }
    
    heroBackground.style.transition = 'opacity 0.6s ease';
    heroBackground.style.opacity = '1';
    
    requestAnimationFrame(() => {
      heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    });
  }
      
  overview.textContent = item.overview || 'No description available';
  
  heroSection.dataset.mediaType = item.media_type;
  heroSection.dataset.id = item.id;
}

function initButtonListeners() {
  const watchNowButton = document.querySelector('#watch-now-btn');
  if (watchNowButton) {
    watchNowButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        window.history.pushState(null, null, `/${mediaType}/${id}?w=true`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }
  
  const infoButton = document.querySelector('#info-btn');
  if (infoButton) {
    infoButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        window.history.pushState(null, null, `/${mediaType}/${id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }
  
  const addWatchlistButton = document.querySelector('#add-watchlist-btn');
  if (addWatchlistButton) {
    addWatchlistButton.addEventListener('click', () => {
      const heroSection = document.querySelector('#hero-section');
      const mediaType = heroSection.dataset.mediaType;
      const id = heroSection.dataset.id;
      
      if (mediaType && id) {
        const watchlist = JSON.parse(localStorage.getItem('quickwatch-watchlist') || '[]');
        
        const existingItem = watchlist.find(item => item.id === id && item.mediaType === mediaType);
        
        if (!existingItem) {
          const heroBackground = document.querySelector('#herobk');
          const title = document.querySelector('#overview').textContent;
          
          watchlist.push({
            id,
            mediaType,
            title,
            posterPath: heroBackground.src,
            dateAdded: new Date().toISOString()
          });
          
          localStorage.setItem('quickwatch-watchlist', JSON.stringify(watchlist));
          showToast('Added to watchlist', 'success');
        } else {
          showToast('Already in your watchlist!', 'error');
        }
      }
    });
  }
}