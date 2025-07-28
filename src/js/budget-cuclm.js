/**
 * Budget Interactif CUCLM 2020
 * Visualisation interactive des données budgétaires
 */

class BudgetInteractiveCUCLM {
    constructor() {
        this.map = null;
        this.markersGroup = null;
        this.budgetData = null;
        this.carteData = null;
        this.currentView = 'map';
        this.filters = {
            section: 'all',
            type: 'all',
            montant: 0
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.initMap();
            this.initControls();
            this.initCharts();
            this.updateSummary();
            this.addMapMarkers();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement du dashboard budgétaire');
        }
    }

    async loadData() {
        try {
            // Charger les nouvelles données optimisées
            const budgetResponse = await fetch('../../budget-cuclm-optimized-final.json');
            
            if (!budgetResponse.ok) {
                throw new Error('Erreur de chargement des données');
            }
            
            const data = await budgetResponse.json();
            this.budgetData = data;
            this.carteData = data.villes; // Les villes pour la carte
            
            console.log('✅ Données optimisées chargées:', {
                metadata: data.metadata,
                nb_communes: data.metadata.nb_communes,
                budget_total: data.metadata.budget_total
            });
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    initMap() {
        // Coordonnées centrées sur Caen
        const caenCenter = [49.1829, -0.3707];
        
        this.map = L.map('budget-map', {
            center: caenCenter,
            zoom: 11,
            zoomControl: false
        });

        // Contrôle de zoom
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Couche de base
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Groupe pour les marqueurs
        this.markersGroup = L.layerGroup().addTo(this.map);
    }

    addMapMarkers() {
        if (!this.carteData) return;

        this.markersGroup.clearLayers();

        this.carteData.forEach(ville => {
            const montant = Math.abs(ville.budget.total);
            const isDeficitaire = ville.budget.delta < 0;
            
            // Taille du marqueur basée sur le montant
            const radius = Math.max(8, Math.min(30, Math.log(montant + 1) * 2));
            
            // Couleur selon le déficit/excédent
            const color = isDeficitaire ? '#e74c3c' : '#27ae60';
            
            const marker = L.circleMarker(ville.coordonnees, {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            });

            const popupContent = `
                <div class="budget-popup">
                    <h3>🏛️ ${ville.nom}</h3>
                    <div class="popup-details">
                        <p><strong>👥 Population:</strong> ${ville.population.toLocaleString('fr-FR')}</p>
                        <p><strong>💰 Budget Total:</strong> ${this.formatMontant(ville.budget.total)}</p>
                        <p><strong>📈 Recettes:</strong> ${this.formatMontant(ville.budget.recettes)}</p>
                        <p><strong>📉 Dépenses:</strong> ${this.formatMontant(ville.budget.depenses)}</p>
                        <p><strong>⚖️ Solde:</strong> ${this.formatMontant(ville.budget.delta)}</p>
                        <p><strong>🏛️ Fonctions:</strong> ${ville.fonctions.length}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(this.markersGroup);
        });
    }

    passesFilters(item) {
        // Filtre par section
        if (this.filters.section !== 'all') {
            // Nous n'avons pas directement la section dans carteData, on suppose qu'elle correspond au type
            if (this.filters.section === 'FONCTIONNEMENT' && item.NATURE_CODE.startsWith('2')) return false;
            if (this.filters.section === 'INVESTISSEMENT' && !item.NATURE_CODE.startsWith('2')) return false;
        }

        // Filtre par type
        if (this.filters.type !== 'all' && item.TYPE_MOUVEMENT_LIBELLE !== this.filters.type) {
            return false;
        }

        // Filtre par montant
        if (Math.abs(item.MONTANT_TOTAL) < this.filters.montant) {
            return false;
        }

        return true;
    }

    formatMontant(montant) {
        if (Math.abs(montant) >= 1000000) {
            return `${(montant / 1000000).toFixed(2)} M€`;
        } else if (Math.abs(montant) >= 1000) {
            return `${(montant / 1000).toFixed(0)} k€`;
        } else {
            return `${montant.toFixed(2)} €`;
        }
    }

    initControls() {
        // Boutons de vue
        document.getElementById('view-map').addEventListener('click', () => {
            this.switchView('map');
        });

        document.getElementById('view-charts').addEventListener('click', () => {
            this.switchView('charts');
        });

        // Filtres
        document.getElementById('section-filter').addEventListener('change', (e) => {
            this.filters.section = e.target.value;
            this.updateVisualizations();
        });

        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.updateVisualizations();
        });

        document.getElementById('montant-filter').addEventListener('input', (e) => {
            this.filters.montant = parseInt(e.target.value);
            document.getElementById('montant-value').textContent = this.formatMontant(this.filters.montant);
            this.updateVisualizations();
        });

        // Reset
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetFilters();
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons
        document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');
        
        // Afficher/masquer les conteneurs
        document.querySelectorAll('.viz-container').forEach(container => {
            container.classList.remove('active');
        });
        
        if (view === 'map') {
            document.getElementById('map-container').classList.add('active');
            // Redimensionner la carte après affichage
            setTimeout(() => {
                if (this.map) this.map.invalidateSize();
            }, 100);
        } else {
            document.getElementById('charts-container').classList.add('active');
        }
    }

    async initCharts() {
        try {
            if (!this.budgetData || !this.carteData) return;
            
            // Créer les graphiques avec les nouvelles données
            this.createVillesChart();
            this.createFonctionsChart();
            this.createBudgetTypesChart();
            this.createSunburstChart();
            
        } catch (error) {
            console.error('Erreur lors de la création des graphiques:', error);
        }
    }

    createVillesChart() {
        const villes = this.carteData.map(v => v.nom);
        const budgets = this.carteData.map(v => v.budget.total);
        
        const data = [{
            x: villes,
            y: budgets,
            type: 'bar',
            marker: {
                color: '#3498db',
                opacity: 0.8
            }
        }];

        const layout = {
            title: 'Budget par Ville',
            xaxis: { title: 'Villes' },
            yaxis: { title: 'Budget (€)' },
            margin: { l: 60, r: 30, t: 50, b: 100 }
        };

        Plotly.newPlot('chart-chapitres', data, layout, {responsive: true});
    }

    createFonctionsChart() {
        // Agréger les données par fonction
        const fonctionsMap = new Map();
        
        this.carteData.forEach(ville => {
            ville.fonctions.forEach(fonction => {
                const key = `${fonction.code} - ${fonction.nom}`;
                if (!fonctionsMap.has(key)) {
                    fonctionsMap.set(key, 0);
                }
                fonctionsMap.set(key, fonctionsMap.get(key) + fonction.total);
            });
        });

        const labels = Array.from(fonctionsMap.keys());
        const values = Array.from(fonctionsMap.values());

        const data = [{
            labels: labels,
            values: values,
            type: 'pie',
            hole: 0.4,
            textinfo: 'label+percent',
            textposition: 'outside'
        }];

        const layout = {
            title: 'Répartition par Fonction',
            margin: { l: 30, r: 30, t: 50, b: 30 }
        };

        Plotly.newPlot('chart-fonctions', data, layout, {responsive: true});
    }

    createBudgetTypesChart() {
        let totalRecettes = 0;
        let totalDepenses = 0;
        
        this.carteData.forEach(ville => {
            totalRecettes += ville.budget.recettes;
            totalDepenses += ville.budget.depenses;
        });

        const data = [{
            x: ['Recettes', 'Dépenses'],
            y: [totalRecettes, totalDepenses],
            type: 'bar',
            marker: {
                color: ['#27ae60', '#e74c3c']
            }
        }];

        const layout = {
            title: 'Recettes vs Dépenses',
            yaxis: { title: 'Montant (€)' },
            margin: { l: 60, r: 30, t: 50, b: 50 }
        };

        Plotly.newPlot('chart-budget-types', data, layout, {responsive: true});
    }

    createSunburstChart() {
        // Créer un sunburst hiérarchique: Ville > Fonction
        const labels = [];
        const parents = [];
        const values = [];
        
        // Ajouter le niveau racine
        labels.push('CUCLM');
        parents.push('');
        values.push(this.budgetData.metadata.budget_total);
        
        // Ajouter les villes
        this.carteData.forEach(ville => {
            labels.push(ville.nom);
            parents.push('CUCLM');
            values.push(ville.budget.total);
            
            // Ajouter les fonctions de chaque ville
            ville.fonctions.forEach(fonction => {
                const fonctionLabel = `${fonction.nom} (${ville.nom})`;
                labels.push(fonctionLabel);
                parents.push(ville.nom);
                values.push(Math.abs(fonction.total));
            });
        });

        const data = [{
            type: 'sunburst',
            labels: labels,
            parents: parents,
            values: values,
            branchvalues: 'total',
            leaf: {opacity: 0.8},
            marker: {line: {width: 2}}
        }];

        const layout = {
            title: 'Hiérarchie Ville-Fonction',
            margin: { l: 0, r: 0, t: 50, b: 0 }
        };

        Plotly.newPlot('chart-sunburst', data, layout, {responsive: true});
    }
        const data = [{
            type: 'bar',
            x: this.budgetData.top_chapitres.map(c => Math.abs(c.MONTANT_TOTAL)),
            y: this.budgetData.top_chapitres.map(c => c.CHAPITRE_LIBELLE.substring(0, 40) + '...'),
            orientation: 'h',
            marker: {color: '#3498db'}
        }];

        const layout = {
            title: "Top Chapitres",
            xaxis: {title: "Montant (€)"},
            margin: {l: 200, r: 20, t: 30, b: 50}
        };

        Plotly.newPlot(container, data, layout, {responsive: true});
    }

    createFonctionsChart(container) {
        const data = [{
            type: 'scatter',
            x: this.budgetData.fonctions.map(f => f.FONCTION),
            y: this.budgetData.fonctions.map(f => Math.abs(f.MONTANT_TOTAL)),
            mode: 'markers',
            marker: {
                size: this.budgetData.fonctions.map(f => Math.log(Math.abs(f.MONTANT_TOTAL) + 1) * 2),
                color: this.budgetData.fonctions.map(f => f.TYPE_MOUVEMENT_LIBELLE === 'DEPENSE' ? '#e74c3c' : '#27ae60')
            }
        }];

        const layout = {
            title: "Fonctions Budgétaires",
            xaxis: {title: "Code Fonction"},
            yaxis: {title: "Montant (€)"}
        };

        Plotly.newPlot(container, data, layout, {responsive: true});
    }

    createBudgetTypesChart(container) {
        // Graphique simple avec les données de summary
        const data = [{
            type: 'bar',
            x: ['Dépenses', 'Recettes'],
            y: [this.budgetData.summary.total_depenses, this.budgetData.summary.total_recettes],
            marker: {color: ['#e74c3c', '#27ae60']}
        }];

        const layout = {
            title: "Dépenses vs Recettes",
            yaxis: {title: "Montant (€)"}
        };

        Plotly.newPlot(container, data, layout, {responsive: true});
    }

    updateSummary() {
        if (!this.budgetData) return;

        // Calculer les totaux depuis les métadonnées
        const totalBudget = this.budgetData.metadata.budget_total;
        const nbCommunes = this.budgetData.metadata.nb_communes;
        
        // Calculer le total des recettes et dépenses
        let totalRecettes = 0;
        let totalDepenses = 0;
        
        this.carteData.forEach(ville => {
            totalRecettes += ville.budget.recettes;
            totalDepenses += ville.budget.depenses;
        });

        document.getElementById('total-depenses').textContent = 
            this.formatMontant(totalDepenses);
        document.getElementById('total-recettes').textContent = 
            this.formatMontant(totalRecettes);
        document.getElementById('nb-lignes').textContent = 
            `${nbCommunes} communes`;
    }

    updateVisualizations() {
        this.addMapMarkers();
        // Ici on pourrait aussi mettre à jour les graphiques selon les filtres
    }

    resetFilters() {
        this.filters = {
            section: 'all',
            type: 'all',
            montant: 0
        };

        document.getElementById('section-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('montant-filter').value = '0';
        document.getElementById('montant-value').textContent = '0 €';

        this.updateVisualizations();
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.budgetInstance = new BudgetInteractiveCUCLM();
});

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    setTimeout(() => {
        if (window.budgetInstance && window.budgetInstance.map) {
            window.budgetInstance.map.invalidateSize();
        }
    }, 100);
});
