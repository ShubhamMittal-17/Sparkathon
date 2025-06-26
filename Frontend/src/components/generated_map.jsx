import { useEffect, useState } from "react"


export const GeneratedMap = ({items}) => {

    let [mapUrl,setMapUrl] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/path_image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items }),
        })
          .then((res) => res.blob())
          .then((blob) => {
            setMapUrl(URL.createObjectURL(blob));
            console.log(mapUrl);
            // console.log("Map URL",mapUrl)
          });
    }, [items]);

    return(
        <div className="center w-fit">
            <h2 className="block w-fit center">Navigation Path</h2>
            {
                mapUrl == null? "":
                <img className="w-[500px] h-[500px]" src={mapUrl} alt="Navigation path" />
            }
        </div>
    )
}