import { TestUtils } from 'src/test/test-utils';
import { CommandService } from '../command/command-service';
import { WidgetItem } from '../widget/widget-item';
import { WidgetService } from '../widget/widget.service';
import { FeatureManagementService } from './feature-management-service';
import * as data from './feature-management.json';

describe('FeatureManagementService', () => {
  let commandService: CommandService;
  let widgetService: jasmine.SpyObj<WidgetService>;
  let service: FeatureManagementService;

  beforeAll(async () => {
    commandService = (TestUtils.spyOnClass(
      CommandService
    ) as unknown) as jasmine.SpyObj<CommandService>;
    widgetService = (TestUtils.spyOnClass(
      WidgetService
    ) as unknown) as jasmine.SpyObj<WidgetService>;
    widgetService.getWidgets.and.returnValue([
      new WidgetItem(null, 'Console Widget', 'console', 'consoleicon'),
    ]);
    service = new FeatureManagementService(commandService, widgetService);
    service.initialize();
  });

  it('should get default widget ids when no role has been assigned', () => {
    const widgets = service.getWidgets();
    const defaultWidgets = data.defaultRole.widgets;
    for (const widget of widgets) {
      expect(defaultWidgets.filter(x => x === widget.id).length).toBe(1);
    }
    for (const widget of defaultWidgets) {
      expect(widgets.filter(x => x.id === widget).length).toBe(1);
    }
  });
});
