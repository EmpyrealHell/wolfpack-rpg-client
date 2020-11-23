import { TestUtils } from 'src/test/test-utils';
import { CommandCallback, CommandService } from '../command/command-service';
import { WidgetItem } from '../widget/widget-item';
import { WidgetService } from '../widget/widget.service';
import { AccessControlService } from './access-control-service';
import * as AccessControlData from './access-control.json';

describe('AccessControlService', () => {
  const defaultRole = ['console'];
  const roleData = [
    {
      name: 'UIDeveloper',
      widgets: ['.*'],
    },
    {
      name: 'foobar',
      widgets: ['foo', 'bar'],
    },
  ];
  let commandService: jasmine.SpyObj<CommandService>;
  let widgetService: jasmine.SpyObj<WidgetService>;
  let service: AccessControlService;

  let roleHandler: CommandCallback;

  beforeAll(async () => {
    commandService = (TestUtils.spyOnClass(
      CommandService
    ) as unknown) as jasmine.SpyObj<CommandService>;
    commandService.subscribeToCommand.and.callFake(
      (group, command, response, result, subscriber, callback) => {
        roleHandler = callback;
        return '';
      }
    );
    widgetService = (TestUtils.spyOnClass(
      WidgetService
    ) as unknown) as jasmine.SpyObj<WidgetService>;
    widgetService.getWidgets.and.returnValue([
      new WidgetItem(null, 'Console Widget', 'console', 'consoleicon'),
      new WidgetItem(null, 'Foo', 'foo', 'fooicon'),
      new WidgetItem(null, 'Bar', 'bar', 'baricon'),
      new WidgetItem(null, 'Foobar', 'foo.bar', 'baricon'),
    ]);
    service = new AccessControlService(commandService, widgetService);
  });

  it('should get default widget ids when no role has been assigned', () => {
    service.initialize(defaultRole, roleData);
    const widgets = service.getWidgets();
    const defaultWidgets = AccessControlData.defaultRole.widgets;
    for (const widget of widgets) {
      expect(defaultWidgets.filter(x => x === widget.id).length).toBe(1);
    }
    for (const widget of defaultWidgets) {
      expect(widgets.filter(x => x.id === widget).length).toBe(1);
    }
  });

  it('should get widgets for assigned roles', () => {
    service.initialize(defaultRole, roleData, ['UIDeveloper']);
    const widgets = service.getWidgets();
    expect(widgets.length).toBe(4);
    expect(widgets.filter(x => x.id === 'console').length).toBe(1);
    expect(widgets.filter(x => x.id === 'foo').length).toBe(1);
    expect(widgets.filter(x => x.id === 'bar').length).toBe(1);
    expect(widgets.filter(x => x.id === 'foo.bar').length).toBe(1);
  });

  it('should inheret default widgets for non-default roles', () => {
    service.initialize(defaultRole, roleData, ['foobar']);
    const widgets = service.getWidgets();
    expect(widgets.length).toBe(3);
    expect(widgets.filter(x => x.id === 'console').length).toBe(1);
    expect(widgets.filter(x => x.id === 'foo').length).toBe(1);
    expect(widgets.filter(x => x.id === 'bar').length).toBe(1);
  });

  it('should throw an exception when default role has a non-existent widget', () => {
    expect(
      service.initialize.bind(service, ['invalid.widget'], roleData)
    ).toThrow();
  });

  it('should throw an exception when a non-default role has a non-existent widget', () => {
    expect(
      service.initialize.bind(service, defaultRole, [
        { name: 'invalid-role', widgets: ['invalid.widget'] },
      ])
    ).toThrow();
  });

  it('should send checkaccess command and register a responder', () => {
    service.initialize();
    expect(commandService.subscribeToCommand).toHaveBeenCalled();
    const args = commandService.subscribeToCommand.calls.mostRecent().args;
    expect(args[0]).toBe('info');
    expect(args[1]).toBe('checkAccess');
    expect(args[2]).toBe('responses');
    expect(args[3]).toBe('success');
    expect(args[4]).toBe('access-control');
    expect(roleHandler).not.toBeUndefined();
    expect(commandService.sendCommand).toHaveBeenCalledWith(
      'info',
      'checkAccess'
    );
  });

  it('should update role in response to checkaccess command', () => {
    service.initialize(defaultRole, roleData);
    roleHandler('', '', new Map<string, string>(), [
      new Map<string, string>([['role', 'foobar']]),
    ]);
    const widgets = service.getWidgets();
    expect(widgets.length).toBe(3);
    expect(widgets.filter(x => x.id === 'console').length).toBe(1);
    expect(widgets.filter(x => x.id === 'foo').length).toBe(1);
    expect(widgets.filter(x => x.id === 'bar').length).toBe(1);
  });

  it('should call callback when roles are updated', () => {
    service.initialize(defaultRole, roleData);
    let afterUpdateWidgets: WidgetItem[] = [];
    const updateCallback = (newWidgets: WidgetItem[]) => {
      afterUpdateWidgets = [...newWidgets];
    };
    const initialWidgets = service.getWidgets(updateCallback);
    roleHandler('', '', new Map<string, string>(), [
      new Map<string, string>([['role', 'foobar']]),
    ]);
    expect(afterUpdateWidgets.length).toBe(3);
    expect(afterUpdateWidgets.filter(x => x.id === 'console').length).toBe(1);
    expect(afterUpdateWidgets.filter(x => x.id === 'foo').length).toBe(1);
    expect(afterUpdateWidgets.filter(x => x.id === 'bar').length).toBe(1);
  });
});
