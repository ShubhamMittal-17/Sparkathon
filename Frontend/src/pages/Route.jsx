import { GeneratedMap } from "../components/generated_map"

export const RouteMap = () => {

    let items = [[0,2],[2,3],[6,8]]

    return (
        <div className="h-cover">
            <GeneratedMap items={items}/>
        </div>
    )
}