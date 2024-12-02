using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace soap_productos
{
    public class Service1 : IService1
    {
        private readonly HttpClient _httpClient;

        public Service1()
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:3000/productos/") // URL del microservicio de productos
            };
        }

        public async Task<List<Product>> GetAllProducts()
        {
            var response = await _httpClient.GetAsync("");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Product>>(jsonResponse);
        }

        public async Task<Product> GetProductById(int id)
        {
            var response = await _httpClient.GetAsync($"{id}");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Product>(jsonResponse);
        }

        public async Task<List<ProductStock>> GetAllProductsWithStock()
        {
            var response = await _httpClient.GetAsync("stock");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<ProductStock>>(jsonResponse);
        }
    }

    public class Product
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string ImagenUrl { get; set; }
        public bool Activo { get; set; }
    }

    public class ProductStock
    {
        public string Nombre { get; set; }
        public int Stock { get; set; }
    }
}
