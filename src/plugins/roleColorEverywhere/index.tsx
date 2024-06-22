/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { getUserSettingLazy } from "@api/UserSettings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { getCurrentGuild } from "@utils/discord";
import { ModalProps, openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { ChannelStore, GuildMemberStore, GuildStore, Menu, React } from "@webpack/common";
import { Guild } from "discord-types/general";

import { blendColors } from "./blendColors";
import { RoleModalList } from "./components/RolesView";

const cl = classNameFactory("rolecolor");
const DeveloperMode = getUserSettingLazy("appearance", "developerMode")!;

const settings = definePluginSettings({
    chatMentions: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show role colors in chat mentions (including in the message box)",
        restartNeeded: true
    },
    memberList: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show role colors in member list role headers",
        restartNeeded: true
    },
    voiceUsers: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show role colors in the voice chat user list",
        restartNeeded: true
    },
    reactorsList: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show role colors in the reactors list",
    },
}).withPrivateSettings<{
    userColorFromRoles: Record<string, string[]>
}>();

function atLeastOneOverrideAppliesToGuild(overrides: string[], guildId: string) {
    for (const role of overrides) {
        if (GuildStore.getRole(guildId, role)) {
            return true;
        }
    }

    return false;
}

function getPrimaryRoleOverrideColor(roles: string[], guildId: string) {
    const overrides = settings.store.userColorFromRoles[guildId];
    if (!overrides?.length) return null;

    if (atLeastOneOverrideAppliesToGuild(overrides, guildId!)) {
        const memberRoles = roles.map(role => GuildStore.getRole(guildId!, role)).filter(e => e);
        const blendColorsFromRoles = memberRoles
            .filter(role => overrides.includes(role.id))
            .sort((a, b) => b.color - a.color);

        // if only one override apply, return the first role color
        if (blendColorsFromRoles.length < 2)
            return blendColorsFromRoles[0]?.colorString ?? null;

        const color = blendColorsFromRoles
            .slice(1)
            .reduce(
                (p, c) => blendColors(p, c!.colorString!, .5),
                blendColorsFromRoles[0].colorString!
            );

        return color;
    }

    return null;
}

// Using plain replaces cause i dont want sanitize regexp
function toggleRole(guildId: string, id: string) {
    let roles = settings.store.userColorFromRoles[guildId];
    const len = roles.length;

    roles = roles.filter(e => e !== id);

    if (len === roles.length) {
        roles.push(id);
    }

    settings.store.userColorFromRoles[guildId] = roles;
}

function RoleModal({ modalProps, guild }: { modalProps: ModalProps, guild: Guild }) {
    const [ids, setIds] = React.useState(settings.store.userColorFromRoles[guild.id]);
    const roles = React.useMemo(() => ids.map(id => GuildStore.getRole(guild.id, id)), [ids]);

    return <RoleModalList
        modalProps={modalProps}
        roleList={roles}
        header={`${guild.name} highlighted roles.`}
        onRoleRemove={id => {
            toggleRole(guild.id, id);
            setIds(settings.store.userColorFromRoles[guild.id]);
        }}
    />;
}

export default definePlugin({
    name: "RoleColorEverywhere",
    authors: [Devs.KingFish, Devs.lewisakura, Devs.AutumnVN, Devs.EnergoStalin],
    description: "Adds the top role color anywhere possible",
    patches: [
        // Chat Mentions
        {
            find: 'location:"UserMention',
            replacement: [
                {
                    match: /onContextMenu:\i,color:\i,\.\.\.\i(?=,children:)(?<=user:(\i),channel:(\i).{0,500}?)/,
                    replace: "$&,color:$self.getUserColor($1?.id,{channelId:$2?.id})"
                }
            ],
            predicate: () => settings.store.chatMentions,
        },
        // Slate
        {
            find: ".userTooltip,children",
            replacement: [
                {
                    match: /let\{id:(\i),guildId:(\i)[^}]*\}.*?\.\i,{(?=children)/,
                    replace: "$&color:$self.getUserColor($1,{guildId:$2}),"
                }
            ],
            predicate: () => settings.store.chatMentions,
        },
        {
            find: 'tutorialId:"whos-online',
            replacement: [
                {
                    match: /null,\i," — ",\i\]/,
                    replace: "null,$self.roleGroupColor(arguments[0])]"
                },
            ],
            predicate: () => settings.store.memberList,
        },
        {
            find: ".Messages.THREAD_BROWSER_PRIVATE",
            replacement: [
                {
                    match: /children:\[\i," — ",\i\]/,
                    replace: "children:[$self.roleGroupColor(arguments[0])]"
                },
            ],
            predicate: () => settings.store.memberList,
        },
        {
            find: "renderPrioritySpeaker",
            replacement: [
                {
                    match: /renderName\(\){.+?usernameSpeaking\]:.+?(?=children)/,
                    replace: "$&...$self.getVoiceProps(this.props),"
                }
            ],
            predicate: () => settings.store.voiceUsers,
        },
        {
            find: ".reactorDefault",
            replacement: {
                match: /,onContextMenu:e=>.{0,15}\((\i),(\i),(\i)\).{0,250}tag:"strong"/,
                replace: "$&,style:{color:$self.getColor($2?.id,$1)}"
            },
            predicate: () => settings.store.reactorsList,
        }
    ],
    settings,

    start() {
        DeveloperMode.updateSetting(true);

        settings.store.userColorFromRoles ??= {};
    },

    getColor(userId: string, { channelId, guildId }: { channelId?: string; guildId?: string; }) {
        if (!(guildId ??= ChannelStore.getChannel(channelId!)?.guild_id)) return null;
        const member = GuildMemberStore.getMember(guildId, userId);

        if (!member) {
            return null;
        }

        return getPrimaryRoleOverrideColor(member.roles, guildId) ?? member.colorString;
    },

    getUserColor(userId: string, ids: { channelId?: string; guildId?: string; }) {
        const colorString = this.getColor(userId, ids);
        return colorString && parseInt(colorString.slice(1), 16);
    },

    roleGroupColor: ErrorBoundary.wrap(({ id, count, title, guildId, label }: { id: string; count: number; title: string; guildId: string; label: string; }) => {
        const role = GuildStore.getRole(guildId, id);

        return (
            <span style={{
                color: role?.colorString,
                fontWeight: "unset",
                letterSpacing: ".05em"
            }}>
                {title ?? label} &mdash; {count}
            </span>
        );
    }, { noop: true }),

    getVoiceProps({ user: { id: userId }, guildId }: { user: { id: string; }; guildId: string; }) {
        return {
            style: {
                color: this.getColor(userId, { guildId })
            }
        };
    },

    contextMenus: {
        "dev-context"(children, { id }: { id: string; }) {
            const guild = getCurrentGuild();
            if (!guild) return;

            settings.store.userColorFromRoles[guild.id] ??= [];

            const role = GuildStore.getRole(guild.id, id);
            if (!role) return;

            const togglelabel = (settings.store.userColorFromRoles[guild.id]?.includes(role.id) ?
                "Remove role from" :
                "Add role to") + " coloring list";

            if (role.colorString) {
                children.push(
                    <Menu.MenuItem
                        id={cl("context-menu")}
                        label="Coloring"
                    >
                        <Menu.MenuItem
                            id={cl("toggle-role-for-guild")}
                            label={togglelabel}
                            action={() => toggleRole(guild.id, role.id)}
                        />
                        <Menu.MenuItem
                            id={cl("show-color-roles")}
                            label="Show roles"
                            action={() => openModal(modalProps => (
                                <RoleModal
                                    modalProps={modalProps}
                                    guild={guild}
                                />
                            ))}
                        />
                    </Menu.MenuItem>
                );
            }
        }
    }
});
