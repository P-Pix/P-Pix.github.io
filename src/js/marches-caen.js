class CarteInteractiveMarchés {
    constructor() {
        this.map = null;
        this.markers = [];
        this.marchésData = [];
        this.currentStyle = 'default';
        this.selectedMarket = null;
        this.currentDay = new Date().getDay(); // 0 = Dimanche, 1 = Lundi, etc.
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.initMap();
        this.initControls();
        this.initSearch();
        this.initDayFilter();
        this.displayMarkets();
        this.updateStats();
        this.highlightCurrentDay();
    }

    async loadData() {
        try {
            const response = await fetch('../js/marches-caen-data.json');
            this.marchésData = await response.json();
            console.log(`${this.marchésData.length} marchés chargés`);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.marchésData = [];
        }
    }

    initMap() {
        // Centrer sur Caen
        this.map = L.map('map').setView([49.1829, -0.3707], 12);

        // Style par défaut
        this.setMapStyle('default');

        // Ajout de l'attribution
        this.map.attributionControl.addAttribution('Données: Ville de Caen');
    }

    setMapStyle(style) {
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }

        switch (style) {
            case 'satellite':
                this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri'
                });
                break;
            case 'dark':
                this.currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                });
                break;
            default:
                this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                });
        }

        this.currentTileLayer.addTo(this.map);
        this.currentStyle = style;
    }

    initControls() {
        // Toggle style
        document.getElementById('toggle-style').addEventListener('click', () => {
            this.toggleStyle();
        });

        // Voir tout
        document.getElementById('fit-bounds').addEventListener('click', () => {
            this.fitBounds();
        });

        // Marché actuel
        document.getElementById('current-market-btn').addEventListener('click', () => {
            this.goToCurrentMarket();
        });

        // Scroll vers les infos
        document.getElementById('scroll-to-info').addEventListener('click', () => {
            const infoSection = document.getElementById('info-section');
            if (infoSection) {
                infoSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    toggleStyle() {
        const styles = ['default', 'satellite', 'dark'];
        const currentIndex = styles.indexOf(this.currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        this.setMapStyle(styles[nextIndex]);
    }

    fitBounds() {
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers.filter(m => m.isVisible));
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    goToCurrentMarket() {
        const currentMarkets = this.marchésData.filter(marché => 
            marché.jour_num === this.currentDay && marché.statut === 'Actif'
        );

        const currentTime = new Date().getHours();
        
        // Trouver les marchés qui sont ouverts maintenant (approximatif)
        const openMarkets = currentMarkets.filter(marché => {
            // Extraire les heures d'ouverture de la description
            const match = marché.description.match(/(\d+)h/);
            if (match) {
                const openHour = parseInt(match[1]);
                return currentTime >= openHour && currentTime <= 14; // Approximation
            }
            return false;
        });

        if (openMarkets.length > 0) {
            const market = openMarkets[0];
            this.centerOnMarket(market);
            this.showMarketInfo(market);
        } else if (currentMarkets.length > 0) {
            // S'il n'y a pas de marché ouvert maintenant, montrer tous les marchés du jour
            this.filterByDay(this.currentDay);
            alert(`Aucun marché ouvert maintenant, mais ${currentMarkets.length} marché(s) aujourd'hui`);
        } else {
            alert('Aucun marché aujourd\'hui');
        }
    }

    centerOnMarket(marché) {
        this.map.setView([marché.lat, marché.lon], 16);
        
        // Mettre en surbrillance le marker
        const marker = this.markers.find(m => m.marchéData.code === marché.code);
        if (marker) {
            marker.openPopup();
        }
    }

    initSearch() {
        const searchBox = document.getElementById('search-box');
        searchBox.addEventListener('input', (e) => {
            this.filterMarkets(e.target.value);
        });
    }

    initDayFilter() {
        const dayButtons = document.querySelectorAll('.day-btn');
        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const day = btn.dataset.day;
                this.filterByDay(day === 'all' ? null : parseInt(day));
                
                // Mise à jour visuelle des boutons
                dayButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Activer "Tous" par défaut
        document.querySelector('.day-btn[data-day="all"]').classList.add('active');
    }

    highlightCurrentDay() {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayButtons = document.querySelectorAll('.day-btn');
        
        dayButtons.forEach(btn => {
            if (btn.dataset.day == this.currentDay) {
                const indicator = document.createElement('span');
                indicator.className = 'current-day-indicator';
                indicator.textContent = 'Aujourd\'hui';
                btn.appendChild(indicator);
            }
        });
    }

    filterMarkets(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filteredMarkets = this.marchésData.filter(marché =>
            marché.nom.toLowerCase().includes(term) ||
            marché.description.toLowerCase().includes(term) ||
            marché.jour.toLowerCase().includes(term)
        );
        
        this.updateMarkers(filteredMarkets);
        this.updateMarketList(filteredMarkets);
    }

    filterByDay(dayNum) {
        let filteredMarkets;
        
        if (dayNum === null) {
            filteredMarkets = this.marchésData;
        } else {
            filteredMarkets = this.marchésData.filter(marché => marché.jour_num === dayNum);
        }
        
        this.updateMarkers(filteredMarkets);
        this.updateMarketList(filteredMarkets);
        
        // Ajuster la vue si des marchés sont filtrés
        if (filteredMarkets.length > 0 && dayNum !== null) {
            setTimeout(() => this.fitBounds(), 100);
        }
    }

    displayMarkets() {
        this.updateMarkers(this.marchésData);
        this.updateMarketList(this.marchésData);
    }

    updateMarkers(markets) {
        // Supprimer les anciens markers
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];

        // Ajouter les nouveaux markers
        markets.forEach(marché => {
            const marker = this.createMarker(marché);
            marker.addTo(this.map);
            marker.isVisible = true;
            this.markers.push(marker);
        });
    }

    createMarker(marché) {
        // Couleur selon le jour
        const dayColors = {
            1: '#FF6B6B', // Lundi - Rouge
            2: '#4ECDC4', // Mardi - Turquoise
            3: '#45B7D1', // Mercredi - Bleu
            4: '#96CEB4', // Jeudi - Vert
            5: '#FFEAA7', // Vendredi - Jaune
            6: '#DDA0DD', // Samedi - Violet
            0: '#FFB347'  // Dimanche - Orange
        };

        const color = dayColors[marché.jour_num] || '#666';
        
        // Icône personnalisée
        const icon = L.divIcon({
            className: 'custom-market-marker',
            html: `<div style="
                background: ${color};
                width: 25px;
                height: 25px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                color: white;
            ">🛒</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([marché.lat, marché.lon], { icon });
        
        // Popup avec informations
        const popupContent = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: ${color};">${marché.nom}</h3>
                <p style="margin: 5px 0;"><strong>📅 ${marché.jour}</strong></p>
                <p style="margin: 5px 0;">${marché.description}</p>
                <hr style="margin: 10px 0;">
                <p style="margin: 5px 0;"><strong>👥 Commerçants:</strong> ${marché.commercants}</p>
                <p style="margin: 5px 0;"><strong>🥕 Alimentaires:</strong> ${marché.alimentaires}</p>
                <p style="margin: 5px 0;"><strong>🛍 Manufactures:</strong> ${marché.manufactures}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.marchéData = marché;
        
        marker.on('click', () => {
            this.selectMarket(marché);
        });
        
        return marker;
    }

    updateMarketList(markets) {
        const marketList = document.getElementById('market-list');
        marketList.innerHTML = '';

        markets.forEach(marché => {
            const item = document.createElement('div');
            item.className = 'market-item';
            item.innerHTML = `
                <div class="market-name">${marché.nom}</div>
                <div class="market-details">
                    <div>📅 ${marché.jour} - ${marché.description}</div>
                    <div class="market-stats">
                        <span>👥 ${marché.commercants}</span>
                        <span>🥕 ${marché.alimentaires}</span>
                        <span>🛍 ${marché.manufactures}</span>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectMarket(marché);
                this.centerOnMarket(marché);
            });
            
            marketList.appendChild(item);
        });
    }

    selectMarket(marché) {
        // Retirer la sélection précédente
        document.querySelectorAll('.market-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Sélectionner le nouveau marché
        const items = document.querySelectorAll('.market-item');
        items.forEach(item => {
            if (item.querySelector('.market-name').textContent === marché.nom) {
                item.classList.add('active');
            }
        });
        
        this.selectedMarket = marché;
    }

    showMarketInfo(marché) {
        const marker = this.markers.find(m => m.marchéData.code === marché.code);
        if (marker) {
            marker.openPopup();
        }
    }

    updateStats() {
        const totalMarkets = this.marchésData.length;
        const totalVendors = this.marchésData.reduce((sum, m) => sum + m.commercants, 0);
        const totalFood = this.marchésData.reduce((sum, m) => sum + m.alimentaires, 0);
        
        // Trouver le plus grand marché
        const biggestMarket = this.marchésData.reduce((biggest, current) => 
            current.commercants > biggest.commercants ? current : biggest
        , this.marchésData[0]);

        document.getElementById('total-markets').textContent = totalMarkets;
        document.getElementById('total-vendors').textContent = totalVendors;
        document.getElementById('total-food').textContent = totalFood;
        document.getElementById('biggest-market').textContent = biggestMarket ? biggestMarket.nom : '-';
    }
}

// Initialisation de la carte
document.addEventListener('DOMContentLoaded', () => {
    new CarteInteractiveMarchés();
});
