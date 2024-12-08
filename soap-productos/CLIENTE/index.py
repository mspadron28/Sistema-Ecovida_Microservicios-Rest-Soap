from zeep import Client

# Configuración del cliente SOAP
wsdl_url = 'http://localhost:51073/Service1.svc?wsdl'  # Cambia esta URL al WSDL de tu servicio SOAP
client = Client(wsdl_url)

def get_all_products():
    try:
        response = client.service.GetAllProducts()
        print("Respuesta de GetAllProducts:")
        
        if isinstance(response, list):
            for product in response:
                print(f"ID: {product['Id']}, Nombre: {product['Nombre']}, Precio: {product['Precio']}, Stock: {product['Stock']}, Activo: {product['Status']}")
        else:
            print("La respuesta no es una lista de productos.")
    except Exception as e:
        print(f"Error en GetAllProducts: {e}")

def get_product_by_id():
    try:
        product_id = input("Ingrese el ID del producto: ")
        
        if not product_id.isdigit():
            print("El ID debe ser un número entero.")
            return
        
        product_id = int(product_id)
        response = client.service.GetProductById(product_id)
        
        if response:
            print(f"ID: {response['Id']}, Nombre: {response['Nombre']}, Precio: {response['Precio']}, Stock: {response['Stock']}, Activo: {response['Status']}")
        else:
            print(f"No se encontró el producto con ID {product_id}.")
    except Exception as e:
        print(f"Error en GetProductById: {e}")

def get_products_with_stock():
    try:
        response = client.service.GetProductsWithStock()
        print("Respuesta de GetProductsWithStock:")
        
        if isinstance(response, list):
            for product in response:
                print(f"ID: {product['Id']}, Nombre: {product['Nombre']}, Stock: {product['Stock']}")
        else:
            print("La respuesta no es una lista de productos con stock.")
    except Exception as e:
        print(f"Error en GetProductsWithStock: {e}")

def find_low_stock_products():
    try:
        min_stock = input("Ingrese el stock mínimo: ")
        
        if not min_stock.isdigit():
            print("El stock mínimo debe ser un número entero.")
            return
        
        min_stock = int(min_stock)
        response = client.service.FindLowStockProducts(min_stock)
        
        print("Respuesta de FindLowStockProducts:")
        if isinstance(response, list):
            for product in response:
                print(f"ID: {product['Id']}, Nombre: {product['Nombre']}, Stock: {product['Stock']}")
        else:
            print("La respuesta no es una lista de productos.")
    except Exception as e:
        print(f"Error en FindLowStockProducts: {e}")

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
