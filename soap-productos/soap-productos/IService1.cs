using System.ServiceModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace soap_productos
{
    [ServiceContract]
    public interface IService1
    {
        [OperationContract]
        Task<List<Product>> GetAllProducts();

        [OperationContract]
        Task<Product> GetProductById(int id);

        [OperationContract]
        Task<List<Product>> GetProductsWithStock(); // Retornará lista de productos con stock

        [OperationContract]
        Task<List<Product>> FindLowStockProducts(int minStock); // Cambiado para recibir el stock mínimo
    }

    // Clases de datos ajustadas
    public class Product
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public int IdCategoria { get; set; }
        public bool Status { get; set; }
    }
}
