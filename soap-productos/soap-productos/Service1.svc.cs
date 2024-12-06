using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using NATS.Client;

namespace soap_productos
{
    public class Service1 : IService1, IDisposable
    {
        private readonly IConnection _natsConnection;

        public Service1()
        {
            try
            {
                Log("Inicializando conexión a NATS...");
                var options = ConnectionFactory.GetDefaultOptions();
                _natsConnection = new ConnectionFactory().CreateConnection("nats://localhost:4222");
                Log("Conexión a NATS establecida.");
            }
            catch (Exception ex)
            {
                Log($"Error al inicializar la conexión a NATS: {ex.Message}");
                throw;
            }
        }

        public List<Product> GetAllProducts()
        {
            Log("Invocando GetAllProducts...");
            return RequestAndDeserialize<List<Product>>("findAllProductos", null, "Error al obtener todos los productos");
        }

        public Product GetProductById(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("El ID del producto debe ser mayor que cero.");
            }

            Log($"Invocando GetProductById con ID: {id}");
            var requestPayload = SerializeToJson(id);
            return RequestAndDeserialize<Product>("findOneProducto", requestPayload, $"Error al obtener el producto con ID {id}");
        }

        public List<ProductStock> GetProductsWithStock()
        {
            Log("Invocando GetProductsWithStock...");
            return RequestAndDeserialize<List<ProductStock>>("findAllProductosStock", null, "Error al obtener productos con stock");
        }

        public List<Product> ValidateProducts(List<int> ids)
        {
            if (ids == null || ids.Count == 0)
            {
                throw new ArgumentException("La lista de IDs no puede estar vacía.");
            }

            Log($"Invocando ValidateProducts con IDs: {string.Join(", ", ids)}");
            var requestPayload = SerializeToJson(ids);
            return RequestAndDeserialize<List<Product>>("validate_productos", requestPayload, "Error al validar los productos");
        }

        private T RequestAndDeserialize<T>(string topic, byte[] requestPayload, string errorMessage)
        {
            try
            {
                Log($"Enviando solicitud al tema NATS: {topic}");
                if (requestPayload != null)
                {
                    Log($"Payload enviado: {Encoding.UTF8.GetString(requestPayload)}");
                }

                var message = _natsConnection.Request(topic, requestPayload);
                var jsonString = Encoding.UTF8.GetString(message.Data);
                Log($"Respuesta JSON del tema {topic}: {jsonString}");

                if (string.IsNullOrEmpty(jsonString))
                {
                    throw new Exception("La respuesta del microservicio está vacía.");
                }

                return JsonConvert.DeserializeObject<T>(jsonString);
            }
            catch (JsonSerializationException ex)
            {
                Log($"Error de deserialización JSON: {ex.Message}");
                throw new Exception($"{errorMessage}: Respuesta inválida.");
            }
            catch (Exception ex)
            {
                Log($"Error: {errorMessage} - {ex.Message}");
                throw new Exception($"{errorMessage}: {ex.Message}");
            }
        }

        private byte[] SerializeToJson<T>(T obj)
        {
            var jsonString = JsonConvert.SerializeObject(obj);
            Log($"Serializando objeto a JSON: {jsonString}");
            return Encoding.UTF8.GetBytes(jsonString);
        }

        private void Log(string message)
        {
            Console.WriteLine($"[{DateTime.Now}] {message}");
        }

        public void Dispose()
        {
            Log("Liberando recursos...");
            _natsConnection?.Dispose();
        }
    }
}
