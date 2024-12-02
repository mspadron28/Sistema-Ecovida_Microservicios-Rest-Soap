using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using NATS.Client;

namespace soap_productos
{
    public class Service1 : IService1
    {
        private readonly IConnection _natsConnection;

        public Service1()
        {
            // Crear una conexión a NATS
            var options = ConnectionFactory.GetDefaultOptions();
            _natsConnection = new ConnectionFactory().CreateConnection("nats://localhost:4222"); // Cambia la URL si es necesario
        }

        public List<Product> GetAllProducts()
        {
            try
            {
                // Enviar un mensaje de NATS al microservicio para obtener todos los productos
                var message = _natsConnection.Request("findAllProductos", null);
                var json = message.Data;

                // Convertir byte[] a string
                string jsonString = System.Text.Encoding.UTF8.GetString(json);

                // Verificar que el mensaje no esté vacío
                if (string.IsNullOrEmpty(jsonString))
                {
                    throw new Exception("La respuesta del microservicio está vacía.");
                }

                // Deserializar la respuesta
                return JsonConvert.DeserializeObject<List<Product>>(jsonString);
            }
            catch (Exception ex)
            {
                // Manejo de errores
                throw new Exception("Error al obtener todos los productos: " + ex.Message);
            }
        }

        public Product GetProductById(int id)
        {
            try
            {
                // Enviar un mensaje de NATS al microservicio para obtener un producto por ID
                var jsonRequest = JsonConvert.SerializeObject(id);
                var message = _natsConnection.Request("findOneProducto", System.Text.Encoding.UTF8.GetBytes(jsonRequest));
                var json = message.Data;

                // Convertir byte[] a string
                string jsonString = System.Text.Encoding.UTF8.GetString(json);

                // Verificar que el mensaje no esté vacío
                if (string.IsNullOrEmpty(jsonString))
                {
                    throw new Exception($"La respuesta para el producto con ID {id} está vacía.");
                }

                // Deserializar la respuesta
                return JsonConvert.DeserializeObject<Product>(jsonString);
            }
            catch (Exception ex)
            {
                // Manejo de errores
                throw new Exception("Error al obtener el producto: " + ex.Message);
            }
        }

        public List<ProductStock> GetProductsWithStock()
        {
            try
            {
                // Enviar un mensaje de NATS al microservicio para obtener productos con stock
                var message = _natsConnection.Request("findAllProductosStock", null);
                var json = message.Data;

                // Convertir byte[] a string
                string jsonString = System.Text.Encoding.UTF8.GetString(json);

                // Verificar que el mensaje no esté vacío
                if (string.IsNullOrEmpty(jsonString))
                {
                    throw new Exception("La respuesta del microservicio para productos con stock está vacía.");
                }

                // Deserializar la respuesta
                return JsonConvert.DeserializeObject<List<ProductStock>>(jsonString);
            }
            catch (Exception ex)
            {
                // Manejo de errores
                throw new Exception("Error al obtener productos con stock: " + ex.Message);
            }
        }

        public List<Product> ValidateProducts(List<int> ids)
        {
            try
            {
                // Enviar un mensaje de NATS al microservicio para validar los productos
                var jsonRequest = JsonConvert.SerializeObject(ids);
                var message = _natsConnection.Request("validate_productos", System.Text.Encoding.UTF8.GetBytes(jsonRequest));
                var json = message.Data;

                // Convertir byte[] a string
                string jsonString = System.Text.Encoding.UTF8.GetString(json);

                // Verificar que el mensaje no esté vacío
                if (string.IsNullOrEmpty(jsonString))
                {
                    throw new Exception("La respuesta del microservicio para la validación de productos está vacía.");
                }

                // Deserializar la respuesta
                return JsonConvert.DeserializeObject<List<Product>>(jsonString);
            }
            catch (Exception ex)
            {
                // Manejo de errores
                throw new Exception("Error al validar productos: " + ex.Message);
            }
        }
    }
}
