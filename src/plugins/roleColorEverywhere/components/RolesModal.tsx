/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { toggleRole } from "@plugins/roleColorEverywhere/storeHelper";
import { Guild, RenderModalProps } from "@vencord/discord-types";
import { GuildRoleStore, React } from "@webpack/common";

import { RoleModalList } from "./RolesView";

export function RoleModal({ modalProps, guild, colorsStore }: { modalProps: RenderModalProps, guild: Guild, colorsStore: Record<string, string[]> }) {
    const [ids, setIds] = React.useState(colorsStore[guild.id]);
    const roles = React.useMemo(() => ids.map(id => GuildRoleStore.getRole(guild.id, id)), [ids]);

    return <RoleModalList
        modalProps={modalProps}
        roleList={roles}
        header={`${guild.name} highlighted roles.`}
        onRoleRemove={id => {
            toggleRole(colorsStore, guild.id, id);
            setIds(colorsStore[guild.id]);
        }}
    />;
}
