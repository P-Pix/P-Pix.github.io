/**
 * Budget Interactif CUCLM 2020 - Version Optimisée
 * Visualisation interactive des données budgétaires
 */

class BudgetInteractiveCUCLM {
    constructor() {
        this.map = null;
        this.markersGroup = null;
        this.budgetData = null;
        this.carteData = null;
        this.selectedCommune = null;
        this.currentView = 'map';
        this.filters = {
            fonction: 'all',
            type: 'all'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.initMap();
            this.initControls();
            this.updateVisualizations();
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
        
        this.map = L.map('map', {
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
            const montant = Math.abs(this.selectedAmount(ville.budget));
            if (montant === 0) return;
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
                        <p><strong>💰 ${this.selectedAmountLabel()}:</strong> ${this.formatMontant(this.selectedAmount(ville.budget))}</p>
                        <p><strong>📈 Recettes:</strong> ${this.formatMontant(ville.budget.recettes)}</p>
                        <p><strong>📉 Dépenses:</strong> ${this.formatMontant(ville.budget.depenses)}</p>
                        <p><strong>⚖️ Solde:</strong> ${this.formatMontant(ville.budget.delta)}</p>
                        <p><strong>🏛️ Fonctions:</strong> ${ville.fonctions.length}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            
            // Ajouter un événement de clic pour mettre à jour les détails
            marker.on('click', () => {
                this.updateVilleInfo(ville);
            });
            
            marker.addTo(this.markersGroup);
        });
    }

    updateVilleInfo(ville) {
        this.selectedCommune = ville.nom;
        const nomElement = document.getElementById('commune-nom');
        const detailsElement = document.getElementById('commune-details');
        
        if (nomElement) {
            nomElement.textContent = `🏛️ ${ville.nom}`;
        }
        
        if (detailsElement) {
            detailsElement.innerHTML = `
                <div class="commune-detail">
                    <span class="detail-label">👥 Population:</span>
                    <span class="detail-value">${ville.population.toLocaleString('fr-FR')}</span>
                </div>
                <div class="commune-detail">
                    <span class="detail-label">💰 ${this.selectedAmountLabel()}:</span>
                    <span class="detail-value">${this.formatMontant(this.selectedAmount(ville.budget))}</span>
                </div>
                <div class="commune-detail">
                    <span class="detail-label">📈 Recettes:</span>
                    <span class="detail-value">${this.formatMontant(ville.budget.recettes)}</span>
                </div>
                <div class="commune-detail">
                    <span class="detail-label">📉 Dépenses:</span>
                    <span class="detail-value">${this.formatMontant(ville.budget.depenses)}</span>
                </div>
                <div class="commune-detail">
                    <span class="detail-label">⚖️ Solde:</span>
                    <span class="detail-value">${this.formatMontant(ville.budget.delta)}</span>
                </div>
                <div class="commune-detail">
                    <span class="detail-label">🏛️ Fonctions:</span>
                    <span class="detail-value">${ville.fonctions.length}</span>
                </div>
            `;
        }

        // Mettre à jour le top communes
        this.updateTopCommunes();
    }

    updateFonctionsList(fonctions) {
        // Mettre à jour le select des fonctions
        const fonctionSelect = document.getElementById('fonction-filter');
        if (fonctionSelect) {
            // Garder l'option "Toutes les fonctions"
            const currentValue = fonctionSelect.value;
            fonctionSelect.innerHTML = '<option value="all">Toutes les fonctions</option>';
            
            // Conserver la liste globale, même après sélection d'une commune.
            fonctions.forEach(fonction => {
                const option = document.createElement('option');
                option.value = fonction.code;
                option.textContent = `${fonction.code} - ${fonction.nom}`;
                fonctionSelect.appendChild(option);
            });
            
            // Restaurer la valeur sélectionnée si possible
            if (currentValue !== 'all') {
                fonctionSelect.value = currentValue;
            }
        }
    }

    updateTopCommunes() {
        const topElement = document.getElementById('top-communes');
        if (!topElement || !this.carteData) return;

        // Trier selon le montant actuellement sélectionné.
        const sortedCommunes = [...this.carteData]
            .filter(ville => this.selectedAmount(ville.budget) !== 0)
            .sort((a, b) => this.selectedAmount(b.budget) - this.selectedAmount(a.budget))
            .slice(0, 5);

        if (!sortedCommunes.length) {
            topElement.textContent = 'Aucun montant pour cette sélection.';
            return;
        }

        topElement.innerHTML = sortedCommunes.map((commune, index) => `
            <div class="commune-rank">
                <span class="rank">#${index + 1}</span>
                <span>${commune.nom}</span>
                <span class="detail-value">${this.formatMontant(this.selectedAmount(commune.budget))}</span>
            </div>
        `).join('');
    }

    initControls() {
        this.updateFonctionsList(this.budgetData.fonctions);
        // Reset
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
            this.updateVisualizations();
        });

        // Filtres
        document.getElementById('fonction-filter').addEventListener('change', (e) => {
            this.filters.fonction = e.target.value;
            this.updateVisualizations();
        });

        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.updateVisualizations();
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'map') {
            document.getElementById('view-map').classList.add('active');
        } else {
            document.getElementById('view-charts').classList.add('active');
        }

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
        const budgets = this.carteData.map(v => this.selectedAmount(v.budget));
        
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
            title: `${this.selectedAmountLabel()} par commune`,
            xaxis: { title: 'Communes' },
            yaxis: { title: 'Budget (€)' },
            margin: { l: 60, r: 30, t: 50, b: 100 }
        };

        Plotly.newPlot('chart-budget-communes', data, layout, {responsive: true});
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
                fonctionsMap.set(key, fonctionsMap.get(key) + this.selectedAmount(fonction));
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
            title: `${this.selectedAmountLabel()} par fonction`,
            margin: { l: 30, r: 30, t: 50, b: 30 }
        };

        this.renderAmountChart('chart-budget-fonctions', data, layout, values);
    }

    createBudgetTypesChart() {
        let totalRecettes = 0;
        let totalDepenses = 0;
        
        this.carteData.forEach(ville => {
            totalRecettes += ville.budget.recettes;
            totalDepenses += ville.budget.depenses;
        });

        const selectedTypes = this.filters.type === 'all' ? [0, 1] : [this.filters.type === 'recettes' ? 0 : 1];
        const data = [{
            x: selectedTypes.map(index => ['Recettes', 'Dépenses'][index]),
            y: selectedTypes.map(index => [totalRecettes, totalDepenses][index]),
            type: 'bar',
            marker: {
                color: selectedTypes.map(index => ['#27ae60', '#e74c3c'][index])
            }
        }];

        const layout = {
            title: this.filters.type === 'all' ? 'Recettes vs Dépenses' : this.selectedAmountLabel(),
            yaxis: { title: 'Montant (€)' },
            margin: { l: 60, r: 30, t: 50, b: 50 }
        };

        Plotly.newPlot('chart-recettes-depenses', data, layout, {responsive: true});
    }

    createSunburstChart() {
        // Créer un sunburst hiérarchique: Ville > Fonction
        const labels = [];
        const parents = [];
        const values = [];
        
        // Ajouter le niveau racine
        labels.push('CUCLM');
        parents.push('');
        values.push(this.selectedTotal());
        
        // Ajouter les villes
        this.carteData.forEach(ville => {
            labels.push(ville.nom);
            parents.push('CUCLM');
            values.push(this.selectedAmount(ville.budget));
            
            // Ajouter les fonctions de chaque ville
            ville.fonctions.forEach(fonction => {
                const fonctionLabel = `${fonction.nom} (${ville.nom})`;
                labels.push(fonctionLabel);
                parents.push(ville.nom);
                values.push(Math.abs(this.selectedAmount(fonction)));
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

        this.renderAmountChart('chart-sunburst', data, layout, values);
    }

    updateSummary() {
        if (!this.budgetData) return;

        const totalBudget = this.selectedTotal();
        const nbCommunes = this.carteData.length;
        
        // Calculer le total des fonctions
        const fonctionsSet = new Set();
        this.carteData.forEach(ville => {
            ville.fonctions.forEach(fonction => {
                fonctionsSet.add(fonction.code);
            });
        });

        document.getElementById('total-budget').textContent = 
            this.formatMontant(totalBudget);
        document.getElementById('total-communes').textContent = 
            nbCommunes;
        document.getElementById('total-fonctions').textContent = 
            fonctionsSet.size;

        const label = document.getElementById('total-budget').parentElement.querySelector('.stat-label');
        if (label) label.textContent = `💰 ${this.selectedAmountLabel()}`;
    }

    updateVisualizations() {
        this.carteData = this.filteredCities();
        this.addMapMarkers();
        this.initCharts();
        this.updateSummary();
        this.updateTopCommunes();
        this.refreshSelectedCommune();
    }

    filteredCities() {
        return this.budgetData.villes.flatMap(ville => {
            if (this.filters.fonction === 'all') return [ville];
            const fonctions = ville.fonctions.filter(fonction => String(fonction.code) === this.filters.fonction);
            if (!fonctions.length) return [];
            const budget = { total: 0, recettes: 0, depenses: 0 };
            fonctions.forEach(fonction => {
                Object.keys(budget).forEach(key => { budget[key] += fonction[key]; });
            });
            budget.delta = budget.recettes - budget.depenses;
            return [{ ...ville, fonctions, budget }];
        });
    }

    selectedAmount(budget) {
        return this.filters.type === 'all' ? budget.total : budget[this.filters.type];
    }

    selectedAmountLabel() {
        if (this.filters.type === 'recettes') return 'Recettes sélectionnées';
        if (this.filters.type === 'depenses') return 'Dépenses sélectionnées';
        return this.filters.fonction === 'all' ? 'Budget total' : 'Montant de la fonction';
    }

    selectedTotal() {
        return this.carteData.reduce((total, ville) => total + this.selectedAmount(ville.budget), 0);
    }

    renderAmountChart(id, data, layout, values) {
        if (values.some(value => value !== 0)) {
            Plotly.newPlot(id, data, layout, { responsive: true });
            return;
        }
        const annotations = [{ text: 'Aucun montant pour cette sélection.', showarrow: false,
            x: 0.5, y: 0.5, xref: 'paper', yref: 'paper' }];
        Plotly.newPlot(id, [], { ...layout, annotations }, { responsive: true });
    }

    refreshSelectedCommune() {
        if (!this.selectedCommune) return;
        const ville = this.carteData.find(item => item.nom === this.selectedCommune);
        if (ville) {
            this.updateVilleInfo(ville);
            return;
        }
        this.selectedCommune = null;
        document.getElementById('commune-nom').textContent = 'Sélectionnez une commune';
        document.getElementById('commune-details').textContent = 'Cliquez sur une commune pour consulter les montants de la sélection.';
    }

    resetFilters() {
        this.filters = {
            fonction: 'all',
            type: 'all'
        };

        document.getElementById('fonction-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
    }

    formatMontant(montant) {
        if (Math.abs(montant) >= 1000000) {
            return `${(montant / 1000000).toFixed(2)} M€`;
        } else if (Math.abs(montant) >= 1000) {
            return `${(montant / 1000).toFixed(0)} k€`;
        } else {
            return `${montant.toFixed(0)} €`;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <span>⚠️</span>
            <span>${message}</span>
        `;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialiser le dashboard au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new BudgetInteractiveCUCLM();
});
