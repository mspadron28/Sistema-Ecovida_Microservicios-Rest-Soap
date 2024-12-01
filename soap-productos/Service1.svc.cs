using System;
using System.Collections.Generic;
using System.Data;
using System.ServiceModel;
using Npgsql;

namespace soap_productos
{
    public class Service1 : IService1
    {
        public List<Product> GetProducts()
        {
            var products = new List<Product>();

            // Configuración de la conexión a PostgreSQL
            var connString = "Host=localhost;Username=ecovida;Password=ecovida;Database=productosdb";

            try
            {
                using (var conn = new NpgsqlConnection(connString))
                {
                    conn.Open();
                    var cmd = new NpgsqlCommand("SELECT id_producto, nombre, precio, stock, imagen_url FROM productos WHERE activo = true", conn);
                    var reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        var product = new Product
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            Price = reader.GetDecimal(2),
                            Stock = reader.GetInt32(3),
                            ImageUrl = reader.IsDBNull(4) ? null : reader.GetString(4)
                        };
                        products.Add(product);
                    }
                }
            }
            catch (Exception ex)
            {
                // Manejo de errores
                Console.WriteLine($"Error al acceder a la base de datos: {ex.Message}");
            }

            return products;
        }
    }
}
