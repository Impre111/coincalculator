import json
import requests

def get_btc_circulation_rpc(rpc_user, rpc_password, rpc_host='127.0.0.1', rpc_port=8332):
    """
    Consulta a un nodo Bitcoin local o remoto mediante RPC.
    """
    url = f"http://{rpc_host}:{rpc_port}/"
    headers = {'content-type': 'application/json'}
    
    payload = {
        "method": "gettxoutsetinfo",
        "params": [],
        "jsonrpc": "2.0",
        "id": "btc-supply-query",
    }

    try:
        response = requests.post(
            url, 
            data=json.dumps(payload), 
            headers=headers, 
            auth=(rpc_user, rpc_password),
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        if 'result' in result:
            total_amount = result['result']['total_amount']
            height = result['result']['height']
            return total_amount, height
        else:
            return None, f"Error en la respuesta RPC: {result.get('error')}"
            
    except requests.exceptions.RequestException as e:
        return None, f"Error de conexión: {e}"

if __name__ == "__main__":
    # CONFIGURACIÓN: Cambia esto con los datos de tu bitcoin.conf
    RPC_USER = "tu_usuario"
    RPC_PASS = "tu_password"
    RPC_HOST = "127.0.0.1" 
    RPC_PORT = 8332

    print(f"Consultando nodo en {RPC_HOST}...")
    supply, info = get_btc_circulation_rpc(RPC_USER, RPC_PASS, RPC_HOST, RPC_PORT)
    
    if supply:
        print(f"Suministro total de Bitcoin: {supply} BTC")
        print(f"Altura del bloque (Block Height): {info}")
    else:
        print(f"No se pudo obtener el suministro. {info}")
