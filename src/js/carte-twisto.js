/**
 * Carte Interactive TWISTO
 * Affichage et recherche des arrêts du réseau de transport TWISTO à Caen
 */

class CarteInteractiveTWISTO {
    constructor() {
        this.map = null;
        this.markersGroup = null;
        this.stops = [];
        this.currentStyle = 'light';
        this.searchResults = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadStopsData();
            this.initMap();
            this.addMarkers();
            this.initSearch();
            this.initControls();
            this.updateStats();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement de la carte');
        }
    }

    async loadStopsData() {
        try {
            const response = await fetch('../js/twisto-stops-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.stops = await response.json();
            console.log(`${this.stops.length} arrêts chargés`);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    initMap() {
        // Coordonnées centrées sur Caen
        const caenCenter = [49.1829, -0.3707];
        
        this.map = L.map('twisto-map', {
            center: caenCenter,
            zoom: 12,
            zoomControl: false
        });

        // Contrôle de zoom personnalisé
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Couche de base (style sombre par défaut)
        this.setMapStyle(this.currentStyle);

        // Groupe pour les marqueurs
        this.markersGroup = L.layerGroup().addTo(this.map);

        // Gestionnaires d'événements pour optimiser l'affichage
        this.map.on('zoomend moveend', () => {
            if (this.stops.length > 1000) {
                this.addMarkers(); // Recalculer les marqueurs visibles
            }
        });
    }

    setMapStyle(style) {
        // Supprimer la couche existante
        this.map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });

        let tileLayer;
        if (style === 'dark') {
            tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            });
        } else {
            tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
        }
        
        tileLayer.addTo(this.map);
        this.currentStyle = style;
    }

    addMarkers() {
        this.markersGroup.clearLayers();
        
        // Avec beaucoup de données, on optimise l'affichage
        const currentZoom = this.map.getZoom();
        const bounds = this.map.getBounds();
        
        // Filtrer les arrêts visibles pour optimiser les performances
        let visibleStops = this.stops;
        if (this.stops.length > 1000) {
            visibleStops = this.stops.filter(stop => 
                bounds.contains([stop.lat, stop.lon])
            );
            
            // Si trop peu d'arrêts visibles, prendre un échantillon
            if (visibleStops.length < 50 && currentZoom < 13) {
                visibleStops = this.stops.filter((stop, index) => index % 10 === 0);
            }
        }
        
        visibleStops.forEach(stop => {
            const marker = L.circleMarker([stop.lat, stop.lon], {
                radius: Math.max(4, Math.min(8, currentZoom - 8)),
                fillColor: '#ff6b35',
                color: '#ffffff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });

            marker.bindPopup(`
                <div class="popup-content">
                    <h3>${stop.name}</h3>
                    ${stop.id ? `<p><strong>ID:</strong> ${stop.id}</p>` : ''}
                    <p><strong>Coordonnées:</strong> ${stop.lat.toFixed(6)}, ${stop.lon.toFixed(6)}</p>
                </div>
            `);

            marker.addTo(this.markersGroup);
        });

        // Mettre à jour les statistiques
        this.updateStats(visibleStops.length);
    }

    initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const clearSearch = document.getElementById('clear-search');

        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                this.performSearch(query);
                this.displaySearchResults();
                clearSearch.style.display = 'block';
            } else {
                this.clearSearchResults();
                clearSearch.style.display = 'none';
            }
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.clearSearchResults();
            clearSearch.style.display = 'none';
            searchInput.focus();
        });
    }

    performSearch(query) {
        const normalizedQuery = this.normalizeString(query);
        
        this.searchResults = this.stops.filter(stop => {
            const normalizedName = this.normalizeString(stop.name);
            return normalizedName.includes(normalizedQuery);
        }).sort((a, b) => {
            const aName = this.normalizeString(a.name);
            const bName = this.normalizeString(b.name);
            const queryNorm = normalizedQuery;
            
            // Priorité pour les correspondances exactes au début
            if (aName.startsWith(queryNorm) && !bName.startsWith(queryNorm)) return -1;
            if (!aName.startsWith(queryNorm) && bName.startsWith(queryNorm)) return 1;
            
            return a.name.localeCompare(b.name);
        });
    }

    normalizeString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '');
    }

    displaySearchResults() {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (this.searchResults.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Aucun arrêt trouvé</div>';
            searchResults.style.display = 'block';
            return;
        }

        const maxResults = 10;
        const displayResults = this.searchResults.slice(0, maxResults);
        
        const resultsHTML = displayResults.map(stop => `
            <div class="search-result-item" data-lat="${stop.lat}" data-lon="${stop.lon}">
                <div class="result-name">${this.highlightSearchTerm(stop.name)}</div>
                <div class="result-coords">${stop.lat.toFixed(6)}, ${stop.lon.toFixed(6)}</div>
            </div>
        `).join('');

        if (this.searchResults.length > maxResults) {
            searchResults.innerHTML = resultsHTML + 
                `<div class="more-results">... et ${this.searchResults.length - maxResults} autres résultats</div>`;
        } else {
            searchResults.innerHTML = resultsHTML;
        }

        // Ajouter les événements de clic
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                this.zoomToLocation(lat, lon);
                this.clearSearchResults();
                document.getElementById('search-input').value = item.querySelector('.result-name').textContent;
            });
        });

        searchResults.style.display = 'block';
    }

    highlightSearchTerm(text) {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return text;

        const query = searchInput.value.trim();
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    clearSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
        }
        this.searchResults = [];
    }

    zoomToLocation(lat, lon) {
        this.map.setView([lat, lon], 16);
        
        // Créer un marqueur temporaire pour highlighter l'arrêt
        const tempMarker = L.circleMarker([lat, lon], {
            radius: 12,
            fillColor: '#ffff00',
            color: '#ff0000',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(this.map);

        // Supprimer le marqueur temporaire après 3 secondes
        setTimeout(() => {
            this.map.removeLayer(tempMarker);
        }, 3000);
    }

    initControls() {
        // Bouton de changement de style
        const styleToggle = document.getElementById('toggle-style');
        if (styleToggle) {
            styleToggle.addEventListener('click', () => {
                const newStyle = this.currentStyle === 'dark' ? 'light' : 'dark';
                this.setMapStyle(newStyle);
                
                styleToggle.innerHTML = newStyle === 'dark' 
                    ? '🌙 Style: Sombre'
                    : '☀️ Style: Clair';
            });
        }

        // Bouton de centrage sur Caen
        const centerBtn = document.getElementById('center-map');
        if (centerBtn) {
            centerBtn.addEventListener('click', () => {
                this.map.setView([49.1829, -0.3707], 12);
            });
        }

        // Bouton pour ajuster la vue
        const fitBoundsBtn = document.getElementById('fit-bounds');
        if (fitBoundsBtn) {
            fitBoundsBtn.addEventListener('click', () => {
                this.fitMapToStops();
            });
        }

        // Bouton plein écran
        const fullscreenBtn = document.getElementById('fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }

    fitMapToStops() {
        if (this.stops.length === 0) return;
        
        const group = new L.featureGroup(this.markersGroup.getLayers());
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    toggleFullscreen() {
        const mapContainer = document.getElementById('twisto-map');
        if (!mapContainer) return;

        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().then(() => {
                // Redimensionner la carte après passage en plein écran
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            });
        } else {
            document.exitFullscreen().then(() => {
                // Redimensionner la carte après sortie du plein écran
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            });
        }
    }

    locateUser() {
        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas supportée par ce navigateur.');
            return;
        }

        const locateBtn = document.getElementById('locateBtn');
        if (locateBtn) {
            locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localisation...';
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                this.map.setView([lat, lon], 15);
                
                // Ajouter un marqueur pour la position de l'utilisateur
                const userMarker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<i class="fas fa-user"></i>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(this.map);

                userMarker.bindPopup('Votre position').openPopup();

                if (locateBtn) {
                    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Me localiser';
                }
            },
            (error) => {
                console.error('Erreur de géolocalisation:', error);
                alert('Impossible de vous localiser. Vérifiez les autorisations de géolocalisation.');
                
                if (locateBtn) {
                    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Me localiser';
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    scrollToInfo() {
        const infoSection = document.getElementById('info-section');
        if (infoSection) {
            infoSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateStats(visibleCount = null) {
        const totalStopsElement = document.getElementById('total-stops');
        const visibleStopsElement = document.getElementById('visible-stops');
        
        if (totalStopsElement && this.stops.length > 0) {
            totalStopsElement.textContent = this.stops.length;
        }
        
        if (visibleStopsElement) {
            const displayCount = visibleCount !== null ? visibleCount : this.stops.length;
            visibleStopsElement.textContent = displayCount;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialisation de la carte au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.carteInstance = new CarteInteractiveTWISTO();
});

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    // Laisser un délai pour que le redimensionnement se termine
    setTimeout(() => {
        if (window.carteInstance && window.carteInstance.map) {
            window.carteInstance.map.invalidateSize();
        }
    }, 100);
});
