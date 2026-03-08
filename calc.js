/**
 * Calculator Logic v2
 * Centralized rate management and dynamic calculation.
 */

const rates = {
    BTC: 1,
    SAT: 100000000,
    // Rates relative to BTC will be populated here
};

// Configuration for precision and symbols
const config = {
    CNY: { symbol: '¥', name: 'Yuan Chino', type: 'fiat', digits: 4, flag: 'cn' },
    USD: { symbol: '$', name: 'Dólar US', type: 'fiat', digits: 4, flag: 'us' },
    EUR: { symbol: '€', name: 'Euro', type: 'fiat', digits: 4, flag: 'eu' },
    CAD: { symbol: 'C$', name: 'Dólar Canadiense', type: 'fiat', digits: 2, flag: 'ca' },
    BRL: { symbol: 'R$', name: 'Real Brasileño', type: 'fiat', digits: 2, flag: 'br' },
    COP: { symbol: '$', name: 'Peso Colombiano', type: 'fiat', digits: 2, flag: 'co' },
    VES_YADIO: { symbol: 'Bs', name: 'VES (Yadio)', type: 'fiat', digits: 2, flag: 've' },
    VES_CMC: { symbol: 'Bs', name: 'VES (CMC)', type: 'fiat', digits: 2, flag: 've' },
    ARS: { symbol: '$', name: 'Peso Argentino', type: 'fiat', digits: 2, flag: 'ar' },
    CLP: { symbol: '$', name: 'Peso Chileno', type: 'fiat', digits: 2, flag: 'cl' },
    MXN: { symbol: '$', name: 'Peso Mexicano', type: 'fiat', digits: 2, flag: 'mx' },
    GBP: { symbol: '£', name: 'Libra Esterlina', type: 'fiat', digits: 2, flag: 'gb' },
    // Cryptos
    ETH: { symbol: 'Ξ', name: 'Ethereum', type: 'crypto', digits: 8 },
    DOGE: { symbol: 'Ð', name: 'Dogecoin', type: 'crypto', digits: 8 },
    LTC: { symbol: 'Ł', name: 'Litecoin', type: 'crypto', digits: 8 },
    XMR: { symbol: 'ɱ', name: 'Monero', type: 'crypto', digits: 8 },
    DASH: { symbol: 'D', name: 'Dash', type: 'crypto', digits: 8 },
    ADA: { symbol: '₳', name: 'Cardano', type: 'crypto', digits: 8 },
    SOL: { symbol: '☀️', name: 'Solana', type: 'crypto', digits: 8 },
    SUI: { symbol: '💧', name: 'Sui', type: 'crypto', digits: 8 },
    XRP: { symbol: '✖️', name: 'XRP', type: 'crypto', digits: 8 },
    BNB: { symbol: '🔸', name: 'BNB', type: 'crypto', digits: 8 },
    AVAX: { symbol: '❄️', name: 'Avalanche', type: 'crypto', digits: 8 },
    POL: { symbol: '💜', name: 'Polygon (POL)', type: 'crypto', digits: 8 },
    YFI: { symbol: 'YFI', name: 'yearn.finance', type: 'crypto', digits: 8 },
    TRX: { symbol: 'TRX', name: 'TRON', type: 'crypto', digits: 8 },
    SAT: { symbol: 'sat', name: 'Satoshi', type: 'btc', digits: 0 },
    BTC: { symbol: '₿', name: 'Bitcoin', type: 'btc', digits: 8 }
};

async function updateSupply() {
    const supplyNowElement = document.getElementById('btc-supply-now');
    const url = "https://blockchain.info/q/totalbc";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al conectar con la API');

        const satoshisStr = await response.text();
        const btc = parseFloat(satoshisStr) / 100_000_000;

        supplyNowElement.innerText = btc.toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

    } catch (error) {
        console.error("Error updating supply:", error);
        supplyNowElement.innerText = "Error";
    }

    // Programar la siguiente actualización aleatoria
    const randomMs = Math.floor(Math.random() * (150000 - 60000 + 1)) + 60000;
    setTimeout(updateSupply, randomMs);
}

// Map CMC indices to our keys
const mapping = {
    USD: '2781', EUR: '2790', VES_CMC: '3573', CAD: '2784', BRL: '2783',
    COP: '2820', ARS: '2821', CLP: '2786', CNY: '2787', MXN: '2824', GBP: '2791',
    ETH: '1027', DOGE: '74', LTC: '2', XMR: '328', DASH: '131',
    ADA: '2010', YFI: '5864', TRX: '1958', SOL: '5426', SUI: '20947',
    XRP: '52', BNB: '1839', AVAX: '5805', POL: '28321'
};

async function fetchYadioRates() {
    try {
        const res = await fetch('https://api.yadio.io/exrates/USD');
        const data = await res.json();
        if (data && data.USD && data.USD.VES) {
            rates.VES_EXRATE = data.USD.VES; // USD/VES from Yadio
            console.log("Yadio Rate updated (USD/VES):", rates.VES_EXRATE);
            // Calculate BTC price in VES via Yadio: (1 BTC in USD) * (1 USD in VES)
            if (rates.USD) {
                rates.VES_YADIO = rates.USD * rates.VES_EXRATE;
            }
        }
    } catch (error) {
        console.error("Error fetching Yadio rates:", error);
    }
}

// Visibility management
let visibility = {};

function initVisibility() {
    const saved = localStorage.getItem('currencyVisibility');
    if (saved) {
        visibility = JSON.parse(saved);
        // Ensure new currencies are included if they were added later
        for (const id in config) {
            if (visibility[id] === undefined) visibility[id] = true;
        }
    } else {
        // Default: all visible
        for (const id in config) {
            visibility[id] = true;
        }
    }
    applyVisibility();
    populateVisibilityList();
}

function applyVisibility() {
    for (const id in config) {
        const inputRow = document.getElementById(id)?.parentElement;
        if (inputRow && inputRow.classList.contains('input-row')) {
            if (visibility[id]) {
                inputRow.style.display = 'flex';
            } else {
                inputRow.style.display = 'none';
            }
        }
    }
}

function populateVisibilityList() {
    const list = document.getElementById('visibility-list');
    if (!list) return;
    list.innerHTML = '';

    const groups = {
        fiat: { title: 'Gubernamentales', items: [] },
        crypto: { title: 'Criptoactivos', items: [] },
        btc: { title: 'Bitcoin', items: [] }
    };

    for (const id in config) {
        groups[config[id].type].items.push(id);
    }

    ['fiat', 'crypto', 'btc'].forEach(groupKey => {
        const group = groups[groupKey];
        if (group.items.length === 0) return;

        // Header
        const header = document.createElement('div');
        header.className = 'group-header';
        header.innerText = group.title;
        list.appendChild(header);

        group.items.sort().forEach(id => {
            const item = document.createElement('div');
            item.className = 'visibility-item';
            const checked = visibility[id] ? 'checked' : '';
            const conf = config[id];

            let iconHtml = '';
            if (conf.flag) {
                iconHtml = `<img src="https://flagcdn.com/${conf.flag}.svg" class="mini-flag">`;
            } else {
                iconHtml = `<span class="mini-icon">${conf.symbol}</span>`;
            }

            item.innerHTML = `
                <input type="checkbox" id="vis-${id}" ${checked}>
                ${iconHtml}
                <span>${conf.name} (${id})</span>
            `;

            item.onclick = (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const cb = item.querySelector('input');
                    cb.checked = !cb.checked;
                    toggleCurrency(id, cb.checked);
                }
            };

            item.querySelector('input').onchange = (e) => {
                toggleCurrency(id, e.target.checked);
            };

            list.appendChild(item);
        });
    });
}

function toggleCurrency(id, isVisible) {
    visibility[id] = isVisible;
    localStorage.setItem('currencyVisibility', JSON.stringify(visibility));
    applyVisibility();
}

// UI Controls
function setupSettingsListeners() {
    const trigger = document.getElementById('settings-trigger');
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    const closeBtn = document.getElementById('close-settings');
    const suggestBtn = document.getElementById('suggest-btn');

    const toggle = () => {
        panel.classList.toggle('open');
        overlay.classList.toggle('show');
    };

    if (trigger) trigger.onclick = toggle;
    if (overlay) overlay.onclick = toggle;
    if (closeBtn) closeBtn.onclick = toggle;

    if (suggestBtn) {
        suggestBtn.onclick = () => {
            alert("¡Gracias por tu interés! Estamos preparando un formulario para recibir tus sugerencias. Por ahora, puedes contactar al administrador directamente.");
        };
    }
}

async function fetchRates() {
    try {
        // Fetching from CMC widget API (as in old code)
        const res = await fetch('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=1&convert_id=1,2781,2790,3573,2784,2783,2820,2821,2786,2787,1053,3133,74,1027,1697,328,131,2010,2,1169,1230,3718,2280,1298,5864,1958,5426,20947,52,1839,5805,28321,2824,2791');
        const data = await res.json();
        const quotes = data.data['1'].quote;

        for (const [key, id] of Object.entries(mapping)) {
            if (quotes[id]) {
                rates[key] = quotes[id].price;
            }
        }

        // Fetch Yadio for professional VES rates
        await fetchYadioRates();

        console.log("Rates updated:", rates);

        // Restore previous state or default to USD 1
        const savedBase = localStorage.getItem('lastBaseId') || 'USD';
        const savedValue = localStorage.getItem('lastBaseValue') || '1';

        const baseInput = document.getElementById(savedBase);
        if (baseInput) {
            baseInput.value = savedValue;
            updateAllFields(savedBase);
        } else {
            updateAllFields('USD');
        }

        updateSummary(); // Update static reference cards
    } catch (error) {
        console.error("Error fetching rates:", error);
    }
}

function updateAllFields(sourceId) {
    const inputElement = document.getElementById(sourceId);
    if (!inputElement) return;

    const sourceValue = parseFloat(inputElement.value) || 0;
    const sourceRateInBtc = (sourceId === 'BTC') ? 1 : (sourceId === 'SAT' ? 100000000 : rates[sourceId]);

    // BTC equivalent of the source input
    const btcAmount = sourceValue / sourceRateInBtc;

    for (const id in config) {
        if (id === sourceId) continue;
        const input = document.getElementById(id);
        if (!input) continue;

        let targetValue;
        if (id === 'BTC') {
            targetValue = btcAmount;
        } else if (id === 'SAT') {
            targetValue = btcAmount * 100000000;
        } else {
            targetValue = btcAmount * rates[id];
        }

        const digits = config[id]?.digits ?? 2;
        input.value = targetValue.toFixed(digits);
    }
}

function updateSummary() {
    const elUsd = document.getElementById('summary-usd');
    const elEur = document.getElementById('summary-eur');
    const elUsdSat = document.getElementById('summary-usdsat');
    const elVesat = document.getElementById('summary-vesat');
    const elSatves = document.getElementById('summary-satves');
    const elVesDiff = document.getElementById('summary-vesdiff');

    if (elUsd) elUsd.innerText = (rates.USD || 0).toLocaleString();
    if (elEur) elEur.innerText = (rates.EUR || 0).toLocaleString();

    if (rates.USD) {
        const satPerUsd = 100000000 / rates.USD;
        if (elUsdSat) elUsdSat.innerText = satPerUsd.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    // Summary cards use Yadio as the "market" reference
    if (rates.VES_YADIO) {
        const satPriceInVes = rates.VES_YADIO / 100000000;
        if (elVesat) elVesat.innerText = satPriceInVes.toFixed(6);
        if (elSatves) elSatves.innerText = (1 / satPriceInVes).toLocaleString(undefined, { maximumFractionDigits: 0 });

        // Calculate difference with CMC if available
        if (rates.VES_CMC && elVesDiff) {
            const diffPct = ((rates.VES_YADIO - rates.VES_CMC) / rates.VES_CMC) * 100;
            const sign = diffPct >= 0 ? '+' : '';
            elVesDiff.innerText = `${sign}${diffPct.toFixed(2)}%`;

            // Add visual feedback based on spread
            if (Math.abs(diffPct) > 5) {
                elVesDiff.style.color = '#ff4d4d'; // Red if high spread
            } else {
                elVesDiff.style.color = 'var(--primary-gold)';
            }
        }
    }
}

// Event Listeners
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
        const id = e.target.id;
        const val = e.target.value;

        updateAllFields(id);

        // Save to localStorage for persistence
        localStorage.setItem('lastBaseId', id);
        localStorage.setItem('lastBaseValue', val);
    }
});

// Init
fetchRates();
updateSupply();
initVisibility();
setupSettingsListeners();
setInterval(fetchRates, 60000);
