from zeep import Client

# Configuración del cliente SOAP
wsdl_url = 'http://localhost:51073/Service1.svc?wsdl'  # Cambia esta URL al WSDL de tu servicio SOAP
client = Client(wsdl_url)

def get_all_products():
    try:
        # Realiza la llamada al servicio SOAP que interactúa con el Gateway
        response = client.service.GetAllProducts()
        print("Respuesta de GetAllProducts:")
        
        # Asegúrate de que la respuesta es una lista de productos
        if isinstance(response, list):
            for product in response:
                # Se asume que la respuesta ya es un objeto de producto
                print(f"ID: {product.Id}, Nombre: {product.Nombre}, Precio: {product.Precio}, Stock: {product.Stock}, Activo: {product.Status}")
        else:
            print("La respuesta no es una lista de productos.")
    except Exception as e:
        print(f"Error en GetAllProducts: {e}")

def get_product_by_id():
    try:
        # Solicita el ID del producto desde el usuario
        product_id = input("Ingrese el ID del producto: ")

        # Verifica que el ID sea un número entero
        if not product_id.isdigit():
            print("El ID debe ser un número entero.")
            return
        
        # Convertimos el ID a entero
        product_id = int(product_id)
        
        # Realiza la llamada al servicio SOAP para obtener el producto por ID
        response = client.service.GetProductById(id=product_id)
        
        # Asegúrate de que la respuesta es un solo producto
        if response:
            print(f"ID: {response.Id}, Nombre: {response.Nombre}, Precio: {response.Precio}, Stock: {response.Stock}, Activo: {response.Status}")
        else:
            print(f"No se encontró el producto con ID {product_id}.")
    except Exception as e:
        print(f"Error en GetProductById: {e}")

def validate_products():
    try:
        # Solicita los IDs separados por comas
        ids_input = input("IDs separados por comas: ")
        
        # Convierte los IDs a una lista de enteros
        ids = [int(id.strip()) for id in ids_input.split(",")]
        
        # Realiza la llamada al servicio SOAP para validar los productos
        response = client.service.ValidateProducts(ids=ids)
        
        # Muestra el resultado de la validación
        if response:
            print("Productos validados exitosamente.")
            for product in response:
                print(f"ID: {product.Id}, Nombre: {product.Nombre}, Precio: {product.Precio}, Stock: {product.Stock}, Activo: {product.Status}")
        else:
            print("No se encontraron productos válidos para los IDs proporcionados.")
    except ValueError:
        print("Los IDs deben ser números enteros válidos.")
    except Exception as e:
        print(f"Error en ValidateProducts: {e}")

def main():
    while True:
        print("\n1. Obtener todos los productos")
        print("2. Obtener producto por ID")
        print("3. Validar productos por IDs")
        print("4. Salir")
        
        # Solicita al usuario que seleccione una opción
        option = input("Seleccione una opción: ")
        
        if option == "1":
            get_all_products()
        elif option == "2":
            get_product_by_id()
        elif option == "3":
            validate_products()
        elif option == "4":
            print("Saliendo...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

if __name__ == "__main__":
    main()
