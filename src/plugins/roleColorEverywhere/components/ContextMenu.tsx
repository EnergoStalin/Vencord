/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { toggleRole } from "@plugins/roleColorEverywhere/storeHelper";
import { ColorsStore } from "@plugins/roleColorEverywhere/types";
import { Guild } from "@vencord/discord-types";
import { Menu, openModal } from "@webpack/common";

import { RoleModal } from "./RolesModal";

export function ContextMenu({ colorsStore, guild, roleId, classFactory }: { guild: Guild, roleId: string, colorsStore: ColorsStore, classFactory: ReturnType<typeof classNameFactory> }) {
    const cl = classFactory;
    const togglelabel = (colorsStore[guild.id]?.includes(roleId) ?
        "Remove role from" :
        "Add role to") + " coloring list";

    return (
        <Menu.MenuItem
            id={cl("context-menu")}
            label="Coloring"
        >
            <Menu.MenuItem
                id={cl("toggle-role-for-guild")}
                label={togglelabel}
                action={() => toggleRole(colorsStore, guild.id, roleId)}
            />
            <Menu.MenuItem
                id={cl("show-color-roles")}
                label="Show roles"
                action={() => openModal(modalProps => (
                    <RoleModal
                        colorsStore={colorsStore}
                        modalProps={modalProps}
                        guild={guild}
                    />
                ))}
            />
        </Menu.MenuItem>
    );
}
