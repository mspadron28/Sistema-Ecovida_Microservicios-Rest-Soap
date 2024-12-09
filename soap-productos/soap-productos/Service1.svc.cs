using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace soap_productos
{
    public class Service1 : IService1, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:3000/api/productos";  // URL base del gateway-cliente

        public Service1()
        {
            _httpClient = new HttpClient();
        }

        // Obtener todos los productos (GET /productos)
        public async Task<List<Product>> GetAllProducts()
        {
            return await RequestAndDeserialize<List<Product>>("", null, "Error al obtener todos los productos");
        }

        // Obtener producto por ID (GET /productos/:id)
        public async Task<Product> GetProductById(int id)
        {
            ValidateId(id);
            return await RequestAndDeserialize<Product>($"{id}", null, $"Error al obtener el producto con ID {id}");
        }

        // Obtener productos con stock (GET /productos/stock)
        public async Task<List<Product>> GetProductsWithStock()
        {
            return await RequestAndDeserialize<List<Product>>("stock", null, "Error al obtener productos con stock");
        }

        // Obtener productos con bajo stock (POST /productos/stock-minimo)
        public async Task<List<Product>> FindLowStockProducts(int minStock)
        {
            if (minStock <= 0)
                throw new ArgumentException("El stock mínimo debe ser mayor a cero.");

            var requestPayload = SerializeToJson(new { minStock });
            return await RequestAndDeserialize<List<Product>>("stock-minimo", requestPayload, "Error al obtener productos con bajo stock");
        }

        // Función para validar el ID
        private void ValidateId(int id)
        {
            if (id <= 0)
                throw new ArgumentException("El ID debe ser mayor que cero.");
        }

        // Método genérico para realizar solicitudes HTTP y deserializar la respuesta
        private async Task<T> RequestAndDeserialize<T>(string endpoint, byte[] payload, string errorMessage)
        {
            try
            {
                HttpResponseMessage response = null;

                if (payload == null)
                {
                    // Solicitud GET si no hay payload
                    response = await _httpClient.GetAsync($"{_baseUrl}/{endpoint}");
                }
                else
                {
                    // Solicitud POST si hay payload
                    var content = new StringContent(Encoding.UTF8.GetString(payload), Encoding.UTF8, "application/json");
                    response = await _httpClient.PostAsync($"{_baseUrl}/{endpoint}", content);
                }

                if (!response.IsSuccessStatusCode)
                    throw new Exception($"Error en la solicitud HTTP. Código de estado: {response.StatusCode}");

                var responseContent = await response.Content.ReadAsStringAsync();

                if (string.IsNullOrWhiteSpace(responseContent))
                    throw new Exception("La respuesta está vacía.");

                Log($"Respuesta recibida: {responseContent}");
                return JsonConvert.DeserializeObject<T>(responseContent);
            }
            catch (Exception ex)
            {
                LogError(errorMessage, ex);
                throw new Exception($"{errorMessage}: {ex.Message}");
            }
        }

        // Método para serializar objetos a JSON
        private byte[] SerializeToJson<T>(T obj)
        {
            try
            {
                return Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(obj));
            }
            catch (Exception ex)
            {
                LogError("Error al serializar JSON", ex);
                throw;
            }
        }

        // Métodos de logging
        private void Log(string message) => Console.WriteLine($"[{DateTime.Now}] {message}");
        private void LogError(string message, Exception ex) => Console.WriteLine($"[{DateTime.Now}] ERROR: {message}. Detalles: {ex.Message}");

        // Liberación de recursos
        public void Dispose() => _httpClient?.Dispose();
    }
}
