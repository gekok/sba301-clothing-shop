import axios from "axios";
import React, { useState, useEffect } from 'react';

function ProductList(){
    const [products, setProducts] = useState([

    ]);
    const [loading, setLoading] = useState(true);

    // gọi api
    useEffect(() => {
        axios.get('http://localhost:8080/api/products')
        .then((response) => {
            setProducts(response.data);
            setLoading(false);
            console.log(response.data);
        }).catch((error) => {
            console.error("lỗi kết nối API: ", error);
            setLoading(false);
        });
    }, []);
    const DeleteProduct = (id) => {};
    const EditProduct = (id) => {};
    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="container">
            <h2 className="text-center">Danh Sách Sản Phẩm</h2>
            {products.length === 0 ? (
                <div className="text-center">Hiện của hàng chưa có sản phẩm nào!</div>
            ):(
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Base Price</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.brand}</td>
                                <td>{product.basePrice}</td>
                                <td>{product.slug}</td>
                                <td>{product.description}</td>
                                <td>
                                    <span className={`badge ${product.status === 'ACTIVE' ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={()=>EditProduct(product.id)}>Edit</button>
                                    <button onClick={()=>DeleteProduct(product.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
export default ProductList;