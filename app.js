async function updateSupply() {
    const supplyElement = document.getElementById('supply');
    const updateElement = document.getElementById('last-update');
    const url = "https://blockchain.info/q/totalbc";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al conectar con la API');

        const satoshisStr = await response.text();
        const btc = parseFloat(satoshisStr) / 100_000_000;

        // Formatear el número
        supplyElement.innerText = btc.toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        // Actualizar la hora
        const now = new Date();
        updateElement.innerText = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    } catch (error) {
        console.error(error);
        supplyElement.innerText = "Error";
    }

    // Programar la siguiente actualización en un rango de 1 a 2.5 minutos (60,000 a 150,000 ms)
    const randomMs = Math.floor(Math.random() * (150000 - 60000 + 1)) + 60000;
    console.log(`Próxima actualización en ${(randomMs / 60000).toFixed(2)} minutos`);
    setTimeout(updateSupply, randomMs);
}

// Cargar al inicio
updateSupply();
