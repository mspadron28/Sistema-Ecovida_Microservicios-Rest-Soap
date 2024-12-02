using System.ServiceModel;
using System.Collections.Generic;

namespace soap_productos
{
    [ServiceContract]
    public interface IService1
    {
        [OperationContract]
        List<Product> GetAllProducts();

        [OperationContract]
        Product GetProductById(int id);

        [OperationContract]
        List<ProductStock> GetProductsWithStock();

        [OperationContract]
        List<Product> ValidateProducts(List<int> ids);
    }

    // Define el modelo de Producto
    public class Product
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public int IdCategoria { get; set; }
        public string ImagenUrl { get; set; }
        public bool Activo { get; set; }
    }

    // Define el modelo para productos con stock
    public class ProductStock
    {
        public string Nombre { get; set; }
        public int Stock { get; set; }
    }
}
