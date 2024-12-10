import logging
from zeep import Client
from zeep.transports import Transport
from zeep.exceptions import Fault, TransportError, XMLSyntaxError

# Configuración de logs
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("soap_client.log"),
        logging.StreamHandler()
    ]
)

# Configuración del cliente SOAP con transporte
wsdl_url = 'http://localhost:51073/Service1.svc?wsdl'  # Cambia esta URL al WSDL de tu servicio SOAP
client = Client(wsdl_url, transport=Transport(timeout=10))

def get_all_products():
    try:
        logging.info("Intentando obtener todos los productos...")
        response = client.service.GetAllProducts()
        logging.debug(f"Respuesta recibida: {response}")
        
        print("Respuesta de GetAllProducts:")
        if isinstance(response, list):
            for product in response:
                print(f"ID: {product['Id']}, Nombre: {product['Nombre']}, Precio: {product['Precio']}, Stock: {product['Stock']}, Activo: {product['Status']}")
        else:
            print("La respuesta no es una lista de productos.")
    except Fault as fault:
        logging.error(f"Error de servicio en GetAllProducts: {fault}")
    except TransportError as te:
        logging.error(f"Error de transporte en GetAllProducts: {te}")
    except Exception as e:
        logging.error(f"Error desconocido en GetAllProducts: {e}")

def get_product_by_id():
    try:
        product_id = input("Ingrese el ID del producto: ")
        
        if not product_id.isdigit():
            print("El ID debe ser un número entero.")
            return
        
        product_id = int(product_id)
        logging.info(f"Intentando obtener el producto con ID {product_id}...")
        response = client.service.GetProductById(product_id)
        logging.debug(f"Respuesta recibida: {response}")
        
        if response:
            print(f"ID: {response['Id']}, Nombre: {response['Nombre']}, Precio: {response['Precio']}, Stock: {response['Stock']}, Activo: {response['Status']}")
        else:
            print(f"No se encontró el producto con ID {product_id}.")
    except Fault as fault:
        logging.error(f"Error de servicio en GetProductById: {fault}")
    except TransportError as te:
        logging.error(f"Error de transporte en GetProductById: {te}")
    except Exception as e:
        logging.error(f"Error desconocido en GetProductById: {e}")

def get_products_with_stock():
    try:
        logging.info("Intentando obtener productos con stock...")
        response = client.service.GetProductsWithStock()
        logging.debug(f"Respuesta recibida: {response}")
        
        print("Respuesta de GetProductsWithStock:")
        if isinstance(response, list):
            for product in response:
                print(f"ID: {product['Id']}, Nombre: {product['Nombre']}, Stock: {product['Stock']}")
        else:
            print("La respuesta no es una lista de productos con stock.")
    except Fault as fault:
        logging.error(f"Error de servicio en GetProductsWithStock: {fault}")
    except TransportError as te:
        logging.error(f"Error de transporte en GetProductsWithStock: {te}")
    except Exception as e:
        logging.error(f"Error desconocido en GetProductsWithStock: {e}")

def find_low_stock_products():
    try:
        min_stock = input("Ingrese el stock mínimo: ")
        
        if not min_stock.isdigit():
            print("El stock mínimo debe ser un número entero.")
            return
        
        min_stock = int(min_stock)
        logging.info(f"Intentando buscar productos con stock menor o igual a {min_stock}...")
        response = client.service.FindLowStockProducts(min_stock)
        logging.debug(f"Respuesta recibida: {response}")
        
        print("Respuesta de FindLowStockProducts:")
        if isinstance(response, list):
            for product in response:
                print(f"ID: {product['Id']}, Nombre: {product['Nombre']}, Stock: {product['Stock']}")
        else:
            print("La respuesta no es una lista de productos.")
    except Fault as fault:
        logging.error(f"Error de servicio en FindLowStockProducts: {fault}")
    except TransportError as te:
        logging.error(f"Error de transporte en FindLowStockProducts: {te}")
    except Exception as e:
        logging.error(f"Error desconocido en FindLowStockProducts: {e}")

def main():
    while True:
        print("\n1. Obtener todos los productos")
        print("2. Obtener producto por ID")
        print("3. Obtener productos con stock")
        print("4. Buscar productos con bajo stock")
        print("5. Salir")
        
        option = input("Seleccione una opción: ")
        
        if option == "1":
            get_all_products()
        elif option == "2":
            get_product_by_id()
        elif option == "3":
            get_products_with_stock()
        elif option == "4":
            find_low_stock_products()
        elif option == "5":
            print("Saliendo...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

if __name__ == "__main__":
    main()
