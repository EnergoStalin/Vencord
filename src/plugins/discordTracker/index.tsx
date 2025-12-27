import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";

export default definePlugin({
    name: "DiscordTracker",
    authors: [Devs.EnergoStalin],
    description: "Add button for opening user with discord-tracker.com",

    contextMenus: {
        "user-context"(children, {user}: { user: { id: string } }) {
            children.push(<Menu.MenuItem id="id" label="Tracker" action={() => window.VencordNative.native.openExternal(`https://discord-tracker.com/tracker/user/${user.id}/`)}/>);
        }
    }
});
