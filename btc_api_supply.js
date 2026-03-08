/**
 * Consulta el suministro de Bitcoin usando la API pública de Blockchain.info.
 * No requiere un nodo propio.
 */

async function getBtcCirculation() {
    const url = "https://blockchain.info/q/totalbc";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.statusText}`);
        }

        const satoshisStr = await response.text();
        const satoshis = parseInt(satoshisStr, 10);

        // 1 BTC = 100,000,000 Satoshis
        const btc = satoshis / 100_000_000;

        console.log(`Consultando suministro de Bitcoin mediante API pública (Blockchain.info)...`);
        console.log(`Suministro total en circulación: ${btc.toLocaleString('es-ES', { minimumFractionDigits: 2 })} BTC`);

    } catch (error) {
        console.error("Error consultando la API:", error.message);
    }
}

// Ejecutar la función
getBtcCirculation();
