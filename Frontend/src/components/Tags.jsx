

export const Tags = ({tag})=>{
    const returnTag = ()=>{
        switch(tag){
            case "best seller" :
                return <BestSeller/>
            case "reduced price" :
                return <ReducedPrice/>
            case "clearance":
                return <Clearance/>
            default :
                return null
        }
    }
    return (
        <>
        {returnTag()}
        </>
    )
}


const BestSeller = ()=>{
    return (
        <div className="text-blue-700 bg-blue-200 rounded-2xl text-xs p-1 font-bold">
        Best Seller
    </div>
    )
}

const ReducedPrice = ()=>{
    return (
        <div className="text-blue-700 border-2 rounded-2xl text-xs p-1 font-bold">
        Reduced Price
    </div>
    )
}

const Clearance = ()=>{
    return (
        <div className="text-blue-950 bg-yellow-300 rounded-2xl text-xs p-1 font-bold">
        Clearance
    </div>
    )
}