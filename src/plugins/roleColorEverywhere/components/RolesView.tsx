/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text } from "@components/Text";
import { classes } from "@utils/misc";
import { RenderModalProps, Role } from "@vencord/discord-types";
import { filters, findBulk, proxyLazyWebpack } from "@webpack";
import { Modal } from "@webpack/common";

const Classes = proxyLazyWebpack(() =>
    Object.assign({}, ...findBulk(
        filters.byProps("role", "pill"),
        filters.byProps("roleCircle", "dotBorderBase", "dotBorderColor"),
        filters.byProps("roleNameOverflow", "root", "roleName", "roleRemoveButton", "roleRemoveButtonCanRemove", "roleRemoveIcon", "roleIcon")
    ))
) as Record<"role" | "pill" | "rolePillBorder" | "desaturateUserColors" | "flex" | "alignCenter" | "justifyCenter" | "svg" | "background" | "dot" | "dotBorderColor" | "roleCircle" | "dotBorderBase" | "flex" | "alignCenter" | "justifyCenter" | "wrap" | "root" | "role" | "roleRemoveButton" | "roleDot" | "roleFlowerStar" | "roleRemoveIcon" | "roleRemoveIconFocused" | "roleVerifiedIcon" | "roleName" | "roleNameOverflow" | "actionButton" | "overflowButton" | "addButton" | "addButtonIcon" | "overflowRolesPopout" | "overflowRolesPopoutArrowWrapper" | "overflowRolesPopoutArrow" | "popoutBottom" | "popoutTop" | "overflowRolesPopoutHeader" | "overflowRolesPopoutHeaderIcon" | "overflowRolesPopoutHeaderText" | "roleIcon" | "roleRemoveButtonCanRemove" | "roleRemoveIcon" | "roleIcon", string>;

export function RoleCard({ onRoleRemove, data, border }: { onRoleRemove: (id: string) => void, data: Role, border: boolean }) {
    const { role, roleRemoveButton, roleRemoveButtonCanRemove, roleRemoveIcon, roleIcon, roleNameOverflow, pill, rolePillBorder, roleCircle, roleName } = Classes;

    return (
        <div className={classes(role, pill, border ? rolePillBorder : null)}>
            <div
                className={classes(roleRemoveButton, roleRemoveButtonCanRemove)}
                onClick={() => onRoleRemove(data.id)}
            >
                <span
                    className={roleCircle}
                    style={{ backgroundColor: data.colorString }}
                />
                <svg
                    role="img"
                    className={roleRemoveIcon}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <path fill="var(--primary-630)" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
                </svg>
            </div>
            <span>
                <img alt="" className={roleIcon} height="16" src={`https://cdn.discordapp.com/role-icons/${data.id}/${data.icon}.webp?size=16&quality=lossless`}/>
            </span>
            <div className={roleName}>
                <Text
                    className={roleNameOverflow}
                    size="xs"
                    weight="medium"
                >
                    {data.name}
                </Text>
            </div>
        </div>
    );
}

export function RoleList({ roleData, onRoleRemove }: { onRoleRemove: (id: string) => void, roleData: Role[] }) {
    const { root } = Classes;

    return (
        <div>
            {!roleData?.length && (
                <span>No roles</span>
            )}

            {roleData?.length !== 0 && (
                <div className={classes(root)}>
                    {roleData.map(data => (
                        <RoleCard
                            key={data.id}
                            data={data}
                            onRoleRemove={onRoleRemove}
                            border={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function RoleModalList({ roleList, header, onRoleRemove, modalProps }: {
    roleList: Role[]
    modalProps: RenderModalProps
    header: string
    onRoleRemove: (id: string) => void
}) {
    return (
        <Modal
            {...modalProps}
            size="sm"
            title={<Text className="vc-role-list-title" size="lg" weight="semibold">{header}</Text>}
        >
            <RoleList
                roleData={roleList}
                onRoleRemove={onRoleRemove}
            />
        </Modal>
    );
}
