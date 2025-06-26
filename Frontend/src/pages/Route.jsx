import { GeneratedMap } from "../components/generated_map"

export const RouteMap = () => {

    let items = [[7, 8], [5, 2], [1, 6], [3, 3], [3, 8]]

    return (
        <div className="h-cover">
            <GeneratedMap items={items}/>
        </div>
    )
}