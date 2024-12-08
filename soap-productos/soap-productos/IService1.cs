using System.ServiceModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace soap_productos
{
    [ServiceContract]
    public interface IService1
    {
        [OperationContract]
        Task<List<Product>> GetAllProducts();  // Cambiado a Task<List<Product>>

        [OperationContract]
        Task<Product> GetProductById(int id);  // Cambiado a Task<Product>

        [OperationContract]
        Task<List<ProductStock>> GetProductsWithStock();  // Cambiado a Task<List<ProductStock>>

        [OperationContract]
        Task<List<Product>> ValidateProducts(List<int> ids);  // Cambiado a Task<List<Product>>
    }

    // Clases de datos (ajustadas a la estructura de producto)
    public class Product
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public int IdCategoria { get; set; }
        public bool Status { get; set; } // Cambiado 'Activo' a 'Status'
    }

    public class ProductStock
    {
        public string Nombre { get; set; }
        public int Stock { get; set; }
    }
}
