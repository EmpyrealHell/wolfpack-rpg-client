import { TestUtils } from 'src/test/test-utils';
import { CommandCallback, CommandService } from '../command/command-service';
import { WidgetItem } from '../widget/widget-item';
import { ClientDataService } from './client-data-service';

describe('ClientDataService', () => {
  let commandService: jasmine.SpyObj<CommandService>;
  let service: ClientDataService;

  let roleHandler: CommandCallback;

  beforeAll(async () => {
    commandService = TestUtils.spyOnClass(
      CommandService
    ) as unknown as jasmine.SpyObj<CommandService>;
    commandService.subscribeToCommand.and.callFake(
      (group, command, response, result, subscriber, callback) => {
        roleHandler = callback;
        return '';
      }
    );
    service = new ClientDataService(commandService);
  });

  it('should send fetch-client-data command and register a responder', () => {
    service.initialize();
    expect(commandService.subscribeToCommand).toHaveBeenCalled();
    const args = commandService.subscribeToCommand.calls.mostRecent().args;
    expect(args[0]).toBe('client');
    expect(args[1]).toBe('data');
    expect(args[2]).toBe('responses');
    expect(args[3]).toBe('success');
    expect(args[4]).toBe('client-data');
    expect(roleHandler).not.toBeUndefined();
    expect(commandService.sendCommand).toHaveBeenCalledWith(
      'client',
      'data' as never
    );
  });

  it('should update client data in response to fetch-client-data command', () => {
    service.initialize();
    roleHandler(
      '',
      '',
      new Map<string, string>([
        [
          'data',
          '1|Uncommon|#FFFFFF;2|Rare|#6495ED;3|Epic|#9932CC;4|Artifact|#FFA500&1|Warrior;2|Mage;3|Rogue;4|Ranger;5|Cleric&1|Weapon|1;2|Armor|1;3|Trinket|2;4|Other|0&1|Warrior|10||5|2|;2|Mage|2|5||10|;3|Rogue||2|10|5|;4|Ranger|5|10|2||;5|Cleric|2|2|2|2|10&2:1|3:2|4:3|5:4|6:5&5|Legendary|#B22222;4|Epic|#FFA500;3|Rare|#9932CC;2|Uncommon|#6495ED;1|Common|#FFFFFF&|Normal;H|Heroic',
        ],
      ]),
      [new Map<string, string>()],
      Date.now()
    );
    expect(service.itemQualities.size).toBe(4);
    expect(service.itemTypes.size).toBe(5);
    expect(service.itemSlots.size).toBe(4);
    expect(service.classes.size).toBe(5);
    expect(service.equippables.size).toBe(5);
    expect(service.petRarities.size).toBe(5);
    expect(service.dungeonModes.size).toBe(2);
  });
});
