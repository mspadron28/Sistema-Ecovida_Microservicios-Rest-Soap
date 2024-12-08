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
        private readonly string _baseUrl = "http://localhost:3000";  // URL base del microservicio de productos

        public Service1()
        {
            _httpClient = new HttpClient();
        }

        public async Task<List<Product>> GetAllProducts()  // Cambiado a Task<List<Product>>
        {
            return await RequestAndDeserialize<List<Product>>("api/productos/findAll", null, "Error al obtener todos los productos");
        }

        public async Task<Product> GetProductById(int id)  // Cambiado a Task<Product>
        {
            ValidateId(id);
            var requestPayload = SerializeToJson(id);
            return await RequestAndDeserialize<Product>("api/productos/findOne", requestPayload, $"Error al obtener el producto con ID {id}");
        }

        public async Task<List<ProductStock>> GetProductsWithStock()  // Cambiado a Task<List<ProductStock>>
        {
            return await RequestAndDeserialize<List<ProductStock>>("api/productos/findAllStock", null, "Error al obtener productos con stock");
        }

        public async Task<List<Product>> ValidateProducts(List<int> ids)  // Cambiado a Task<List<Product>>
        {
            if (ids == null || ids.Count == 0)
                throw new ArgumentException("La lista de IDs no puede estar vacía.");

            var requestPayload = SerializeToJson(ids);
            return await RequestAndDeserialize<List<Product>>("api/productos/validate", requestPayload, "Error al validar los productos");
        }

        private void ValidateId(int id)
        {
            if (id <= 0) throw new ArgumentException("El ID debe ser mayor que cero.");
        }

        private async Task<T> RequestAndDeserialize<T>(string url, byte[] payload, string errorMessage)
        {
            try
            {
                HttpResponseMessage response = null;

                if (payload == null)
                {
                    // Si no hay payload, hacemos una solicitud GET
                    response = await _httpClient.GetAsync($"{_baseUrl}/{url}");
                }
                else
                {
                    // Si hay payload, hacemos una solicitud POST
                    var content = new StringContent(Encoding.UTF8.GetString(payload), Encoding.UTF8, "application/json");
                    response = await _httpClient.PostAsync($"{_baseUrl}/{url}", content);
                }

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Error en la solicitud HTTP. Código de estado: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();

                if (string.IsNullOrWhiteSpace(responseContent))
                    throw new Exception("La respuesta está vacía.");

                Log($"Respuesta recibida: {responseContent}"); // Agregar log para depuración

                return JsonConvert.DeserializeObject<T>(responseContent);
            }
            catch (Exception ex)
            {
                LogError(errorMessage, ex);
                throw new Exception($"{errorMessage}: {ex.Message}");
            }
        }

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

        private void Log(string message) => Console.WriteLine($"[{DateTime.Now}] {message}");
        private void LogError(string message, Exception ex) => Console.WriteLine($"[{DateTime.Now}] ERROR: {message}. Detalles: {ex.Message}");

        public void Dispose() => _httpClient?.Dispose();
    }
}
