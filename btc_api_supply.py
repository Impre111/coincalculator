import requests

def get_btc_circulation_api():
    """
    Consulta el suministro de Bitcoin usando la API pública de Blockchain.info.
    No requiere un nodo propio.
    """
    url = "https://blockchain.info/q/totalbc"
    
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        
        # El valor devuelto es en Satoshis (1 BTC = 100,000,000 Satoshis)
        satoshis = int(response.text)
        btc = satoshis / 100_000_000
        return btc
    except Exception as e:
        print(f"Error consultando la API: {e}")
        return None

if __name__ == "__main__":
    print("Consultando suministro de Bitcoin mediante API pública (Blockchain.info)...")
    supply = get_btc_circulation_api()
    
    if supply:
        print(f"Suministro total en circulación: {supply:,.2f} BTC")
    else:
        print("No se pudo obtener la información.")
