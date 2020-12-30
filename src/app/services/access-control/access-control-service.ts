import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommandService } from '../command/command-service';
import { WidgetItem } from '../widget/widget-item';
import { WidgetService } from '../widget/widget.service';
import * as RoleData from './access-control.json';

export type UpdateCallback = (newWidgets: WidgetItem[]) => void;

export interface RoleWidgets {
  name: string;
  widgets: RegExp[];
}

/**
 * Service containing the feature management system.
 */
@Injectable({
  providedIn: 'root',
})
export class AccessControlService {
  private userRoles: string[] = [];
  private widgets: WidgetItem[] = [];
  private callback: UpdateCallback | undefined;

  private defaultWidgets: RegExp[] = [];
  private roleData: RoleWidgets[] = [];

  private verifyConfig(): void {
    const invalidWidgets = this.defaultWidgets.filter(
      x => this.widgets.filter(y => y.id.match(x) !== null).length === 0
    );
    if (invalidWidgets.length > 0) {
      throw (
        'Error: Invalid configuration - ' +
        'The following widgets are assigned to the default category but do not exist: ' +
        invalidWidgets.join(', ')
      );
    }
    const invalidRoles = this.roleData.filter(
      roleEntry =>
        roleEntry.widgets.filter(
          x => this.widgets.filter(y => y.id.match(x) !== null).length === 0
        ).length > 0
    );
    if (invalidRoles.length > 0) {
      throw (
        'Error: Invalid configuration - ' +
        'The following roles have invalid widget assignments: ' +
        invalidRoles
          .map(
            x =>
              `${x.name} (${x.widgets
                .filter(
                  y =>
                    this.widgets.filter(z => z.id.match(y) !== null).length > 0
                )
                .join(', ')})`
          )
          .join('\n')
      );
    }
  }

  private getWidgetsForDefault(): string[] {
    const roleData = this.defaultWidgets;
    return this.widgets
      .map(x => x.id)
      .filter(x => roleData.filter(y => x.match(y) !== null).length > 0);
  }

  private getWidgetsForRole(role: string): string[] {
    const roleData = this.roleData.filter(x => x.name === role);
    if (roleData && roleData.length === 1) {
      return this.widgets
        .map(x => x.id)
        .filter(
          x => roleData[0].widgets.filter(y => x.match(y) !== null).length > 0
        );
    }
    return [];
  }

  private handleRoleUpdate(
    name: string,
    id: string,
    group: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    this.userRoles.length = 0;
    for (const match of subGroups) {
      const role = match.get('role');
      if (role) {
        this.userRoles.push(role);
      }
    }
    if (this.callback) {
      this.callback(this.getWidgets());
    }
  }

  constructor(
    private commandService: CommandService,
    private widgetService: WidgetService
  ) {}

  initialize(
    defaultWidgets = RoleData.defaultRole.widgets,
    roleData = RoleData.roles,
    userRoles: string[] = []
  ): void {
    this.defaultWidgets = [];
    for (const widget of defaultWidgets) {
      this.defaultWidgets.push(new RegExp(`^${widget}$`));
    }
    this.roleData = [];
    for (const roleDatum of roleData) {
      const roleData = { name: roleDatum.name, widgets: [] } as RoleWidgets;
      this.roleData.push(roleData);
      for (const widget of roleDatum.widgets) {
        roleData.widgets.push(new RegExp(`^${widget}$`));
      }
    }
    this.userRoles = [...userRoles];
    this.widgets = [...this.widgetService.getWidgets()];
    this.verifyConfig();
    this.commandService.subscribeToCommand(
      'info',
      'checkAccess',
      'responses',
      'success',
      'access-control',
      (name, id, groups, subGroups) =>
        this.handleRoleUpdate(name, id, groups, subGroups)
    );
    this.commandService.sendCommand('info', 'checkAccess');
  }

  getWidgets(
    updateCallback: UpdateCallback | undefined = undefined
  ): WidgetItem[] {
    if (updateCallback) {
      this.callback = updateCallback;
    }
    const widgets = [...this.getWidgetsForDefault()];
    if (this.userRoles.length > 0) {
      for (const role of this.userRoles) {
        widgets.push(...this.getWidgetsForRole(role));
      }
    }
    return this.widgets.filter(x => widgets.indexOf(x.id) !== -1);
  }
}
