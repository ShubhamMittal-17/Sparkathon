import { use, useEffect, useRef, useState } from "react"
import { CategoryNav } from "../components/category-navigation"
import axios from 'axios';
import { ProductCard } from "../components/product-card";
// import { ProductCard } from "../components/ProductCard";
// import { suggestions } from "../mockData";
// import { addToCart } from "./Cart";
import { useContext } from "react";
import { UserContext } from "../App";
import { CartContext } from "../App";

    


export const HomePage = () => {
    
    

    let [products,setProducts] = useState(null);
    let {userCart,setUserCart} = useContext(CartContext);
    let {userAuth : {access_token}} = useContext(UserContext);
    const [visibleCount, setVisibleCount] = useState(12); 
    const observerRef = useRef(null);

    const getCart = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-cart", {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });

        setUserCart(res.data.cart); // ✅ Correctly extract cart
        
      } catch (err) {
        console.log("Failed to get cart:", err);
      }
    };


    useEffect(()=>{
            if(access_token){
                getCart()
                // console.log(userCart);
            }
            
        },[]); 

     useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Load 8 more items
            setVisibleCount(prev => Math.min(prev + 8, products.length));
          }
        },
        {
          threshold: 1.0,
        }
      );

      const currentRef = observerRef.current;
      if (currentRef) observer.observe(currentRef);

      return () => {
        if (currentRef) observer.unobserve(currentRef);
      };
    }, [visibleCount,  products?.length]);

    let getProducts = async () => {
        await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/all-products")
        .then(({data})=>{
            setProducts(data.products);
        })
        .catch(err=>{
            console.log(err);
        })
    }

    useEffect(()=>{
        getProducts();
    },[])

    return (
        <div>
            <CategoryNav routes={["Electronics","Food","Snacks","Hygiene","Misc"]}>

            <div className="center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 w-fit">
              {
                products == null ? "" :
                products.length ? 
                  products.slice(0, visibleCount).map((product, i) => (
                    <ProductCard key={i} content={product} />
                  )) :
                  <h1>No items</h1>
              }

              {/* Sentinel */}
              {
                visibleCount < products?.length &&
                <div
                    ref={observerRef}
                    className="h-16 w-full mt-8 mb-10 flex justify-center items-center bg-transparent"
                  >
                    <span className="text-gray-500 text-sm"></span>
                </div>
              }

            </div>
          
            

            <></>
            </CategoryNav>
        </div>
    )
}