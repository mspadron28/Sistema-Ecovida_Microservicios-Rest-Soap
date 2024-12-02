using System.Collections.Generic;
using System.ServiceModel;
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
        Task<List<ProductStock>> GetAllProductsWithStock();
    }
}
