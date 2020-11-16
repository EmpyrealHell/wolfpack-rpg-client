import { Injectable } from '@angular/core';
import { CommandService } from '../command/command-service';
import { WidgetItem } from '../widget/widget-item';
import { WidgetService } from '../widget/widget.service';
import * as data from './feature-management.json';

export type UpdateCallback = (newWidgets: WidgetItem[]) => void;

/**
 * Service containing the feature management system.
 */
@Injectable({
  providedIn: 'root',
})
export class FeatureManagementService {
  private roles: string[] = [];
  private widgets: WidgetItem[] = [];
  private callback: UpdateCallback | undefined;

  private defaultWidgets: string[] = [];
  private roleWidgets: Map<string, string[]> = new Map<string, string[]>();

  private verifyConfig(): void {
    const invalidWidgets = this.defaultWidgets.filter(
      x => this.widgets.filter(y => y.id.match(x)).length === 0
    );
    if (invalidWidgets.length > 0) {
      throw (
        'Error: Invalid configuration - ' +
        'The following widgets are assigned to the default category but do not exist: ' +
        invalidWidgets.join(', ')
      );
    }
    const roles = Array.from(this.roleWidgets.entries());
    const invalidRoles = roles.filter(
      roleEntry =>
        roleEntry[1].filter(
          x => this.widgets.filter(y => y.id.match(x)).length === 0
        ).length > 0
    );
    if (invalidRoles.length > 0) {
      throw (
        'Error: Invalid configuration - ' +
        'The following roles have invalid widget assignments: ' +
        invalidRoles
          .map(
            x =>
              `${x[0]} (${x[1]
                .filter(y => this.widgets.filter(z => z.id.match(y)))
                .join(', ')})`
          )
          .join('\n')
      );
    }
  }

  private getWidgetsForRole(role: string): string[] {
    const roleData = this.roleWidgets.get(role);
    if (!roleData) {
      return [];
    }
    return this.widgets
      .map(x => x.id)
      .filter(x => roleData.filter(y => x.match(y)));
  }

  private handleRoleUpdate(
    name: string,
    id: string,
    group: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    this.roles.length = 0;
    for (const match of subGroups) {
      const role = match.get('role');
      if (role) {
        this.roles.push(role);
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

  initialize(): void {
    this.defaultWidgets = [...data.defaultRole.widgets];
    data.roles.forEach(x => this.roleWidgets.set(x.name, x.widgets));
    this.widgets.push(...this.widgetService.getWidgets());
    this.verifyConfig();
    this.commandService.subscribeToCommand(
      'info',
      'checkAccess',
      'responses',
      'success',
      'feature-management',
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
    const widgets = [...this.defaultWidgets];
    if (this.roles.length > 0) {
      for (const role of this.roles) {
        widgets.push(...this.getWidgetsForRole(role));
      }
    }
    return this.widgets.filter(x => widgets.indexOf(x.id) !== -1);
  }
}
